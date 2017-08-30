import express from 'express'
import { json as parseJsonBody } from 'body-parser'
import getConnection from './database'
import getMessageModel, { UNPROCESSED, PENDING, PROCESSED } from './message'
import config from '../config/default'

const app = express()
const db = getConnection()
const Messages = getMessageModel(db)

// TODO: move these to a router in a different file

// post new message
app.post('/message/new', parseJsonBody(), (req, res, next) => {
  const { payload } = req.body

  Messages
    .create({
      payload,
      status: UNPROCESSED
    })
    .then(({ id }) => res.json({ id }))
    .catch(err => next(err))
})

// request the next available message
app.get('/message/next', (req, res, next) => {
  let message = {}

  Messages
    .findAll({
      where: { status: UNPROCESSED },
      order: [['id', 'ASC']],
      limit: 1
    })
    .then(result => {
      if (result.length) {
        message = result[0]
        message.status = PENDING

        return Messages
          .update(
            { status: PENDING },
            { where: { id: message.id } }
          )
      }
    })
    .then(() => setTimeout(() =>
      Messages.update(
        { status: UNPROCESSED },
        { where: { id: message.id } }
      ), config.pendingTimeout))
    .then(() => res.json(message))
    .catch(err => next(err))
})

// post that certain message has been processed
app.post('/message/:id/status/done', (req, res, next) => {
  const { id: idFromUrl } = req.params
  const id = parseInt(idFromUrl)
  let message

  Messages
    .findAll({
      where: { id }
    })
    .then(result => {
      if (!result.length) {
        throw new Error(`message ${id} does not exist`)
      }

      message = result[0]

      if (message.status !== PENDING) {
        throw new Error(`error setting message ${id} to processed`)
      }

      message.status = PROCESSED
    })
    .then(() =>
      Messages
        .update(
          { status: PROCESSED },
          { where: { id } }
        )
    )
    .then(() => res.json(message))
    .catch(err => next(err))
})

// get state of queue
// normally, I wouldn't create a view like this
// but would use a proper templating library
app.get('/info', (req, res, next) => {
  Messages
    .findAll()
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
