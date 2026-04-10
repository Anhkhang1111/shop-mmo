const express = require("express")
const router = express.Router()
const verifyToken = require("../middleware/authMiddleware")
const adminMiddleware = require("../middleware/adminMiddleware")
const db = require("../database/db")

router.get("/", (req, res) => {
  db.query("SELECT * FROM news ORDER BY created_at DESC", (err, result) => {
    if (err) return res.status(500).json({ message: "Lỗi lấy tin tức", error: err.message })
    res.json(result)
  })
})

router.post("/", verifyToken, adminMiddleware, (req, res) => {
  const { title, content } = req.body
  if (!title || !content) return res.status(400).json({ message: "Title và content là bắt buộc" })

  db.query("INSERT INTO news (title, content) VALUES (?,?)", [title, content], (err, result) => {
    if (err) return res.status(500).json({ message: "Lỗi tạo tin tức", error: err.message })
    res.json({ message: "Tạo tin tức thành công", newsId: result.insertId })
  })
})

module.exports = router