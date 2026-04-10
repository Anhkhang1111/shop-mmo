const db = require("../database/db")

exports.getAll = (req, res) => {
  const sql = `SELECT o.id, o.user_id, o.product_id, o.price, o.final_price, o.discount_code, o.created_at, u.username AS user_name, p.name AS product_name
               FROM orders o
               LEFT JOIN users u ON o.user_id = u.id
               LEFT JOIN products p ON o.product_id = p.id
               ORDER BY o.created_at DESC`
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ message: "Lỗi lấy đơn hàng", error: err.message })
    res.json(result)
  })
}

exports.getMyOrders = (req, res) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: "Yêu cầu đăng nhập" })
  }
  const sql = `SELECT o.id, o.user_id, o.product_id, o.price, o.final_price, o.discount_code, o.created_at, p.name AS product_name, p.account_username, p.account_password
               FROM orders o
               LEFT JOIN products p ON o.product_id = p.id
               WHERE o.user_id = ?
               ORDER BY o.created_at DESC`
  db.query(sql, [req.user.id], (err, result) => {
    if (err) return res.status(500).json({ message: "Lỗi lấy đơn hàng của bạn", error: err.message })
    res.json(result)
  })
}

exports.create = (req, res) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: "Yêu cầu đăng nhập" })
  }

  const user_id = req.user.id
  const { product_id, discount_code } = req.body
  if (!product_id) {
    return res.status(400).json({ message: "product_id là bắt buộc" })
  }

  // Get product price
  db.query("SELECT price FROM products WHERE id = ?", [product_id], (err, productResult) => {
    if (err) return res.status(500).json({ message: "Lỗi lấy sản phẩm", error: err.message })
    if (!productResult || productResult.length === 0) return res.status(404).json({ message: "Sản phẩm không tồn tại" })

    let price = productResult[0].price
    let final_price = price
    let discount_percent = 0

    // Check discount code
    if (discount_code) {
      db.query("SELECT discount_percent FROM discount_codes WHERE code = ? AND used_count < max_uses AND expires_at > NOW()", [discount_code], (discountErr, discountResult) => {
        if (discountErr) return res.status(500).json({ message: "Lỗi kiểm tra mã giảm giá", error: discountErr.message })
        if (discountResult && discountResult.length > 0) {
          discount_percent = discountResult[0].discount_percent
          final_price = Math.floor(price * (1 - discount_percent / 100))
        }
        processOrder()
      })
    } else {
      processOrder()
    }

    function processOrder() {
      // Check user balance
      db.query("SELECT money FROM users WHERE id = ?", [user_id], (balanceErr, balanceResult) => {
        if (balanceErr) return res.status(500).json({ message: "Lỗi kiểm tra số dư", error: balanceErr.message })
        if (balanceResult[0].money < final_price) return res.status(400).json({ message: "Số dư không đủ" })

        // Deduct money
        db.query("UPDATE users SET money = money - ? WHERE id = ?", [final_price, user_id], (deductErr) => {
          if (deductErr) return res.status(500).json({ message: "Lỗi trừ tiền", error: deductErr.message })

          // Create order
          db.query(
            "INSERT INTO orders (user_id, product_id, price, discount_code, final_price) VALUES (?,?,?,?,?)",
            [user_id, product_id, price, discount_code || null, final_price],
            (orderErr, orderResult) => {
              if (orderErr) return res.status(500).json({ message: "Lỗi tạo đơn hàng", error: orderErr.message })

              // Add transaction
              db.query("INSERT INTO transactions (user_id, type, amount, description) VALUES (?,?,?,?)", [user_id, 'purchase', -final_price, `Mua sản phẩm ID ${product_id}`], (transErr) => {
                if (transErr) console.error("Lỗi tạo transaction:", transErr)
              })

              // Update discount used
              if (discount_code) {
                db.query("UPDATE discount_codes SET used_count = used_count + 1 WHERE code = ?", [discount_code], (updateErr) => {
                  if (updateErr) console.error("Lỗi cập nhật discount:", updateErr)
                })
              }

              res.json({ message: "Tạo đơn hàng thành công", orderId: orderResult.insertId })
            }
          )
        })
      })
    }
  })
}
