# Ensure existence of Kafka Topics

Install: `npm install -g wait-for-kafka`

This program is able to perform following operations:

1. Waiting for a set of Kafka topics to become available
2. Creating new topics in the case they are not existent

# Configuration

Set following environment variables:

* `KAFKA_URL`: Kafka-url.

## Debug settings

* `DEBUG="showcase:*"` all debug outputs for this program
* `DEBUG="*"` all debug outputs for this program and for `kafka-node`
* `unset DEBUG` no debug outputs

## Waiting for a set of Kafka topics to become available

* `KAFKA_WAIT_FOR_TOPICS`: comma separated list of topics to wait for
  becoming available
* `ABORT_AFTER_TRIES` (optional, default: `10`): After how many checks
  should the program abort?
* `WAIT_BETWEEN_TRIES_S` (optional, default: `5`): How many seconds
  should the program wait before trying again?

## Creating new topics in the case they are not existent

* `KAFKA_ENSURE_TOPICS`: An JSON array containing objects that get
  passed to the `createTopics` function of `kafka-node`.

  Example:
  ```json
  [{
    "topic": "topic1",
    "partitions": 1,
    "replicationFactor": 1
  }]
  ```


# Example calls

## CLI

```sh
export DEBUG="showcase:*"
export KAFKA_URL=broker:9092
export KAFKA_WAIT_FOR_TOPICS=existing_topic
export WAIT_BETWEEN_TRIES_S=1
export KAFKA_ENSURE_TOPICS='[{"topic": "new_topic", "partitions": 1, "replicationFactor": 1}]'
wait-for-kafka
```

## Docker

```sh
docker run\
    -e KAFKA_URL=broker:9092\
    -e KAFKA_WAIT_FOR_TOPICS=existing_topic,new_topic\
    -e DEBUG='showcase:*'\
    -e KAFKA_ENSURE_TOPICS='[{"topic": "new_topic", "partitions": 1, "replicationFactor": 1}]'\
    azapps/ensure-kafka-topics
```
