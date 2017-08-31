/* eslint-env jest */
import Producer from './Producer'

jest.mock('axios', () => ({
  post: jest.fn(() => Promise.resolve({ data: { id: 3 } }))
}))

const postMock = require('axios').post
const producer = new Producer()

describe('Producer', () => {
  it('adds new message to queue with correct url and payload', () => {
    return producer.addNewMessage('foo')
      .then(result => {
        expect(postMock).toHaveBeenCalledWith('http://localhost:3000/message/new', { payload: 'foo' })
        expect(result).toBe(3)
      })
  })
})
