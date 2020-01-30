const mongoose = require('mongoose')
const { config } = require('./configdb')
const chalk = require('chalk')

mongoose.connect(`mongodb://${config.default.HOST}/${config.default.NAME}`, { useNewUrlParser: true, useFindAndModify: false, useCreateIndex: true })
const db = mongoose.connection
db.on('error', (error) => {
  console.log(`${chalk.red('MongoDB connection error: ')}`, error.message)
  process.exit(0)
})

module.exports = db
