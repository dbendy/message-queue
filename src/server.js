import express from 'express'
import { json as parseJsonBody } from 'body-parser'
import getConnection from './database'
import { pendingTimeout } from '../config/default'
import MessageQueue from './Queue'

const app = express()
const db = getConnection()
const mq = new MessageQueue({ db, pendingTimeout })

// TODO: move these to a router in a different file

// post new message
app.post('/message/new', parseJsonBody(), (req, res, next) => {
  const { payload } = req.body

  mq.addNewMessage(payload)
    .then(id => res.json({ id }))
    .catch(err => next(err))
})

// request the next available message
app.get('/message/next', (req, res, next) => {
  mq.getNextMessage()
    .then(message => res.json(message))
    .catch(err => next(err))
})

// post that certain message has been processed
app.post('/message/:id/status/done', (req, res, next) => {
  const { id: idFromUrl } = req.params
  const id = parseInt(idFromUrl)

  mq.setMessageAsProcessed(id)
    .then(message => res.json(message))
    .catch(err => next(err))
})

// get state of queue
// normally, I wouldn't create a view like this
// but would use a proper templating library
app.get('/info', (req, res, next) => {
  mq.getQueueState()
    .then(messages => {
      const formatted = messages
        .map(({ id, payload, status }) =>
          `<h3>Message Id: ${id}</h3><div>Payload: ${payload}<br>Status: ${status}</div>`
        )
        .join('')

      res.send(`<h1>Queue Info:</h1><div>${formatted}</div>`)
    })
    .catch(err => next(err))
})

app.use((err, req, res, next) => {
  console.log(`Error for ${req.url}: ${err}`)
  res.json({ err })
})

app.listen(3000, () => console.log('Example app listening on port 3000!'))
