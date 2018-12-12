#! /usr/bin/env node
import {KafkaClient, Consumer, Producer} from 'kafka-node';
import bluebird from 'bluebird';
import {wait_for_topics, ensure_topics} from './lib';
const debug = require('debug')('wait-for-kafka:debug');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function client_once(client, ev) {
    return new Promise(resolve => client.once(ev, resolve));
}
function client_getApiVersions(client) {
    return new Promise(resolve => client.loadMetadataForTopics([], resolve));
}
function client_load_metadata(client) {
    return new Promise(resolve => client.loadMetadataForTopics([], resolve));
}

// setup kafka
bluebird.promisifyAll(KafkaClient);

async function try_to_connect(kafka_url, abort_after_tries, wait_between_tries_s) {
    var tries_left = abort_after_tries;
    while(tries_left > 0) {
        try {
            const client = new KafkaClient({kafkaHost: kafka_url});
            debug("created client waiting to connect");
            await client_once(client, 'connect');
            await client_load_metadata(client);
            debug("connected");
            return client;
        } catch(e) {
            debug("Could still not connect to kafka",e.message);
        }
        tries_left--;
        await sleep(wait_between_tries_s * 1000);
    }
    throw new Error("Failed to connect to Kafka");
}

export default function wait_for_kafka(kafka_url, wait_for_topics_list:string[]|null = null, ensure_topics_list:object[]|null = null, abort_after_tries = 10, wait_between_tries_s = 5) {
    return new Promise((orig_resolve,orig_reject) => {
        try_to_connect(kafka_url, abort_after_tries, wait_between_tries_s).then(client => {

            var tasks_to_finish = 2;

            const resolve = function() {
                tasks_to_finish--;
                if(tasks_to_finish === 0) {
                    client.close();
                    orig_resolve();
                }
            };
            const reject = function(a) {
                client.close();
                orig_reject(a)
            };

            /////////////////////////////////////// WAIT FOR TOPICS

            if(wait_for_topics_list) {
                wait_for_topics(client, wait_for_topics_list, abort_after_tries, wait_between_tries_s)
                    .then(success => {
                        if(!success) {
                            reject("Timeout waiting for one of the topics:" + wait_for_topics_list);
                        } else {
                            debug("Following topics do exist:", wait_for_topics_list);
                            resolve();
                        }
                    });
            } else {
                resolve();
            }

            //////////////////////////////////// ENSURE KAFKA TOPICS

            if(ensure_topics_list) {
                ensure_topics(client, ensure_topics_list).then(success => {
                    if(!success) {
                        reject('Error ensuring existence of topics' + ensure_topics_list);
                    } else {
                        debug("Ensured, that following topics do exist:", ensure_topics_list);
                        resolve();
                    }
                });
            } else {
                resolve();
            }
        }).catch(orig_reject);
    });
};

if (require.main === module) {
    var abort_after_tries = 10;
    if(process.env.ABORT_AFTER_TRIES) {
        abort_after_tries = parseInt(process.env.ABORT_AFTER_TRIES);
    }
    var wait_between_tries_s = 5;
    if(process.env.WAIT_BETWEEN_TRIES_S) {
        wait_between_tries_s = parseInt(process.env.WAIT_BETWEEN_TRIES_S);
    }

    const kafka_url = process.env.KAFKA_BOOTSTRAP_SERVERS;

    const wait_for_topics_raw = process.env.WAIT_FOR_KAFKA_TOPICS;
    var wait_for_topics_list:string[]|null = null;
    if(wait_for_topics_raw) {
        wait_for_topics_list = wait_for_topics_raw.split(",").map(x => x.trim());
    }

    const ensure_topics_raw = process.env.ENSURE_KAFKA_TOPICS;
    var ensure_topics_list:object[]|null = null;
    if(ensure_topics_raw) {
        ensure_topics_list = JSON.parse(ensure_topics_raw);
    }
    wait_for_kafka(kafka_url, wait_for_topics_list, ensure_topics_list, abort_after_tries, wait_between_tries_s)
        .then(() => process.exit(0))
        .catch(e => {
            console.error("Error:", e);
            process.exit(1);
        });
}
