require("dotenv").config()
const bcrypt = require("bcryptjs")
const { db } = require("./database/db")

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@shopvip.com"
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin@123"
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "Admin"

function seedAdmin() {
  db.query("SELECT id, role FROM users WHERE email = ?", [ADMIN_EMAIL], (err, results) => {
    if (err) {
      console.error("Lỗi kiểm tra admin:", err)
      process.exit(1)
    }

    if (results.length > 0) {
      const user = results[0]
      if (user.role !== "admin") {
        db.query("UPDATE users SET role = 'admin' WHERE id = ?", [user.id], (updateErr) => {
          if (updateErr) {
            console.error("Lỗi nâng cấp tài khoản admin:", updateErr)
            process.exit(1)
          }
          console.log(`Tài khoản ${ADMIN_EMAIL} đã được nâng cấp thành admin.`)
          process.exit(0)
        })
      } else {
        console.log(`Tài khoản admin đã tồn tại: ${ADMIN_EMAIL}`)
        process.exit(0)
      }
      return
    }

    const passwordHash = bcrypt.hashSync(ADMIN_PASSWORD, 10)
    db.query(
      "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, 'admin')",
      [ADMIN_USERNAME, ADMIN_EMAIL, passwordHash],
      (insertErr) => {
        if (insertErr) {
          console.error("Không tạo được tài khoản admin:", insertErr)
          process.exit(1)
        }
        console.log(`Tài khoản admin đã được tạo: ${ADMIN_EMAIL}`)
        process.exit(0)
      }
    )
  })
}

seedAdmin()
