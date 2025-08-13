const express = require("express");
const router = express.Router();
const db = require("../config/db");
const {
  authenticate,
  authorizeRoles,
} = require("../middleware/authMiddleware");
const {
  getSellerDashboard,
  addProduct,
  getMyProducts,
  getPublicSellerProfile,
  getSellerAnalytics,
} = require("../controller/seller/dashboardController");
const {
  getSellerOrders,
  updateOrderStatus,
} = require("../controller/seller/orderController");
const upload = require("../middleware/upload");
const {
  createPost,
  getMyPosts,
  updatePost,
  deletePost,
} = require("../controller/seller/postController");

router.get("/public/:id", getPublicSellerProfile);

// Middleware to protect all seller routes
router.use(authenticate, authorizeRoles("seller"));

// Dashboard & Products
router.get("/dashboard", authenticate, getSellerAnalytics);
router.post("/products", upload.single("image"), addProduct);
router.get("/my-products", getMyProducts);
router.post("/posts", upload.single("image"), createPost);
router.get("/my-posts", getMyPosts);
router.put("/posts/:id", upload.single("image"), updatePost);
router.delete("/posts/:id", deletePost);
// router.get("/analytics", getSellerAnalytics);

router.get("/products/:id", async (req, res) => {
  const productId = req.params.id;
  const [rows] = await db.query("SELECT * FROM products WHERE id = ?", [
    productId,
  ]);
  if (rows.length === 0) return res.status(404).json({ message: "Not found" });
  res.json(rows[0]);
});

router.put("/edit-product/:id", async (req, res) => {
  const { id } = req.params;
  const { name, description, price, stock } = req.body;
  try {
    const [result] = await db.query(
      "UPDATE products SET name = ?, description = ?, price = ?, stock = ? WHERE id = ?",
      [name, description, price, stock, id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/products/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query("DELETE FROM products WHERE id = ?", [id]);
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Orders
router.get("/orders", getSellerOrders);
router.put("/orders/:id/status", authenticate, updateOrderStatus);

// GET /api/seller/inbox/:sellerId
router.get("/inbox/:sellerId", async (req, res) => {
  const { sellerId } = req.params;
  try {
    const [rows] = await db.query(
      `SELECT DISTINCT u.id, u.name, u.email
       FROM messages m
       JOIN users u ON u.id = m.sender_id
       WHERE m.receiver_id = ?`,
      [sellerId]
    );

    res.json(rows);
  } catch (err) {
    console.error("Inbox error:", err);
    res.status(500).json({ message: "Failed to fetch inbox" });
  }
});

// GET chat history between two users
router.get("/api/messages/:user1/:user2", async (req, res) => {
  const { user1, user2 } = req.params;
  const messages = await Message.find({
    $or: [
      { senderId: user1, receiverId: user2 },
      { senderId: user2, receiverId: user1 },
    ],
  }).sort({ createdAt: 1 });
  res.json(messages);
});

module.exports = router;
