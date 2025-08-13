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
  const sellerId = req.user.id;

  try {
    // Total sales
    const [totalSalesResult] = await db.query(
      `SELECT IFNULL(SUM(o.total), 0) AS totalSales
       FROM orders o
       JOIN order_items oi ON o.id = oi.order_id
       JOIN products p ON oi.product_id = p.id
       WHERE p.seller_id = ? AND o.status = 'completed'`,
      [sellerId]
    );

    // Total orders (count distinct orders for this seller)
    const [totalOrdersResult] = await db.query(
      `SELECT COUNT(DISTINCT o.id) AS totalOrders
       FROM orders o
       JOIN order_items oi ON o.id = oi.order_id
       JOIN products p ON oi.product_id = p.id
       WHERE p.seller_id = ?`,
      [sellerId]
    );

    // Average order value
    const avgOrderValue =
      totalOrdersResult[0].totalOrders > 0
        ? totalSalesResult[0].totalSales / totalOrdersResult[0].totalOrders
        : 0;

    // Best-selling products
    const [bestSelling] = await db.query(
      `SELECT p.name, SUM(oi.quantity) AS sold
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       JOIN orders o ON oi.order_id = o.id
       WHERE p.seller_id = ? AND o.status = 'completed'
       GROUP BY p.id, p.name
       ORDER BY sold DESC
       LIMIT 5`,
      [sellerId]
    );

    // Daily sales (last 7 days)
    const [dailySales] = await db.query(
      `SELECT DATE(o.created_at) AS date, SUM(o.total) AS total
       FROM orders o
       JOIN order_items oi ON o.id = oi.order_id
       JOIN products p ON oi.product_id = p.id
       WHERE p.seller_id = ? AND o.status = 'completed'
       GROUP BY DATE(o.created_at)
       ORDER BY date DESC
       LIMIT 7`,
      [sellerId]
    );

    // Revenue last 30 days
    const [revenueLast30] = await db.query(
      `SELECT DATE(o.created_at) AS date, SUM(o.total) AS revenue
       FROM orders o
       JOIN order_items oi ON o.id = oi.order_id
       JOIN products p ON oi.product_id = p.id
       WHERE p.seller_id = ? AND o.status = 'completed'
       GROUP BY DATE(o.created_at)
       ORDER BY date ASC
       LIMIT 30`,
      [sellerId]
    );

    // Recent orders (latest 5 for this seller)
    const [recentOrders] = await db.query(
      `SELECT o.id, o.customer_id, o.total, o.status, o.created_at AS date
       FROM orders o
       JOIN order_items oi ON o.id = oi.order_id
       JOIN products p ON oi.product_id = p.id
       WHERE p.seller_id = ?
       GROUP BY o.id
       ORDER BY o.created_at DESC
       LIMIT 5`,
      [sellerId]
    );

    // Low stock products
    // Low stock products
    const [lowStock] = await db.query(
      `SELECT id, name, stock
   FROM products
   WHERE seller_id = ? AND stock < 5
   ORDER BY stock ASC`,
      [sellerId]
    );

    res.json({
      totalSales: totalSalesResult[0].totalSales,
      totalOrders: totalOrdersResult[0].totalOrders,
      avgOrderValue,
      salesDelta: 0, // placeholder for percentage change logic
      ordersDelta: 0, // placeholder for percentage change logic
      revenueLast30,
      dailySales: dailySales.reverse(), // oldest first
      bestSelling,
      recentOrders,
      lowStock,
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
};
