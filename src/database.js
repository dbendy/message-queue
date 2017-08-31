import Sequelize from 'sequelize'

export default (opts = {}) => {
  const {
    database,
    username,
    password,
    ...otherOpts
  } = opts

  return new Sequelize(database, username, password, otherOpts)
}
