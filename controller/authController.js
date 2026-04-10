const { db, isConnected } = require("../database/db")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const crypto = require("crypto")

const JWT_SECRET = process.env.JWT_SECRET || "shop_super_vip_secret"
const DEMO_MODE = process.env.DEMO_MODE === "true"
const DEMO_EMAIL = process.env.DEMO_EMAIL || "demo@shopvip.com"
const DEMO_PASSWORD = process.env.DEMO_PASSWORD || "Demo@123"
const DEMO_USERNAME = process.env.DEMO_USERNAME || "Demo Admin"
const DEMO_ROLE = process.env.DEMO_ROLE || "admin"
const DEMO_USER_EMAIL = process.env.DEMO_USER_EMAIL || "demo-user@shopvip.com"
const DEMO_USER_PASSWORD = process.env.DEMO_USER_PASSWORD || "DemoUser@123"
const DEMO_USER_USERNAME = process.env.DEMO_USER_USERNAME || "Demo Customer"
const DEMO_USER_ROLE = process.env.DEMO_USER_ROLE || "user"

function generateToken(user) {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
    expiresIn: "7d"
  })
}

function sanitizeUser(user) {
  const { password, ...rest } = user
  return rest
}

exports.register = async (req, res) => {
  const { username, email, password } = req.body

  if (!username || !email || !password) {
    return res.status(400).json({ message: "Vui lòng điền đầy đủ thông tin" })
  }

  db.query("SELECT id FROM users WHERE email = ?", [email], (err, result) => {
    if (err) return res.status(500).json({ message: "Lỗi server", error: err.message })
    if (result.length > 0) {
      return res.status(409).json({ message: "Email đã được sử dụng" })
    }

    const hash = bcrypt.hashSync(password, 10)
    db.query(
      "INSERT INTO users (username,email,password) VALUES (?,?,?)",
      [username, email, hash],
      (insertErr, insertResult) => {
        if (insertErr) return res.status(500).json({ message: "Lỗi tạo tài khoản", error: insertErr.message })

        const user = {
          id: insertResult.insertId,
          username,
          email,
          role: "user"
        }

        const token = generateToken(user)
        res.json({ message: "Đăng ký thành công", user, token })
      }
    )
  })
}

exports.login = async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: "Vui lòng nhập email và mật khẩu" })
  }

  const connected = isConnected()
  console.log(`Auth login: connected=${connected}, email=${email}`)
  if (!connected) {
    if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
      const user = {
        id: 0,
        username: DEMO_USERNAME,
        email: DEMO_EMAIL,
        role: DEMO_ROLE
      }
      const token = generateToken(user)
      return res.json({ message: "Đăng nhập demo admin thành công", user, token })
    }

    if (email === DEMO_USER_EMAIL && password === DEMO_USER_PASSWORD) {
      const user = {
        id: 1,
        username: DEMO_USER_USERNAME,
        email: DEMO_USER_EMAIL,
        role: DEMO_USER_ROLE
      }
      const token = generateToken(user)
      return res.json({ message: "Đăng nhập demo khách thành công", user, token })
    }

    return res.status(401).json({ message: "Sai tài khoản demo" })
  }

  db.query("SELECT * FROM users WHERE email=?", [email], (err, result) => {
    if (err) return res.status(500).json({ message: "Lỗi server", error: err.message })
    if (!result || result.length === 0) {
      return res.status(401).json({ message: "Sai tài khoản" })
    }

    const user = result[0]
    const check = bcrypt.compareSync(password, user.password)

    if (!check) {
      return res.status(401).json({ message: "Sai mật khẩu" })
    }

    const token = generateToken(user)
    res.json({ message: "Đăng nhập thành công", user: sanitizeUser(user), token })
  })
}

exports.profile = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Không có thông tin người dùng" })
  }
  res.json({ user: req.user })
}

exports.updateProfile = async (req, res) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: "Yêu cầu đăng nhập" })
  }

  const { username, email } = req.body
  if (!username || !email) {
    return res.status(400).json({ message: "Username và email là bắt buộc" })
  }

  db.query("UPDATE users SET username = ?, email = ? WHERE id = ?", [username, email, req.user.id], (err, result) => {
    if (err) return res.status(500).json({ message: "Lỗi cập nhật hồ sơ", error: err.message })
    if (result.affectedRows === 0) return res.status(404).json({ message: "Không tìm thấy người dùng" })
    res.json({ message: "Cập nhật hồ sơ thành công" })
  })
}

exports.changePassword = async (req, res) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: "Yêu cầu đăng nhập" })
  }

  const { oldPassword, newPassword } = req.body
  if (!oldPassword || !newPassword) {
    return res.status(400).json({ message: "Mật khẩu cũ và mới là bắt buộc" })
  }

  db.query("SELECT password FROM users WHERE id = ?", [req.user.id], (err, result) => {
    if (err) return res.status(500).json({ message: "Lỗi server", error: err.message })
    if (!result || result.length === 0) return res.status(404).json({ message: "Không tìm thấy người dùng" })

    const check = bcrypt.compareSync(oldPassword, result[0].password)
    if (!check) return res.status(401).json({ message: "Mật khẩu cũ sai" })

    const hash = bcrypt.hashSync(newPassword, 10)
    db.query("UPDATE users SET password = ? WHERE id = ?", [hash, req.user.id], (updateErr) => {
      if (updateErr) return res.status(500).json({ message: "Lỗi đổi mật khẩu", error: updateErr.message })
      res.json({ message: "Đổi mật khẩu thành công" })
    })
  })
}

exports.forgotPassword = async (req, res) => {
  const { email } = req.body
  if (!email) return res.status(400).json({ message: "Email là bắt buộc" })

  const resetToken = crypto.randomBytes(32).toString("hex")
  const resetExpires = new Date(Date.now() + 3600000) // 1 hour

  db.query("UPDATE users SET reset_token = ?, reset_expires = ? WHERE email = ?", [resetToken, resetExpires, email], (err, result) => {
    if (err) return res.status(500).json({ message: "Lỗi server", error: err.message })
    if (result.affectedRows === 0) return res.status(404).json({ message: "Email không tồn tại" })

    // In real app, send email. Here, just return token for demo
    res.json({ message: "Token reset đã gửi (demo)", resetToken })
  })
}

exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body
  if (!token || !newPassword) return res.status(400).json({ message: "Token và mật khẩu mới là bắt buộc" })

  db.query("SELECT id FROM users WHERE reset_token = ? AND reset_expires > NOW()", [token], (err, result) => {
    if (err) return res.status(500).json({ message: "Lỗi server", error: err.message })
    if (!result || result.length === 0) return res.status(400).json({ message: "Token không hợp lệ hoặc hết hạn" })

    const hash = bcrypt.hashSync(newPassword, 10)
    db.query("UPDATE users SET password = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?", [hash, result[0].id], (updateErr) => {
      if (updateErr) return res.status(500).json({ message: "Lỗi reset mật khẩu", error: updateErr.message })
      res.json({ message: "Reset mật khẩu thành công" })
    })
  })
}