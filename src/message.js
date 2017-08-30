import { INTEGER, TEXT, ENUM } from 'Sequelize'

export const UNPROCESSED = 'unprocessed'
export const PENDING = 'pending'
export const PROCESSED = 'processed'

const tableDefinition = {
  id: {
    type: INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  payload: {
    type: TEXT,
    allowNull: false
  },
  status: {
    type: ENUM,
    values: [
      UNPROCESSED,
      PENDING,
      PROCESSED
    ],
    allowNull: false
  }
}

export default (sequelize) => {
  const Messages = sequelize
    .define('message', tableDefinition)

  Messages
    .sync()
    .then(() => console.log('messages table synced'))

  return Messages
}
