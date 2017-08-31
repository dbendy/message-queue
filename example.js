// In order for this example to work, the server must be running at localhost:3000

const Producer = require('./dist').Producer
const Consumer = require('./dist').Consumer

const producer = new Producer()
const consumer = new Consumer()

// this function was copied from here: https://blog.raananweber.com/2015/12/01/writing-a-promise-delayer/
function DelayPromise (delay) {
  // return a function that accepts a single variable
  return function (data) {
    // this function returns a promise.
    return new Promise(function (resolve, reject) {
      setTimeout(function () {
        // a promise that is resolved after "delay" milliseconds with the data provided
        resolve(data)
      }, delay)
    })
  }
}

let savedId

producer.addNewMessage('foo')
  .then(id => console.log(`message ${id} added`))
  .then(() => producer.addNewMessage('bar'))
  .then(id => console.log(`message ${id} added`))
  // this message might not be one of the messages that was just added
  // depeding on what is already in the queue
  .then(() => consumer.getNextMessage())
  .then(message => {
    console.log(`next message to be processed is ${message.id}: ${message.payload}`)
    return message.id
  })
  .then(id => consumer.notifyProcessed(id))
  .then(result => console.log(`notified successfully? ${result ? 'yes' : 'no'}`))
  .then(() => consumer.getNextMessage())
  .then(message => {
    console.log(`next message to be processed is ${message.id}: ${message.payload}`)
    savedId = message.id
  })
  .then(DelayPromise(12000))
  .then(() => consumer.notifyProcessed(savedId))
  .then(result => console.log(`notified successfully? ${result ? 'yes' : 'no'}`))
  .catch(err => console.log(err))
