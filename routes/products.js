const express = require("express")
const router = express.Router()
const productController = require("../controller/productController")
const verifyToken = require("../middleware/authMiddleware")
const adminMiddleware = require("../middleware/adminMiddleware")

router.get("/", productController.getAll)
router.get("/:id", productController.getById)
router.post("/", verifyToken, adminMiddleware, productController.create)
router.put("/:id", verifyToken, adminMiddleware, productController.update)
router.delete("/:id", verifyToken, adminMiddleware, productController.remove)

module.exports = router