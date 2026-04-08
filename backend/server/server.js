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
app.use("/api/delivery", shippingCompanyRoutes);
app.get("/api/posts", getAllPosts);
app.get("/api/posts/:id", getPostById);

// Product and Category Routes
app.get("/api/products", async (req, res) => {
  try {
    const sql = `
      SELECT 
        p.*, 
        AVG(r.rating) as avg_rating, 
        COUNT(r.id) as total_reviews 
      FROM products p 
      LEFT JOIN reviews r ON p.id = r.product_id 
      GROUP BY p.id
    `;

    const [products] = await db.query(sql);
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
    // 1. Fetch the main product WITH the average rating and review count
    const [[product]] = await db.query(
      `SELECT 
          p.*, 
          c.name AS category, 
          AVG(r.rating) as avg_rating, 
          COUNT(r.id) as total_reviews
       FROM products p
       JOIN categories c ON p.category_id = c.id 
       LEFT JOIN reviews r ON p.id = r.product_id
       WHERE p.id = ?
       GROUP BY p.id`,
      [productId],
    );

    if (!product) return res.status(404).json({ message: "Product not found" });

    // 2. Fetch the related products WITH their average ratings
    const [related] = await db.query(
      `SELECT 
          p.*, 
          c.name AS category, 
          AVG(r.rating) as avg_rating
       FROM products p
       JOIN categories c ON p.category_id = c.id 
       LEFT JOIN reviews r ON p.id = r.product_id
       WHERE p.category_id = ? AND p.id != ? 
       GROUP BY p.id
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

app.get("/api/sellers", async (req, res) => {
  try {
    // We only select the columns needed for the frontend cards
    // 'role' must match exactly what you have in your DB (e.g., 'seller' or 'merchant')
    const sql = `
            SELECT 
                id, 
                name AS owner_name, 
                business_name, 
                role
            FROM users 
            WHERE role = 'seller'
        `;

    const [rows] = await db.execute(sql);

    // If your DB doesn't have a 'rating' or 'total_products' column yet,
    // we can safely send the rows as they are.
    res.status(200).json(rows);
  } catch (error) {
    console.error("SQL Error fetching sellers:", error);
    res.status(500).json({ message: "Database error occurred" });
  }
});

// POST route to submit a rating
app.post("/api/reviews", async (req, res) => {
  const { order_id, product_id, rating, comment } = req.body;

  // 1. Extract the token from the React frontend headers
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1];
  let userId;

  // 2. Decrypt the token to get the actual User ID
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your_super_secret_key",
    );
    userId = decoded.id;
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Invalid or expired token",
    });
  }

  // --- THE FIX: VALIDATION & NULL CONVERSION ---

  // Let's print exactly what the frontend sent to help you debug!

  // If the frontend forgot to send the product_id or order_id, reject it cleanly
  if (!order_id || !product_id || !rating) {
    return res.status(400).json({
      success: false,
      message:
        "Missing required data! Check your terminal console to see what is undefined.",
    });
  }

  // If comment is undefined (which is fine, it's optional), convert it to a database-friendly 'null'
  const safeComment = comment === undefined ? null : comment;

  // 3. Save the review to the database
  try {
    const sql = `
      INSERT INTO reviews (user_id, product_id, order_id, rating, comment) 
      VALUES (?, ?, ?, ?, ?)
    `;
    await db.execute(sql, [userId, product_id, order_id, rating, safeComment]);

    res
      .status(201)
      .json({ success: true, message: "Review submitted successfully" });
  } catch (error) {
    console.error("Error saving review:", error);

    // Error code 1062 is MySQL's code for a duplicate entry (because of our UNIQUE KEY)
    if (error.errno === 1062) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this item for this order.",
      });
    }
    res
      .status(500)
      .json({ success: false, message: "Failed to submit review" });
  }
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

// Inside your Node.js backend (e.g., routes/recommendations.js)

// app.get("/api/users/:userId/recommendations", async (req, res) => {
//   const { userId } = req.params;

//   try {
//     console.log(`Asking ML Server for user ${userId}'s recommendations...`);

//     // 1. Node.js sends a request to your Python ML Server
//     const mlResponse = await fetch(
//       `http://127.0.0.1:8000/api/recommend/${userId}`,
//     );

//     if (!mlResponse.ok) {
//       throw new Error(`ML Server responded with status: ${mlResponse.status}`);
//     }

//     // 2. Parse the JSON from the Python server
//     const mlData = await mlResponse.json();

//     // 3. Send those exact recommendations straight to your React frontend!
//     res.status(200).json({
//       success: true,
//       user_id: userId,
//       recommended_products: mlData.recommendations,
//     });
//   } catch (error) {
//     console.error("AI Engine Error:", error);
//     res.status(500).json({
//       success: false,
//       message: "AI recommendations are currently unavailable.",
//     });
//   }
// });

// Start server
server.listen(process.env.PORT, () => {
  console.log(`🚀 Server running on port ${process.env.PORT}`);
});
