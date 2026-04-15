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
const shippingCompanyRoutes = require("./routes/shippingCompanyRoutes");
const productsRoutes = require("./routes/productsRoutes");

const { Socket } = require("dgram");
const {
  getAllPosts,
  getPostById,
} = require("./controller/seller/postController");

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
app.use("/api", indexRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/seller", sellerRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/delivery", shippingCompanyRoutes);
app.get("/api/posts", getAllPosts);
app.get("/api/posts/:id", getPostById);
app.use("/api/products", productsRoutes);

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
