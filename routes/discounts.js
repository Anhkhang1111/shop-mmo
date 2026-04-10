const express = require("express")
const router = express.Router()
const verifyToken = require("../middleware/authMiddleware")
const adminMiddleware = require("../middleware/adminMiddleware")
const db = require("../database/db")

router.get("/", (req, res) => {
  db.query("SELECT code, discount_percent, max_uses, used_count, expires_at FROM discount_codes WHERE expires_at > NOW()", (err, result) => {
    if (err) return res.status(500).json({ message: "Lỗi lấy mã giảm giá", error: err.message })
    res.json(result)
  })
})

router.post("/", verifyToken, adminMiddleware, (req, res) => {
  const { code, discount_percent, max_uses, expires_at } = req.body
  if (!code || !discount_percent || !max_uses || !expires_at) return res.status(400).json({ message: "Tất cả fields là bắt buộc" })

  db.query("INSERT INTO discount_codes (code, discount_percent, max_uses, expires_at) VALUES (?,?,?,?)", [code, discount_percent, max_uses, expires_at], (err, result) => {
    if (err) return res.status(500).json({ message: "Lỗi tạo mã giảm giá", error: err.message })
    res.json({ message: "Tạo mã giảm giá thành công", discountId: result.insertId })
  })
})

module.exports = router