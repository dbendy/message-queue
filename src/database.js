import Sequelize from 'sequelize'

export default () =>
  new Sequelize('messageQueue', 'username', 'password', {
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
