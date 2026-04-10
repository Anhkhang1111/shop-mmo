const express = require("express")
const router = express.Router()
const naptheController = require("../controller/naptheController")
const verifyToken = require("../middleware/authMiddleware")
const adminMiddleware = require("../middleware/adminMiddleware")

router.get("/", verifyToken, adminMiddleware, naptheController.getAll)
router.get("/me", verifyToken, naptheController.getMine)
router.post("/", verifyToken, naptheController.create)
router.put("/:id/status", verifyToken, adminMiddleware, naptheController.updateStatus)

module.exports = router