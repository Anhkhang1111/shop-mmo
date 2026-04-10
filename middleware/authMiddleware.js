const jwt = require("jsonwebtoken")

const JWT_SECRET = process.env.JWT_SECRET || "shop_super_vip_secret"

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization || ""
  const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null

  if (!token) {
    return res.status(401).json({ message: "Token không hợp lệ hoặc không tồn tại" })
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Token không hợp lệ" })
    }
    req.user = decoded
    next()
  })
}
