const db = require("../../config/db"); // Use the correct relative path

exports.getSellerDashboard = async (req, res) => {
  try {
    const sellerId = req.user.id; // assuming you’re using auth middleware

    const [products] = await db.query(
      "SELECT * FROM products WHERE seller_id = ?",
      [sellerId]
    );

    const [totalSales] = await db.query(
      `SELECT SUM(oi.price * oi.quantity) AS total
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE p.seller_id = ?`,
      [sellerId]
    );

    res.json({
      totalProducts: products.length,
      totalSales: totalSales[0].total || 0,
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.addProduct = async (req, res) => {
  try {
    const { name, price, description, stock, category } = req.body;
    const sellerId = req.user.id;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const [result] = await db.query(
      "INSERT INTO products (seller_id, name, price, description, image, stock, category_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [sellerId, name, price, description, image, stock, category]
    );

    res
      .status(201)
      .json({ message: "Product added", productId: result.insertId });
  } catch (err) {
    console.error("Add Product Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getMyProducts = async (req, res) => {
  try {
    const sellerId = req.user.id;

    const [products] = await db.query(
      "SELECT id, name, price, description, image FROM products WHERE seller_id = ?",
      [sellerId]
    );

    res.status(200).json(products);
  } catch (err) {
    console.error("Get Products Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getPublicSellerProfile = async (req, res) => {
  const sellerId = req.params.id;

  try {
    const [[seller]] = await db.query(
      "SELECT id, business_name, description, profile_photo, phone AS contact FROM users WHERE id = ? AND role = 'seller'",
      [sellerId]
    );

    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    const [products] = await db.query(
      "SELECT id, name, price, image FROM products WHERE seller_id = ?",
      [sellerId]
    );

    res.json({ seller, products });
  } catch (err) {
    console.error("Error fetching public seller profile:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/seller/analytics
exports.getSellerAnalytics = async (req, res) => {
  console.log("Seller Analytics called");
  console.log("User from token:", req.user);

  const sellerId = req.user.id;

  try {
    // ✅ Total Sales
    const [[{ totalSales }]] = await db.query(
      `
      SELECT SUM(oi.price * oi.quantity) AS totalSales
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE p.seller_id = ?
      `,
      [sellerId]
    );

    // ✅ Best-Selling Products (by quantity sold)
    const [bestSelling] = await db.query(
      `
      SELECT p.name, SUM(oi.quantity) AS sold
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE p.seller_id = ?
      GROUP BY p.id
      ORDER BY sold DESC
      LIMIT 5
      `,
      [sellerId]
    );

    // ❌ Most Viewed: Skipped because `views` column does not exist.
    const mostViewed = []; // or omit from response

    // ✅ Daily Sales (based on order.created_at)
    const [dailySales] = await db.query(
      `
      SELECT DATE(o.created_at) AS date, SUM(oi.price * oi.quantity) AS total
      FROM orders o
      JOIN order_items oi ON oi.order_id = o.id
      JOIN products p ON oi.product_id = p.id
      WHERE p.seller_id = ?
      GROUP BY DATE(o.created_at)
      ORDER BY DATE(o.created_at) DESC
      LIMIT 7
      `,
      [sellerId]
    );

    res.json({
      totalSales: totalSales || 0,
      bestSelling,
      mostViewed, // returns empty array
      dailySales,
    });
  } catch (err) {
    console.error("Analytics Error:", err);
    res.status(500).json({
      message: "Failed to load analytics",
      error: err.message,
    });
  }
};
