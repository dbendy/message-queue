import express from 'express'
import { json as parseJsonBody } from 'body-parser'
import getConnection from './database'
import MessageQueue from './Queue'

export default (opts = {}) => {
  const { db: dbOpts } = opts
  const app = express()
  const db = getConnection(dbOpts)
  const mq = new MessageQueue({
    db,
    pendingTimeout: opts.pendingTimeout
  })

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

  const { port } = opts

  return {
    run () {
      app.listen(port, () => console.log(`message-queue running on port ${port}`))
    }
  }
}
