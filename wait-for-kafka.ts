#! /usr/bin/env node
import {KafkaClient, Consumer, Producer} from 'kafka-node';
import bluebird from 'bluebird';
import {wait_for_topics, ensure_topics} from './lib';
const debug = require('debug')('showcase:ensure-kafka-topics:debug');

// setup kafka
bluebird.promisifyAll(KafkaClient);
const client = new KafkaClient({kafkaHost: process.env.KAFKA_URL});

var tasks_to_finish = 2;

function finish_task() {
    tasks_to_finish--;
    if(tasks_to_finish === 0) {
        process.exit(0);
    }
}

/////////////////////////////////////// WAIT FOR TOPICS

const wait_for_topics_raw = process.env.KAFKA_WAIT_FOR_TOPICS;
const abort_after_tries = process.env.ABORT_AFTER_TRIES || 10;
const wait_between_tries_s = process.env.WAIT_BETWEEN_TRIES_S || 5;

if(wait_for_topics_raw) {
    const topics = wait_for_topics_raw.split(",").map(x => x.trim());
    wait_for_topics(client, topics, abort_after_tries, wait_between_tries_s)
        .then(success => {
            if(!success) {
                console.error("Timeout waiting for one of the topics:", topics);
                process.exit(1);
            } else {
                debug("Following topics do exist:", topics);
                finish_task();
            }
        });
} else {
    finish_task();
}

//////////////////////////////////// ENSURE KAFKA TOPICS

const ensure_topics_raw  = process.env.KAFKA_ENSURE_TOPICS;

if(ensure_topics_raw) {
    const topics = JSON.parse(ensure_topics_raw);
    ensure_topics(client, topics).then(success => {
        if(!success) {
            console.error('Error ensuring existence of topics');
            process.exit(2);
        } else {
            debug("Ensured, that following topics do exist:", topics);
            finish_task();
        }
    });
} else {
    finish_task();
}
