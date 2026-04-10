const mysql = require("mysql2")
const fs = require("fs")
const path = require("path")
const bcrypt = require("bcryptjs")

const connection = mysql.createConnection({
  host: process.env.DB_HOST || "127.0.0.1",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  multipleStatements: true
})

const schemaPath = path.join(__dirname, "database", "schema.sql")
const schema = fs.readFileSync(schemaPath, "utf8")

const adminEmail = process.env.ADMIN_EMAIL || "admin@shopvip.com"
const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123"

connection.query(`CREATE DATABASE IF NOT EXISTS mmo_shop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; USE mmo_shop; ${schema}`, (err) => {
  if (err) {
    console.error("Lỗi khi thiết lập database:", err)
    process.exit(1)
  }

  const passwordHash = bcrypt.hashSync(adminPassword, 10)
  const createAdmin = `INSERT INTO users (username, email, password, role, money) SELECT 'admin', ?, ?, 'admin', 0 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = ?);`
  connection.query(createAdmin, [adminEmail, passwordHash, adminEmail], (adminErr) => {
    if (adminErr) {
      console.error("Lỗi tạo tài khoản admin:", adminErr)
      process.exit(1)
    }

    const seedProducts = `INSERT INTO products (name, price, image, description, account_username, account_password, rank, skins, champions)
      SELECT 'Account Liên Quân', 50000, '/images/account1.jpg', 'Tài khoản Vip liên quân giá rẻ', 'user1', 'pass1', 'Kim cương', 50, 20 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Account Liên Quân');
      INSERT INTO products (name, price, image, description, account_username, account_password, rank, skins, champions)
      SELECT 'Acc Free Fire', 35000, '/images/account2.jpg', 'Tài khoản Free Fire uy tín', 'user2', 'pass2', 'Huyền Thoại', 30, 15 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Acc Free Fire');
      INSERT INTO products (name, price, image, description, account_username, account_password, rank, skins, champions)
      SELECT 'Acc Minecraft', 45000, '/images/account3.jpg', 'Tài khoản Minecraft chất lượng', 'user3', 'pass3', 'VIP', 0, 0 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Acc Minecraft');`

    connection.query(seedProducts, (seedErr) => {
      if (seedErr) {
        console.error("Lỗi seed sản phẩm:", seedErr)
        process.exit(1)
      }

      const seedDiscount = `INSERT INTO discount_codes (code, discount_percent, max_uses, expires_at)
        SELECT 'VIP10', 10, 100, '2026-12-31' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM discount_codes WHERE code = 'VIP10');`

      connection.query(seedDiscount, (discountErr) => {
        if (discountErr) {
          console.error("Lỗi seed discount:", discountErr)
          process.exit(1)
        }

        console.log("Database mmo_shop đã được tạo / cập nhật thành công.")
        console.log(`Admin mặc định: ${adminEmail}`)
        console.log(`Mật khẩu admin: ${adminPassword}`)
        connection.end()
      })
    })
  })
})