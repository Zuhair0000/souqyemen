const db = require("../../config/db"); // or wherever you connect MySQL

exports.getSellerOrders = async (req, res) => {
  const sellerId = req.user.id;

  try {
    const [rows] = await db.execute(
      `
      SELECT 
        o.id AS order_id,
        o.total,
        o.created_at,
        o.status,
        o.payment_method,
        u.name AS customer_name,
        u.phone AS customer_phone,
        u.address AS customer_location,
        oi.quantity,
        oi.price,
        p.name AS product_name,
        p.image
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      LEFT JOIN users u ON o.customer_id = u.id
      WHERE p.seller_id = ?
      ORDER BY o.created_at DESC
    `,
      [sellerId],
    );

    const grouped = {};
    for (const row of rows) {
      if (!grouped[row.order_id]) {
        grouped[row.order_id] = {
          order_id: row.order_id,
          total: row.total,
          status: row.status,
          payment_method: row.payment_method, // Added for COD visibility
          created_at: row.created_at,
          customer: {
            name: row.customer_name,
            phone: row.customer_phone,
            location: row.customer_location,
          },
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
    console.error("Error in getSellerOrders:", error);
    res.status(500).json({ message: "Failed to fetch seller orders" });
  }
};

exports.updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  // Add delivery_company_id to the destructured body
  const { status, delivery_company_id } = req.body;
  const seller_id = req.user.id;

  if (!status) return res.status(400).json({ message: "Status required" });

  try {
    // Verify seller owns this order
    const [orders] = await db.query(
      `SELECT o.id
       FROM orders o
       JOIN order_items oi ON o.id = oi.order_id
       JOIN products p ON oi.product_id = p.id
       WHERE o.id = ? AND p.seller_id = ?
       LIMIT 1`,
      [id, seller_id],
    );

    if (orders.length === 0)
      return res
        .status(403)
        .json({ message: "Not authorized to update this order" });

    // ✅ Update status AND handle Logistics Handoff
    if (status === "shipped" && delivery_company_id) {
      // Update order status and assign the delivery company
      await db.query(
        "UPDATE orders SET status = ?, delivery_company_id = ? WHERE id = ?",
        [status, delivery_company_id, id],
      );

      // Automatically add the first tracking update to the timeline
      await db.query(
        "INSERT INTO tracking_updates (order_id, update_text, created_at) VALUES (?, 'Order dispatched to delivery company', NOW())",
        [id],
      );
    } else {
      // Normal status update (pending, processing, cancelled)
      await db.query("UPDATE orders SET status = ? WHERE id = ?", [status, id]);
    }

    res.json({ message: "Order status updated" });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
