const db = require("../database/db")

exports.getAll = (req, res) => {
  db.query("SELECT id, username, email, money, role FROM users", (err, result) => {
    if (err) return res.status(500).json({ message: "Lỗi lấy người dùng", error: err.message })
    res.json(result)
  })
}

exports.getById = (req, res) => {
  const { id } = req.params
  db.query("SELECT id, username, email, money, role FROM users WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ message: "Lỗi lấy người dùng", error: err.message })
    if (!result || result.length === 0) return res.status(404).json({ message: "Không tìm thấy người dùng" })
    res.json(result[0])
  })
}
