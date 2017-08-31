/* eslint-env jest */
import Consumer from './Consumer'

jest.mock('axios', () => ({
  get: jest.fn(() => Promise.resolve({ data: { id: 5, payload: 'foo' } })),
  post: jest.fn(() => Promise.resolve({ data: { status: 'processed' } }))
}))

const { post: postMock, get: getMock } = require('axios')
const consumer = new Consumer()

describe('Consumer', () => {
  it('requests next message from queue with correct url and payload', () => {
    return consumer.getNextMessage()
      .then(result => {
        expect(getMock).toHaveBeenCalledWith('http://localhost:3000/message/next')
        expect(result).toEqual({ id: 5, payload: 'foo' })
      })
  })

  it('notifies queue about processed message with correct url and payload', () => {
    return consumer.notifyProcessed(5)
      .then((result) => {
        expect(postMock).toHaveBeenCalledWith('http://localhost:3000/message/5/status/done')
        expect(result).toEqual(true)
      })
  })
})
