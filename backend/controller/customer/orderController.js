const db = require("../../config/db");

exports.createOrder = async (req, res) => {
  const { cartItems, total } = req.body;
  const userId = req.user.id;

  try {
    const [orderResult] = await db.query(
      "INSERT INTO orders (customer_id, total) VALUES (?, ?)",
      [userId, total],
    );

    const orderId = orderResult.insertId;

    for (let item of cartItems) {
      await db.query(
        "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
        [orderId, item.id, item.quantity, item.price],
      );
    }

    res.status(201).json({ message: "Order placed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Checkout failed" });
  }
};

exports.checkout = async (req, res) => {
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

    // 2. Validate Cart is not empty
    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // 3. NEW GATEKEEPER: Verify sufficient stock for all items BEFORE charging/ordering
    for (let item of cartItems) {
      const [productRows] = await db.query(
        "SELECT stock, name FROM products WHERE id = ?",
        [item.id],
      );

      if (productRows.length === 0) {
        return res
          .status(400)
          .json({ message: `Product ID ${item.id} no longer exists.` });
      }

      const availableStock = productRows[0].stock;
      if (availableStock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${productRows[0].name}. Only ${availableStock} left in stock.`,
        });
      }
    }

    const method = paymentDetails?.method || "Card";
    const provider = paymentDetails?.provider || null;
    const accountInfo = paymentDetails?.accountInfo || null;

    // 4. Insert into orders table
    const [orderResult] = await db.query(
      `INSERT INTO orders 
      (customer_id, total, status, payment_method, payment_provider, payment_account_info, created_at) 
      VALUES (?, ?, 'pending', ?, ?, ?, NOW())`,
      [userId, total, method, provider, accountInfo],
    );
    const orderId = orderResult.insertId;

    // 5. Insert items into order_items AND deduct stock
    for (let item of cartItems) {
      // Record the item in the order
      await db.query(
        "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
        [orderId, item.id, item.quantity, item.price],
      );

      // NEW: Safely deduct the purchased quantity from the product's stock
      await db.query("UPDATE products SET stock = stock - ? WHERE id = ?", [
        item.quantity,
        item.id,
      ]);
    }

    res.status(201).json({ message: "Order placed successfully", orderId });
  } catch (err) {
    console.error("Checkout Error:", err);
    res.status(500).json({ message: "Failed to process order" });
  }
};

exports.completeOrder = async (req, res) => {
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
};
