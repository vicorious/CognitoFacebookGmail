const UserModel = require('../models/userSchema')

class UserController {
  async create (data) {
    const isExist = await UserModel.get({ email: data.email })
    if (!isExist._id) {
      const create = await UserModel.create(data)
      return create
    } else {
      return { state: false, data: [], message: 'Usuario ya existe' }
    }
  }
}

module.exports = new UserController()
