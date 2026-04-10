const bcrypt = require("bcryptjs")

function hashPassword(password) {
  return bcrypt.hashSync(password, 10)
}

function comparePassword(candidate, hash) {
  return bcrypt.compareSync(candidate, hash)
}

module.exports = { hashPassword, comparePassword }