const express = require("express")
const router = express.Router()
const orderController = require("../controller/orderController")
const verifyToken = require("../middleware/authMiddleware")
const adminMiddleware = require("../middleware/adminMiddleware")

router.get("/", verifyToken, adminMiddleware, orderController.getAll)
router.get("/me", verifyToken, orderController.getMyOrders)
router.post("/", verifyToken, orderController.create)

module.exports = router