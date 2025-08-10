const db = require("../../config/db");

exports.createOrder = async (req, res) => {
  const { cartItems, total } = req.body;
  const userId = req.user.id;

  try {
    const [orderResult] = await db.query(
      "INSERT INTO orders (customer_id, total) VALUES (?, ?)",
      [userId, total]
    );

    const orderId = orderResult.insertId;

    for (let item of cartItems) {
      await db.query(
        "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
        [orderId, item.id, item.quantity, item.price]
      );
    }

    res.status(201).json({ message: "Order placed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Checkout failed" });
  }
};
