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
const db = require("../config/db");

// Profile and orders
router.get("/profile", authenticate, getProfile);
router.put("/profile", authenticate, updateProfile);
router.get("/orders", authenticate, getMyOrders);
router.put("/settings", authenticate, updateSettings);
router.get("/inbox/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query(
      `SELECT DISTINCT u.id, u.name, u.email
       FROM messages m
       JOIN users u ON u.id = m.sender_id
       WHERE m.receiver_id = ?`,
      [id]
    );

    res.json(rows);
  } catch (err) {
    console.error("Inbox error:", err);
    res.status(500).json({ message: "Failed to fetch inbox" });
  }
});

// Browsing
router.get("/products/category/:categoryId", getProductsByCategory);

module.exports = router;
