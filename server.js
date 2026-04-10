const express = require("express")
const cors = require("cors")
const path = require("path")
const multer = require("multer")
const bcrypt = require("bcryptjs")
require("dotenv").config()

const { db, connectDatabase } = require("./database/db")
const authRoutes = require("./routes/auth")
const productRoutes = require("./routes/products")
const userRoutes = require("./routes/users")
const orderRoutes = require("./routes/orders")
const naptheRoutes = require("./routes/napthe")

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, "public")))
app.use("/admin", express.static(path.join(__dirname, "admin")))

// Multer setup for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "upload"))
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname)
  }
})
const upload = multer({ storage })

app.use("/upload", express.static(path.join(__dirname, "upload")))

app.use("/api/auth", authRoutes)
app.use("/api/products", productRoutes)
app.use("/api/users", userRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/napthe", naptheRoutes)

// Upload route
app.post("/api/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Không có file được upload" })
  }
  res.json({ message: "Upload thành công", imageUrl: `/upload/${req.file.filename}` })
})

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "html", "shop.html"))
})

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@shopvip.com"
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin@123"
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "Admin"
const DEMO_MODE = process.env.DEMO_MODE === "true"
const PORT = process.env.PORT || 3000

function seedAdminUser(next) {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    return next()
  }

  db.query("SELECT id, role FROM users WHERE email = ?", [ADMIN_EMAIL], (err, results) => {
    if (err) {
      console.error("Lỗi kiểm tra admin:", err)
      return next()
    }

    if (results.length > 0) {
      const user = results[0]
      if (user.role !== "admin") {
        db.query("UPDATE users SET role = 'admin' WHERE id = ?", [user.id], (updateErr) => {
          if (updateErr) {
            console.error("Lỗi nâng cấp tài khoản admin:", updateErr)
          } else {
            console.log(`Tài khoản ${ADMIN_EMAIL} đã được nâng cấp thành admin.`)
          }
          next()
        })
      } else {
        console.log(`Tài khoản admin đã tồn tại: ${ADMIN_EMAIL}`)
        next()
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
        } else {
          console.log(`Tài khoản admin đã được tạo: ${ADMIN_EMAIL}`)
        }
        next()
      }
    )
  })
}

connectDatabase((err) => {
  if (err) {
    if (DEMO_MODE) {
      console.warn("Không thể kết nối MySQL, server chạy ở chế độ DEMO.")
      app.listen(PORT, () => {
        console.log(`Server chạy DEMO tại http://localhost:${PORT}`)
      })
      return
    }
    console.error("Không thể khởi động server vì lỗi kết nối database.")
    process.exit(1)
  }

  seedAdminUser(() => {
    app.listen(PORT, () => {
      console.log(`Server chạy tại http://localhost:${PORT}`)
    })
  })
})