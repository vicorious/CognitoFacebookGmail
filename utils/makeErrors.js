'use strict'
module.exports = function (errors) {
  for (const error in errors) {
    return { state: false, data: [], message: errors[error].message }
  }
}
