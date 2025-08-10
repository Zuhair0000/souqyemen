const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const { Server } = require("socket.io");
const http = require("http");

const db = require("./config/db");

// Import routes
const indexRoutes = require("./routes/index");
const authRoutes = require("./routes/authRoutes");
const sellerRoutes = require("./routes/sellerRoutes");
const userRoutes = require("./routes/userRoutes");
const orderRoutes = require("./routes/orderRoutes");
const messageRoutes = require("./routes/messageRoutes");
const adminRoutes = require("./routes/admin");
const { Socket } = require("dgram");
const { getAllPosts } = require("./controller/seller/postController");

dotenv.config();

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Use routes
app.use("/api", indexRoutes); // General routes
app.use("/api/auth", authRoutes); // /api/auth/register, /api/auth/login
app.use("/api/user", userRoutes); // /api/user/profile, etc.
app.use("/api/seller", sellerRoutes); // /api/seller/products, etc.
app.use("/api/orders", orderRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/admin", adminRoutes);
app.get("/api/posts", getAllPosts);

// Product and Category Routes
app.get("/api/products", async (req, res) => {
  try {
    const [products] = await db.query("SELECT * FROM products");
    res.json(products);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/products/:id", async (req, res) => {
  const productId = req.params.id;

  try {
    const [[product]] = await db.query(
      `SELECT products.*, categories.name AS category 
       FROM products 
       JOIN categories ON products.category_id = categories.id 
       WHERE products.id = ?`,
      [productId]
    );

    if (!product) return res.status(404).json({ message: "Product not found" });

    const [related] = await db.query(
      `SELECT products.*, categories.name AS category 
       FROM products 
       JOIN categories ON products.category_id = categories.id 
       WHERE products.category_id = ? AND products.id != ? 
       LIMIT 4`,
      [product.category_id, productId]
    );

    res.json({ product, related });
  } catch (err) {
    console.error("Error fetching product details:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/products/category/:id", async (req, res) => {
  const categoryId = req.params.id;

  try {
    const [products] = await db.query(
      "SELECT * FROM products WHERE category_id = ?",
      [categoryId]
    );
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

app.get("/api/categories", async (req, res) => {
  try {
    const [categories] = await db.query("SELECT * FROM categories");
    res.json(categories);
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).json({ error: "Server error" });
  }
});

const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
  });

  socket.on("leaveRoom", (roomId) => {
    socket.leave(roomId);
  });

  socket.on("sendMessage", async ({ senderId, receiverId, message }) => {
    if (!senderId || !receiverId || !message) {
      console.error("Invalid message data", { senderId, receiverId, message });
      return;
    }

    const roomId = [senderId, receiverId].sort().join("_");

    // Emit to the room
    io.to(roomId).emit("receiveMessage", { senderId, receiverId, message });

    // Save to database
    try {
      await db.query(
        "INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)",
        [senderId, receiverId, message]
      );
    } catch (err) {
      console.error("Error saving message to DB:", err);
    }
  });
});

// Start server
server.listen(process.env.PORT, () => {
  console.log(`🚀 Server running on port ${process.env.PORT}`);
});
