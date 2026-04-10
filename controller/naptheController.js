const db = require("../database/db")

exports.getAll = (req, res) => {
  db.query("SELECT * FROM napthe ORDER BY id DESC", (err, result) => {
    if (err) return res.status(500).json({ message: "Lỗi lấy thông tin nạp thẻ", error: err.message })
    res.json(result)
  })
}

exports.getMine = (req, res) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: "Yêu cầu đăng nhập" })
  }
  db.query("SELECT * FROM napthe WHERE user_id = ? ORDER BY id DESC", [req.user.id], (err, result) => {
    if (err) return res.status(500).json({ message: "Lỗi lấy lịch sử nạp thẻ", error: err.message })
    res.json(result)
  })
}

exports.create = (req, res) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: "Yêu cầu đăng nhập" })
  }

  const user_id = req.user.id
  const { seri, code, amount, payment_method } = req.body
  if (!seri || !code || !amount) {
    return res.status(400).json({ message: "seri, code và amount là bắt buộc" })
  }
  db.query(
    "INSERT INTO napthe (user_id, seri, code, amount, payment_method) VALUES (?,?,?,?,?)",
    [user_id, seri, code, amount, payment_method || 'card'],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Lỗi tạo yêu cầu nạp thẻ", error: err.message })
      res.json({ message: "Gửi yêu cầu nạp thẻ thành công", naptheId: result.insertId })
    }
  )
}

exports.updateStatus = (req, res) => {
  const { id } = req.params
  const { status } = req.body
  if (!status) {
    return res.status(400).json({ message: "status là bắt buộc" })
  }

  // Get napthe info
  db.query("SELECT user_id, amount FROM napthe WHERE id = ?", [id], (err, naptheResult) => {
    if (err) return res.status(500).json({ message: "Lỗi lấy nạp thẻ", error: err.message })
    if (!naptheResult || naptheResult.length === 0) return res.status(404).json({ message: "Không tìm thấy yêu cầu nạp thẻ" })

    const user_id = naptheResult[0].user_id
    const amount = naptheResult[0].amount

    db.query("UPDATE napthe SET status = ? WHERE id = ?", [status, id], (updateErr, updateResult) => {
      if (updateErr) return res.status(500).json({ message: "Lỗi cập nhật trạng thái", error: updateErr.message })
      if (updateResult.affectedRows === 0) return res.status(404).json({ message: "Không tìm thấy yêu cầu nạp thẻ" })

      if (status === 'completed') {
        // Add money to user
        db.query("UPDATE users SET money = money + ? WHERE id = ?", [amount, user_id], (moneyErr) => {
          if (moneyErr) return res.status(500).json({ message: "Lỗi cộng tiền", error: moneyErr.message })

          // Add transaction
          db.query("INSERT INTO transactions (user_id, type, amount, description) VALUES (?,?,?,?)", [user_id, 'deposit', amount, `Nạp thẻ ID ${id}`], (transErr) => {
            if (transErr) console.error("Lỗi tạo transaction:", transErr)
          })
        })
      }

      res.json({ message: "Cập nhật trạng thái nạp thẻ thành công" })
    })
  })
}
