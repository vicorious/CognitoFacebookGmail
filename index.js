require('./database/db')
const express = require('express')
const http = require('http')
const asyncify = require('express-asyncify')
const bodyParser = require('body-parser')
const chalk = require('chalk')
const cors = require('cors')
const port = 4200
const morgan = require('morgan')
const passport = require('passport')
const routeUser = require('./routes/routes')
const app = asyncify(express())
const server = http.createServer(app)

app.use(cors())
app.use(morgan('combined'))
app.use(bodyParser.json({ extended: true, limit: '20000mb' }))
app.use(bodyParser.urlencoded({ extended: true, limit: '20000mb' }))

app.use(passport.initialize())
app.use(passport.session())
app.use('/v1', routeUser)

server.listen(port, () => {
  console.log(`${chalk.green('[Proyect_coffe]')} server listening on port ${port}`)
})

module.exports = server
