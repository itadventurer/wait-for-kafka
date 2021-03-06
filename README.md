# Ensure existence of Kafka Topics

* Install as CLI tool: `npm install -g wait-for-kafka`
* Install as Library: `yarn add wait-for-kafka`

This program is able to perform following operations:

1. Waiting for a set of Kafka topics to become available
2. Creating new topics in the case they are not existent

## Usage

`wait-for-kafka` can be used as a standalone tool or from within
node.


### CLI

```sh
export DEBUG="showcase:*"
export KAFKA_BOOTSTRAP_SERVERS=broker:9092
export WAIT_FOR_KAFKA_TOPICS=existing_topic
export WAIT_BETWEEN_TRIES_S=1
export ENSURE_KAFKA_TOPICS='[{"topic": "new_topic", "partitions": 1, "replicationFactor": 1}]'
wait-for-kafka
```

### Docker

```sh
docker run\
    -e KAFKA_BOOTSTRAP_SERVERS=broker:9092\
    -e WAIT_FOR_KAFKA_TOPICS=existing_topic,new_topic\
    -e DEBUG='showcase:*'\
    -e ENSURE_KAFKA_TOPICS='[{"topic": "new_topic", "partitions": 1, "replicationFactor": 1}]'\
    azapps/ensure-kafka-topics
```

### Node Library

```js
import wait_for_kafka from './wait-for-kafka';

wait_for_kafka(
    // KAFKA_BOOTSTRAP_SERVERS
    "localhost:9092",
    // WAIT_FOR_KAFKA_TOPICS (optional)
    ["healthcheck"],
    // ENSURE_KAFKA_TOPICS (optional)
    [{"topic": "new_topic", "partitions": 1, "replicationFactor": 1}],
    // ABORT_AFTER_TRIES (optional, default: 10)
    10
    // WAIT_BETWEEN_TRIES_S (optional, default: 5)
    5)
    .then(() => console.log("Success"))
    .catch(e => console.error("Error:", e));
```

## Configuration

If called from command line, set the environment variables. If called
from node, use the parameters.

### Required parameters

* `KAFKA_BOOTSTRAP_SERVERS`: Kafka-url.

### Debug settings

* `DEBUG="wait-for-kafka:*"` all debug outputs for this program
* `DEBUG="*"` all debug outputs for this program and for `kafka-node`
* `unset DEBUG` no debug outputs

### Waiting for a set of Kafka topics to become available

* `WAIT_FOR_KAFKA_TOPICS`: comma separated list of topics to wait for
  becoming available

### Creating new topics in the case they are not existent

* `ENSURE_KAFKA_TOPICS`: An JSON array containing objects that get
  passed to the `createTopics` function of `kafka-node`.

  Example:
  ```json
  [{
    "topic": "topic1",
    "partitions": 1,
    "replicationFactor": 1
  }]
  ```

### Retries

* `ABORT_AFTER_TRIES` (optional, default: `10`): After how many checks
  should the program abort?
* `WAIT_BETWEEN_TRIES_S` (optional, default: `5`): How many seconds
  should the program wait before trying again?
