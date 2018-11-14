const debug = require('debug')('wait-for-kafka:debug');
const error = require('debug')('wait-for-kafka:error');

async function doesTopicsExists(client, topics: string[]) {
    try {
        await client.topicExistsAsync(topics);
        return true;
    } catch(e) {
        if(e.constructor.name === 'TopicsNotExistError' || e.constructor.name === 'BrokerNotAvailableError') {
            return false;
        } else {
            throw e
        }

    }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function wait_for_topics(client, topics, abort_after_tries, wait_between_tries_s) {
    var tries = 0;
    while(tries < abort_after_tries) {
        const exists = await doesTopicsExists(client, topics);
        if(exists  === true) {
            return true;
        } else {
            debug("One of the topics still does not exist:", topics);
        }
        tries++;
        await sleep(wait_between_tries_s * 1000);
    }
    return false;
}


export async function ensure_topics(client, topics:object[]) {
    const topics_to_create = new Array();
    for(const i in topics) {
        const topic = topics[i];
        const exists = await doesTopicsExists(client, [topic['topic']]);
        if(!exists) {
            topics_to_create.push(topic);
        }
    }
    //@ts-ignore
    const results = await client.createTopicsAsync(topics_to_create);
    for(const i in results) {
        const result = results[i];
        if(result['error']) {
            error('Error creating topic', result);
            return false;
        }
    }
    return true;
}
