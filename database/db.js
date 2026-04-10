const mysql = require("mysql2")

const db = mysql.createConnection({
    host: process.env.DB_HOST || "127.0.0.1",
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "mmo_shop",
    multipleStatements: true
})

let connected = false

function connectDatabase(callback) {
    db.connect((err) => {
        if (err) {
            console.error("Lỗi kết nối database:", err)
            return callback(err)
        }
        connected = true
        console.log("Kết nối MySQL thành công")
        callback(null)
    })
}

function isConnected() {
    return connected
}

module.exports = { db, connectDatabase, isConnected }