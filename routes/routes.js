const express = require('express')
const asyncify = require('express-asyncify')
const route = asyncify(express.Router())

const user = require('./user')

route.use('/user', user)

module.exports = route
