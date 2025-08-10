const db = require("../../config/db"); // or wherever you connect MySQL

exports.getSellerOrders = async (req, res) => {
  const sellerId = req.user.id; // this comes from the token decoded by protect()

  try {
    const [orders] = await db.execute(
      `
      SELECT 
        o.id AS order_id,
        o.customer_id,
        o.total,
        o.created_at,
        o.status,
        oi.quantity,
        oi.price,
        p.name AS product_name,
        p.image
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      WHERE p.seller_id = ?
      ORDER BY o.created_at DESC
    `,
      [sellerId]
    );

    const grouped = {};
    for (const row of orders) {
      if (!grouped[row.order_id]) {
        grouped[row.order_id] = {
          order_id: row.order_id,
          total: row.total,
          status: row.status,
          created_at: row.created_at,
          products: [],
        };
      }

      grouped[row.order_id].products.push({
        name: row.product_name,
        quantity: row.quantity,
        price: row.price,
        image: row.image,
      });
    }

    res.json({ orders: Object.values(grouped) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch seller orders" });
  }
};

exports.updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const seller_id = req.user.id;

  if (!status) return res.status(400).json({ message: "Status required" });

  try {
    const [orders] = await db.query(
      `SELECT o.id
       FROM orders o
       JOIN order_items oi ON o.id = oi.order_id
       JOIN products p ON oi.product_id = p.id
       WHERE o.id = ? AND p.seller_id = ?
       LIMIT 1`,
      [id, seller_id]
    );

    if (orders.length === 0)
      return res
        .status(403)
        .json({ message: "Not authorized to update this order" });

    // ✅ Update status
    await db.query("UPDATE orders SET status = ? WHERE id = ?", [status, id]);

    res.json({ message: "Order status updated" });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
