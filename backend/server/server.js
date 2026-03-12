const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const { Server } = require("socket.io");
const http = require("http");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

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
const {
  getAllPosts,
  getPostById,
} = require("./controller/seller/postController");
const { OAuth2Client } = require("google-auth-library");

// Initialize the Google Client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
dotenv.config();

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
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
app.get("/api/posts/:id", getPostById);

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

// POST: /api/auth/google/login (Use this for both Login and Signup components)
app.post("/api/auth/google/login", async (req, res) => {
  const { token } = req.body;

  try {
    // 1. Verify the token with Google
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    // Extract user info from Google
    const payload = ticket.getPayload();
    const googleEmail = payload.email;
    const googleName = payload.name;
    // const googlePhoto = payload.picture; // Optional: save their profile pic

    // 2. Check if user exists in your database
    let [users] = await db.query("SELECT * FROM users WHERE email = ?", [
      googleEmail,
    ]);
    let user = users[0];

    // 3. If user doesn't exist, Auto-Register them as a Customer!
    if (!user) {
      // Create a random secure password since they use Google
      const randomPassword = await bcrypt.hash(
        Math.random().toString(36).slice(-8),
        10,
      );

      const [insertResult] = await db.query(
        "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'customer')",
        [googleName, googleEmail, randomPassword],
      );

      // Fetch the newly created user
      const [newUsers] = await db.query("SELECT * FROM users WHERE id = ?", [
        insertResult.insertId,
      ]);
      user = newUsers[0];
    }

    // 4. Generate JWT Token for login
    const jwtToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || "your_super_secret_key",
      { expiresIn: "7d" },
    );

    // 5. Send successful response
    res.status(200).json({
      message: "Login successful",
      token: jwtToken,
      role: user.role,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status || "approved",
      },
    });
  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(401).json({ message: "Invalid Google Token" });
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
      [productId],
    );

    if (!product) return res.status(404).json({ message: "Product not found" });

    const [related] = await db.query(
      `SELECT products.*, categories.name AS category 
       FROM products 
       JOIN categories ON products.category_id = categories.id 
       WHERE products.category_id = ? AND products.id != ? 
       LIMIT 4`,
      [product.category_id, productId],
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
      [categoryId],
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
        [senderId, receiverId, message],
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
