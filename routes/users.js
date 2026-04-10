const express = require("express")
const router = express.Router()
const userController = require("../controller/userController")
const verifyToken = require("../middleware/authMiddleware")
const adminMiddleware = require("../middleware/adminMiddleware")

router.get("/", verifyToken, adminMiddleware, userController.getAll)
router.get("/:id", verifyToken, adminMiddleware, userController.getById)

module.exports = router