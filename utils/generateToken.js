const jwt = require("jsonwebtoken")

const JWT_SECRET = process.env.JWT_SECRET || "shop_super_vip_secret"

function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" })
}

module.exports = generateToken