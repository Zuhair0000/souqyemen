const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/authMiddleware");
const {
  getProfile,
  updateProfile,
  getMyOrders,
  updateSettings,
  getProductsByCategory,
  getInbox,
} = require("../controller/userController");
const db = require("../config/db");

// Profile and orders
router.get("/profile", authenticate, getProfile);
router.put("/profile", authenticate, updateProfile);
router.get("/orders", authenticate, getMyOrders);
router.put("/settings", authenticate, updateSettings);
router.get("/inbox/:id", authenticate, getInbox);

module.exports = router;
