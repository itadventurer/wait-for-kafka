#! /usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var kafka_node_1 = require("kafka-node");
var bluebird_1 = __importDefault(require("bluebird"));
var lib_1 = require("./lib");
var debug = require('debug')('showcase:ensure-kafka-topics:debug');
// setup kafka
bluebird_1.default.promisifyAll(kafka_node_1.KafkaClient);
var client = new kafka_node_1.KafkaClient({ kafkaHost: process.env.KAFKA_URL });
var tasks_to_finish = 2;
function finish_task() {
    tasks_to_finish--;
    if (tasks_to_finish === 0) {
        process.exit(0);
    }
}
/////////////////////////////////////// WAIT FOR TOPICS
var wait_for_topics_raw = process.env.KAFKA_WAIT_FOR_TOPICS;
var abort_after_tries = process.env.ABORT_AFTER_TRIES || 10;
var wait_between_tries_s = process.env.WAIT_BETWEEN_TRIES_S || 5;
if (wait_for_topics_raw) {
    var topics_1 = wait_for_topics_raw.split(",").map(function (x) { return x.trim(); });
    lib_1.wait_for_topics(client, topics_1, abort_after_tries, wait_between_tries_s)
        .then(function (success) {
        if (!success) {
            console.error("Timeout waiting for one of the topics:", topics_1);
            process.exit(1);
        }
        else {
            debug("Following topics do exist:", topics_1);
            finish_task();
        }
    });
}
else {
    finish_task();
}
//////////////////////////////////// ENSURE KAFKA TOPICS
var ensure_topics_raw = process.env.KAFKA_ENSURE_TOPICS;
if (ensure_topics_raw) {
    var topics_2 = JSON.parse(ensure_topics_raw);
    lib_1.ensure_topics(client, topics_2).then(function (success) {
        if (!success) {
            console.error('Error ensuring existence of topics');
            process.exit(2);
        }
        else {
            debug("Ensured, that following topics do exist:", topics_2);
            finish_task();
        }
    });
}
else {
    finish_task();
}
