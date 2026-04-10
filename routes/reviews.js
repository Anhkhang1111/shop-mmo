const express = require("express")
const router = express.Router()
const verifyToken = require("../middleware/authMiddleware")
const db = require("../database/db")

router.get("/", (req, res) => {
  db.query("SELECT r.*, u.username FROM reviews r LEFT JOIN users u ON r.user_id = u.id ORDER BY r.created_at DESC", (err, result) => {
    if (err) return res.status(500).json({ message: "Lỗi lấy đánh giá", error: err.message })
    res.json(result)
  })
})

router.post("/", verifyToken, (req, res) => {
  const { rating, comment } = req.body
  if (!rating || rating < 1 || rating > 5) return res.status(400).json({ message: "Rating từ 1-5" })

  db.query("INSERT INTO reviews (user_id, rating, comment) VALUES (?,?,?)", [req.user.id, rating, comment || ""], (err, result) => {
    if (err) return res.status(500).json({ message: "Lỗi tạo đánh giá", error: err.message })
    res.json({ message: "Đánh giá thành công", reviewId: result.insertId })
  })
})

module.exports = router