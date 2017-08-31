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
    let setTimeoutFn

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
          setTimeoutFn = () => this._setPendingTimeout(message.id)

          return this.messages
            .update(
              { status: PENDING },
              { where: { id: message.id } }
            )
        }
      })
      .then(() => setTimeoutFn())
      .then(() => message)
  }

  _setPendingTimeout (id) {
    setTimeout(() => {
      this.messages
        .findAll({
          where: {
            id,
            status: PENDING
          }
        })
        .then(result => {
          if (result.length) {
            const { id } = result[0]

            this.messages.update(
              { status: UNPROCESSED },
              { where: { id } }
            )
          }
        })
    }, this.pendingTimeout)
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
