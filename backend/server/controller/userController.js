const db = require("../config/db");

// GET /api/user/profile
exports.getProfile = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, name, email, phone, address, role, business_name FROM users WHERE id = ?",
      [req.user.id]
    );
    if (rows.length === 0)
      return res.status(404).json({ message: "User not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/user/profile
exports.updateProfile = async (req, res) => {
  const { name, email, phone, address } = req.body;
  try {
    await db.query(
      "UPDATE users SET name = ?, email = ?, phone = ?, address = ? WHERE id = ?",
      [name, email, phone, address, req.user.id]
    );
    res.json({ message: "Profile updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Update failed" });
  }
};

// GET /api/user/orders
// GET /api/user/orders
exports.getMyOrders = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT 
          o.id AS order_id, o.status, o.total,
          p.name AS product_name, oi.quantity, oi.price
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE o.customer_id = ?
        ORDER BY o.id DESC`,
      [req.user.id]
    );

    const ordersMap = {};

    rows.forEach((row) => {
      if (!ordersMap[row.order_id]) {
        ordersMap[row.order_id] = {
          id: row.order_id,
          status: row.status,
          total: row.total,
          items: [],
        };
      }

      if (row.product_name) {
        ordersMap[row.order_id].items.push({
          name: row.product_name,
          quantity: row.quantity,
          price: row.price,
        });
      }
    });

    res.status(200).json(Object.values(ordersMap));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load orders" });
  }
};
// PUT /api/user/settings
exports.updateSettings = async (req, res) => {
  const { notificationsEnabled } = req.body;
  try {
    await db
      .promise()
      .query("UPDATE users SET notifications_enabled = ? WHERE id = ?", [
        notificationsEnabled,
        req.user.id,
      ]);
    res.json({ message: "Settings updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Update failed" });
  }
};

// GET /api/user/products/category/:categoryId
exports.getProductsByCategory = async (req, res) => {
  const categoryId = req.params.categoryId;

  try {
    const [products] = await db.query(
      `SELECT p.*, c.name AS category 
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.category_id = ?`,
      [categoryId]
    );

    res.json(products);
  } catch (err) {
    console.error("Get Products by Category Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getMessages = async (req, res) => {
  const { user1, user2 } = req.params;
  try {
    const [rows] = await db.query(
      `SELECT * FROM messages 
       WHERE (sender_id = ? AND receiver_id = ?) 
          OR (sender_id = ? AND receiver_id = ?) 
       ORDER BY timestamp`,
      [user1, user2, user2, user1]
    );
    res.json(rows);
  } catch (err) {
    console.error("Fetch messages error:", err); // Check this in the console
    res.status(500).json({ message: "Server error" });
  }
};

exports.postMessages = async (req, res) => {
  const { sender_id, receiver_id, message } = req.body;

  if (!sender_id || !receiver_id || !message) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    const sql =
      "INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)";
    await db.query(sql, [sender_id, receiver_id, message]);

    res.status(201).json({ success: true, message: "Message saved" });
  } catch (err) {
    console.error("Error saving message:", err);
    res.status(500).json({ error: "Database error" });
  }
};
