// routes/orderRoutes.js
const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { authenticate } = require("../middleware/authMiddleware");

// Checkout route
router.post("/checkout", authenticate, async (req, res) => {
  const { cartItems, total, paymentDetails } = req.body;
  const userId = req.user.id;

  try {
    // 1. GATEKEEPER: Check if the user has a registered address
    const [userRows] = await db.query(
      "SELECT address FROM users WHERE id = ?",
      [userId],
    );

    if (
      userRows.length === 0 ||
      !userRows[0].address ||
      userRows[0].address.trim() === ""
    ) {
      return res.status(400).json({
        message:
          "Address required. Please update your profile with a delivery address before placing an order.",
      });
    }

    // 2. Validate Cart
    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const method = paymentDetails?.method || "Card";
    const provider = paymentDetails?.provider || null;
    const accountInfo = paymentDetails?.accountInfo || null;

    // 3. Insert into orders table
    const [orderResult] = await db.query(
      `INSERT INTO orders 
      (customer_id, total, status, payment_method, payment_provider, payment_account_info, created_at) 
      VALUES (?, ?, 'pending', ?, ?, ?, NOW())`,
      [userId, total, method, provider, accountInfo],
    );
    const orderId = orderResult.insertId;

    // 4. Insert items into order_items table
    for (let item of cartItems) {
      await db.query(
        "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
        [orderId, item.id, item.quantity, item.price],
      );
    }

    res.status(201).json({ message: "Order placed successfully", orderId });
  } catch (err) {
    console.error("Checkout Error:", err);
    res.status(500).json({ message: "Failed to process order" });
  }
});

// Complete Order route
router.put("/user/orders/:id/complete", authenticate, async (req, res) => {
  const orderId = req.params.id;
  const customerId = req.user.id;

  try {
    const [result] = await db.query(
      `UPDATE orders SET status = 'completed' WHERE id = ? AND customer_id = ? AND status = 'delivered'`,
      [orderId, customerId],
    );

    if (result.affectedRows === 0) {
      return res
        .status(400)
        .json({ message: "Order not found or cannot be completed yet." });
    }

    await db.query(
      "INSERT INTO tracking_updates (order_id, update_text) VALUES (?, ?)",
      [orderId, "Order completed. Customer confirmed receipt."],
    );

    res.json({ message: "Order successfully marked as completed." });
  } catch (error) {
    console.error("Error completing order:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
