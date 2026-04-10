const express = require("express")
const router = express.Router()
const authController = require("../controller/authController")
const verifyToken = require("../middleware/authMiddleware")

router.post("/register", authController.register)
router.post("/login", authController.login)
router.get("/profile", verifyToken, authController.profile)
router.put("/profile", verifyToken, authController.updateProfile)
router.put("/change-password", verifyToken, authController.changePassword)
router.post("/forgot-password", authController.forgotPassword)
router.post("/reset-password", authController.resetPassword)

module.exports = router