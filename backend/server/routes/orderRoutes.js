// routes/orderRoutes.js
const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { authenticate } = require("../middleware/authMiddleware"); // assuming you have JWT middleware

// Checkout route
router.post("/checkout", authenticate, async (req, res) => {
  const { cartItems, total } = req.body;
  const userId = req.user.id;

  if (!cartItems || cartItems.length === 0) {
    return res.status(400).json({ message: "Cart is empty" });
  }

  try {
    // 1. Insert into orders table
    const [orderResult] = await db.query(
      "INSERT INTO orders (customer_id, total, created_at) VALUES (?, ?, NOW())",
      [userId, total]
    );
    const orderId = orderResult.insertId;

    // 2. Insert items into order_items table
    for (let item of cartItems) {
      await db.query(
        "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
        [orderId, item.id, item.quantity, item.price]
      );
    }

    res.status(201).json({ message: "Order placed successfully", orderId });
  } catch (err) {
    console.error("Checkout Error:", err);
    res.status(500).json({ message: "Failed to process order" });
  }
});

module.exports = router;
