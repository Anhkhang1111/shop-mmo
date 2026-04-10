const express = require("express")
const router = express.Router()
const verifyToken = require("../middleware/authMiddleware")
const adminMiddleware = require("../middleware/adminMiddleware")
const db = require("../database/db")

router.get("/", verifyToken, (req, res) => {
  db.query("SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC", [req.user.id], (err, result) => {
    if (err) return res.status(500).json({ message: "Lỗi lấy giao dịch", error: err.message })
    res.json(result)
  })
})

router.get("/all", verifyToken, adminMiddleware, (req, res) => {
  db.query("SELECT t.*, u.username FROM transactions t LEFT JOIN users u ON t.user_id = u.id ORDER BY t.created_at DESC", (err, result) => {
    if (err) return res.status(500).json({ message: "Lỗi lấy giao dịch", error: err.message })
    res.json(result)
  })
})

module.exports = router