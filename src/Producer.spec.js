/* eslint-env jest */
import Producer from './Producer'

jest.mock('axios', () => ({
  post: jest.fn(() => 3)
}))

const postMock = require('axios').post
const producer = new Producer()

describe('Producer', () => {
  it('adds new message to queue with correct url and payload', () => {
    const id = producer.addNewMessage('foo')
    expect(postMock).toHaveBeenCalledWith('http://localhost:3000/message/new', { payload: 'foo' })
    expect(id).toBe(3)
  })
})
