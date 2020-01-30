const makeErrors = require('../utils/makeErrors')
class Base {
  constructor () {
    this.model = undefined
    this.populate = undefined
    this.sort = undefined
    this.perPage = undefined
    this.fields = undefined
  }

  async create (data) {
    const model = this.model(data)
    let response
    try {
      response = await model.save()
      response = { state: true, data: response._id, message: null }
    } catch (error) {
      response = makeErrors(error.errors)
    }
    return response
  }

  async all () {
    const objects = this.search({}, this.fields).sort(this.sort)
    return objects
  }

  async get (data) {
    try {
      let results = await this.model.findOne(data, this.fields).sort(this.sort)
      if (this.populate) {
        results = await this.model.findOne(data, this.fields).populate(this.populate).sort(this.sort)
      }
      if (results) {
        return results
      }
    } catch (error) {}
    return {}
  }

  async search (data) {
    try {
      let objects = await this.model.find(data, this.fields).sort(this.sort)
      if (this.populate) {
        objects = await this.model.find(data, this.fields).populate(this.populate).sort(this.sort)
      }
      return objects
    } catch (error) {
      return makeErrors(error.errors)
    }
  }

  async searchByPage (data, page) {
    if (page > 0) {
      let results = await this.model.find(data, this.fields).skip((this.perPage * page) - this.perPage).sort(this.sort).limit(this.perPage).exec()
      if (this.populate) {
        results = await this.model.find(data, this.fields).populate(this.populate).skip((this.perPage * page) - this.perPage).sort(this.sort).limit(this.perPage).exec()
      }
      return results
    } else {
      return []
    }
  }

  async filterByPage (page) {
    const results = await this.searchByPage({}, page)
    return results
  }

  async update (_id, data) {
    try {
      await this.model.findByIdAndUpdate(_id, data, { runValidators: true })
      return { updated: true }
    } catch (error) {
      return { error: 'Datos no actualizados' }
    }
  }

  async delete (_id) {
    const object = await this.model.findByIdAndDelete(_id)
    if (object === null) {
      return { deleted: false }
    }
    return { deleted: true }
  }

  async count (data) {
    const objects = await this.model.find(data).count()
    return objects
  }
}

module.exports = Base
