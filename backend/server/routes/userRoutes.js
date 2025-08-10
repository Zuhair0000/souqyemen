const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/authMiddleware");
const {
  getProfile,
  updateProfile,
  getMyOrders,
  updateSettings,
  getProductsByCategory,
} = require("../controller/userController");

// Profile and orders
router.get("/profile", authenticate, getProfile);
router.put("/profile", authenticate, updateProfile);
router.get("/orders", authenticate, getMyOrders);
router.put("/settings", authenticate, updateSettings);

// Browsing
router.get("/products/category/:categoryId", getProductsByCategory);

module.exports = router;
