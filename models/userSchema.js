const mongoose = require('mongoose')
const Types = mongoose.Schema.Types
const Base = require('./baseSchema')

const validRoles = {
  values: ['ADMIN_ROLE', 'USER_ROLE'],
  message: '{VALUE} no es un rol válido'
}

const Schema = new mongoose.Schema({
  name: {
    type: Types.String,
    required: [true, 'El nombre es necesario']
  },
  email: {
    type: Types.String,
    required: [true, 'El correo es necesario']
  },
  password: {
    type: Types.String,
    required: [true, 'La contraseña es necesaria']
  },
  image: {
    type: Types.String
  },
  role: {
    type: Types.String,
    default: 'USER_ROLE',
    enum: validRoles
  },
  state: {
    type: Types.Boolean,
    default: true
  },
  google: {
    type: Types.Boolean,
    default: false
  }
})

class User extends Base {
  constructor () {
    super()
    this.sort = { name: 1 }
    this.model = mongoose.model('User', Schema)
    this.fields = 'name email image role state google'
  }
}

module.exports = new User()
