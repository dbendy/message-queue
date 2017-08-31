# message-queue

## What is this?

This is a FIFO message queue.  It runs on a server which you can make API calls to.  The server stores messages in a database.

A new message can be added to the queue by a producer by posting to `/message/new`.

In order to retrive the next message that needs to be processed, a consumer should make a GET request to `/message/next`.  At that point, that message is considered pending.  Within a certain timeout (configureable), the consumer must make a POST request to `/message/:id/status/done` or else the message is placed back at the front of the queue.  If the consumer does POST to `/message/:id/status/done` before the timeout expires, the message is removed from the queue.

In order to see the entire state of the queue, make a GET request to `/info`.

## How does it work?

## Installation

```
$ yarn add http://github.com/dbendy/message-queue
```
// TODO: publish tags of this repo to an npm registry such as npmjs.org so that this command can just be `yarn add message-queue`

## Starting the server

In order to start the message-queue server:

```
$ message-queue
```

## Interacting with server via REST API

Here, we'll use curl in our examples to describe the API:

A produer can POST a new message so that it's added to the queue:

```
$ curl -X POST -H "Content-Type: application/json" -d '{"payload": "the actual message that were posting"}' http://localhost:3000/message/new
```
If that works, an id should be returned.

A consumer can retrieve the next job to be processed:

```
$ curl -H "Content-Type: application/json" http://localhost:3000/message/next
```
That will return a JSON object with the message payload and id.  Let's assume that the message id is 7.

The consumer can then indicate to the server that the message has been processed:

```
$ curl -H "Content-Type: application/json" http://localhost:3000/message/7/status/done
```

At any point, you can view the full state of the queue by visiting http://localhost:3000/info in your browser.

## Producer and Consumer

This repo contains a `Producer` and `Consumer` for interacting with the message-queue server.

// TODO: move the producer and consumer to their own repos because that's really where they should be

Here is how to use the `Producer`:

```es6
import { Producer } from 'message-queue'

const producer = new Producer({
  hostname: 'localhost',
  port: 3000
})

producer.addNewMessage('yada yada yada')
  .then(id => console.log(`message id is ${id}`)
  .catch(err => console.log(`something went wrong: ${err}`))
```

Here is how to use the `Consumer`:

```es6
import { Consumer } from 'message-queue'

const consumer = new Consumer({
  hostname: 'localhost',
  port: 3000
})

consumer.getNextMessage()
  .then(({ payload, id }) => console.log(`received message ${id}: ${payload}`)
  .catch(err => console.log(`something went wrong: ${err}`))

consumer.notifyProcessed(7)
  .then(() => console.log('we have successfully notified the queue that message 7 was processed'))
  .catch(err => console.log(`something went wrong: ${err}`)
```

## Storage

By default, this module uses `sqlite` in order to store message in a persistant fashion.

You can use a different database if you would like to as long as [`Sequelize'](http://docs.sequelizejs.com/) supports it.  In order to do so, you will have to install the necessary npm module for connecting to that database.  You can then supply all the configuration needed for connecting to that database to this server via environmental variables.  See [`custom-environmental-variables.json`]('./config/custom-environmental-variables.json') for a mapping of server configs to env vars.

## How this could scale for meeting high-volume demands

## Remaining TODOs

- move Producer and Consumer code out to their own repos.  They don't belong in the same repo as the server but just putting them here for now to reduce work
- write unit tests for Queue
- write tests using supertest for server


