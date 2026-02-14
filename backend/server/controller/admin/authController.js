const db = require("../../config/db");

exports.getPendingSellers = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM users WHERE role = 'seller' AND status = 'pending'"
    );

    res.json(rows);
  } catch (error) {
    console.error("Error fetching pending sellers:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateSellerStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  try {
    await db.query(
      "UPDATE users SET status = ? WHERE id = ? AND role = 'seller'",
      [status, id]
    );

    res.json({ message: `Seller ${status}` });
  } catch (error) {
    console.error("Error updating seller status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Fetch all users (excluding admin if desired)
exports.getAllUsers = async (req, res) => {
  try {
    const [users] = await db.query(
      "SELECT * FROM users WHERE role != 'admin' AND status != 'banned'"
    );
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Ban a user (e.g., set status to 'banned')
exports.banUser = async (req, res) => {
  const { id } = req.params;

  try {
    await db.query("UPDATE users SET status = 'banned' WHERE id = ?", [id]);
    res.json({ message: "User banned" });
  } catch (error) {
    console.error("Error banning user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Fetch all products
exports.getAllProducts = async (req, res) => {
  try {
    const [products] = await db.query("SELECT * FROM products");
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a product
exports.deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    await db.query("DELETE FROM products WHERE id = ?", [id]);
    res.json({ message: "Product deleted" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Fetch all orders
exports.getAllOrders = async (req, res) => {
  try {
    const [orders] = await db.query("SELECT * FROM orders");
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.generateReport = async (req, res) => {
  try {
    // 1️⃣ Basic counts
    const [[users]] = await db.query(
      "SELECT COUNT(*) as totalUsers FROM users"
    );

    const [[sellers]] = await db.query(
      "SELECT COUNT(*) as totalSellers FROM users WHERE role='seller'"
    );

    const [[products]] = await db.query(
      "SELECT COUNT(*) as totalProducts FROM products"
    );

    const [[orders]] = await db.query(
      "SELECT COUNT(*) as totalOrders FROM orders"
    );

    const [[revenue]] = await db.query(
      "SELECT IFNULL(SUM(total),0) as totalRevenue FROM orders WHERE status='completed'"
    );

    // 2️⃣ Top 5 sellers by revenue
    // const [topSellers] = await db.query(`
    //   SELECT u.id, u.name,
    //          IFNULL(SUM(o.total),0) as revenue
    //   FROM users u
    //   LEFT JOIN orders o
    //     ON u.id = o.seller_id
    //     AND o.status='completed'
    //   WHERE u.role='seller'
    //   GROUP BY u.id
    //   ORDER BY revenue DESC
    //   LIMIT 5
    // `);

    // 3️⃣ Top 5 products (ONLY if order_items exists)
    const [topProducts] = await db.query(`
      SELECT p.name,
             IFNULL(SUM(oi.quantity),0) as totalSold
      FROM products p
      LEFT JOIN order_items oi ON p.id = oi.product_id
      LEFT JOIN orders o 
        ON oi.order_id = o.id 
        AND o.status='completed'
      GROUP BY p.id
      ORDER BY totalSold DESC
      LIMIT 5
    `);

    res.json({
      totalUsers: users.totalUsers,
      totalSellers: sellers.totalSellers,
      totalProducts: products.totalProducts,
      totalOrders: orders.totalOrders,
      totalRevenue: revenue.totalRevenue,
      // topSellers,
      topProducts,
    });
  } catch (error) {
    console.error("Admin Report Error:", error);
    res.status(500).json({ message: error.message });
  }
};
