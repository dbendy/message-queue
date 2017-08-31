/* eslint-env jest */
import Consumer from './Consumer'

jest.mock('axios', () => ({
  get: jest.fn(() => ({ id: 5, payload: 'foo' })),
  post: jest.fn(() => 'bar')
}))

const { post: postMock, get: getMock } = require('axios')
const consumer = new Consumer()

describe('Consumer', () => {
  it('requests next message from queue with correct url and payload', () => {
    const message = consumer.getNextMessage()
    expect(getMock).toHaveBeenCalledWith('http://localhost:3000/message/next')
    expect(message).toEqual({ id: 5, payload: 'foo' })
  })

  it('notifies queue about processed message with correct url and payload', () => {
    const response = consumer.notifyProcessed(5)
    expect(postMock).toHaveBeenCalledWith('http://localhost:3000/message/5/status/done')
    expect(response).toEqual('bar')
  })
})
