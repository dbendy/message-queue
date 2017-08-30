import getMessagesModel, { UNPROCESSED, PENDING, PROCESSED } from './message'

export default class MessageQueue {
  constructor (opts) {
    const { db, pendingTimeout } = opts
    this.messages = getMessagesModel(db)
    this.pendingTimeout = pendingTimeout
  }

  addNewMessage (payload) {
    return this.messages
      .create({
        payload,
        status: UNPROCESSED
      })
      .then(({ id }) => id)
  }

  getNextMessage () {
    let message = {}

    return this.messages
      .findAll({
        where: { status: UNPROCESSED },
        order: [['id', 'ASC']],
        limit: 1
      })
      .then(result => {
        if (result.length) {
          message = result[0]
          message.status = PENDING

          return this.messages
            .update(
              { status: PENDING },
              { where: { id: message.id } }
            )
        }
      })
      .then(() => setTimeout(() =>
        // this should only change it back to UNPROCESSED if its still at PENDING
        // TODO: should really only set this timeout when there was a found message
        this.messages.update(
          { status: UNPROCESSED },
          { where: { id: message.id } }
        ), this.pendingTimeout))
      .then(() => message)
  }

  setMessageAsProcessed (id) {
    let message

    return this.messages
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
        this.messages
          .update(
            { status: PROCESSED },
            { where: { id } }
          )
      )
      .then(() => message)
  }

  getQueueState () {
    return this.messages.findAll()
  }
}
