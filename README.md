# message-queue

## What is this?

This is a FIFO message queue.  It runs on a server (powered by `express`).  Producers and consumers can interact with the queue via HTTP requests.

## Queue API
A producer can add a new message to queue by POSTing to `/message/new` with a `payload` field in the request body.

A consumer can GET `/message/next` to retrieve the next message that needs to be processed.  At that point, that message is considered pending.  The consumer must notify the queue that the message has been processed by POSTing to `/message/:id/status/done`.  If that is not done within a certain amount of time (configureable), the message is placed back at the front of the queue and available for other consumers.  If the consumer does POST to `/message/:id/status/done` before the timeout expires, the message is removed from the queue.

In order to see the entire state of the queue, navigate to `/info` in a browser.

## Installation

```
$ yarn add http://github.com/dbendy/message-queue
```
// TODO: publish tags of this repo to an npm registry such as npmjs.org so that this command can just be `yarn add message-queue`

## Local usage

In order to start the message-queue server:

```
$ message-queue
```

You should be able to hit all the API routes mentioned in [Queue API](#queue-api) by using `http://localhost:3000` as the hostname. `

## Producer and Consumer

This repo contains a `Producer` and `Consumer` for interacting with the message-queue server.

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

By default, this module uses `sqlite` in order to store messages in a persistant fashion.

You can use a different database if you would like to as long as [`Sequelize'](http://docs.sequelizejs.com/) supports it.  In order to do so, you will have to install the necessary npm module for connecting to that database.  You can then supply all the configuration needed for connecting to that database to this server via environmental variables.  See [`custom-environmental-variables.json`]('./config/custom-environmental-variables.json') for a mapping of server configs to env vars.

## How this could scale for meeting high-volume demands

A few ideas:

Different strategies for meeting high-volume demands can be implemented depending on the bottleneck:

If the bottleneck is accessing data from the database, one could:

1. improve my proof-of-concept code to elminate some unecessary sql queries

1. use a real database such as postgress as opposed to sqlite

1. use a columnar database and index on the status column so that the database can select all the messages that need processing very quickly

1. create a caching layer within the code so that the unprocessed jobs are stored either directly in memory or in something like redis.  The inherent complexity there is figuring out how to keep the database and cache in sync

1. if the FIFO requirement could be dropped, we could deply multiple instances of the message-queue server, each with their own database.  The producer and consumer could be modified so that they are aware of all the different servers and based on some algorithm choose which server they produce to and consume from.  In that case, there will need to be some separate server/process that queries all the individual servers in order to know the complete state of the queue to power the `/info` route.

If the bottleneck is the server code itself:

1. multiple instances of the server could be deployed, all behind a load-balancer, so that the request load could be handled.

## Remaining TODOs

1. move Producer and Consumer code out to their own repos.  They don't belong in the same repo as the server but just putting them here for now to reduce work

1. write unit tests for Queue

1. write tests using supertest for server



