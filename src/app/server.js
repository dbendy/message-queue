import express from 'express'
import Sequelize from 'sequelize'

const sequelize = new Sequelize('messageQueue', 'username', 'password', {
  host: 'localhost',
  dialect: 'sqlite',

  pool: {
    max: 5,
    min: 0,
    idle: 10000
  },

  // SQLite only
  storage: './messageQueue.sqlite'
})

const app = express()

app.get('/testDb', (req, res) =>
  sequelize
    .authenticate()
    .then(() => res.send('DB connection established'))
    .catch(err => res.send(`DB connection err: ${err}`))
)

app.post('/job/new', (req, res, next) => {
  res.send('new job created')
})

// request the next available job
app.get('/job/next', (req, res, next) => {
  res.send('here is the next available job')
})

app.post('/job/:id/status/done', (req, res, next) => {
  res.send(`job ${req.params.id} is set to done`)
})

app.get('/info', (req, res, next) => {
  res.send('queue info')
})

app.use((err, req, res, next) =>
  res.send(`Something went wrong: ${err}`))

app.listen(3000, () =>
  console.log('Example app listening on port 3000!'))
