const db = require("../database/db")

exports.getAll = (req, res) => {
  let sql = "SELECT * FROM products WHERE 1=1"
  const params = []
  const { min_price, max_price, rank, min_skins, max_skins, min_champions, max_champions } = req.query

  if (min_price) {
    sql += " AND price >= ?"
    params.push(min_price)
  }
  if (max_price) {
    sql += " AND price <= ?"
    params.push(max_price)
  }
  if (rank) {
    sql += " AND rank = ?"
    params.push(rank)
  }
  if (min_skins) {
    sql += " AND skins >= ?"
    params.push(min_skins)
  }
  if (max_skins) {
    sql += " AND skins <= ?"
    params.push(max_skins)
  }
  if (min_champions) {
    sql += " AND champions >= ?"
    params.push(min_champions)
  }
  if (max_champions) {
    sql += " AND champions <= ?"
    params.push(max_champions)
  }

  db.query(sql, params, (err, result) => {
    if (err) return res.status(500).json({ message: "Lỗi lấy sản phẩm", error: err.message })
    res.json(result)
  })
}

exports.getById = (req, res) => {
  const { id } = req.params
  db.query("SELECT * FROM products WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ message: "Lỗi lấy sản phẩm", error: err.message })
    if (!result || result.length === 0) return res.status(404).json({ message: "Không tìm thấy sản phẩm" })
    res.json(result[0])
  })
}

exports.create = (req, res) => {
  const { name, price, image, description } = req.body
  if (!name || !price) {
    return res.status(400).json({ message: "Tên và giá sản phẩm là bắt buộc" })
  }
  db.query(
    "INSERT INTO products (name, price, image, description) VALUES (?,?,?,?)",
    [name, price, image || "", description || ""],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Lỗi tạo sản phẩm", error: err.message })
      res.json({ message: "Tạo sản phẩm thành công", productId: result.insertId })
    }
  )
}

exports.update = (req, res) => {
  const { id } = req.params
  const { name, price, image, description } = req.body
  db.query(
    "UPDATE products SET name = ?, price = ?, image = ?, description = ? WHERE id = ?",
    [name, price, image || "", description || "", id],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Lỗi cập nhật sản phẩm", error: err.message })
      if (result.affectedRows === 0) return res.status(404).json({ message: "Không tìm thấy sản phẩm" })
      res.json({ message: "Cập nhật sản phẩm thành công" })
    }
  )
}

exports.remove = (req, res) => {
  const { id } = req.params
  db.query("DELETE FROM products WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ message: "Lỗi xóa sản phẩm", error: err.message })
    if (result.affectedRows === 0) return res.status(404).json({ message: "Không tìm thấy sản phẩm" })
    res.json({ message: "Xóa sản phẩm thành công" })
  })
}