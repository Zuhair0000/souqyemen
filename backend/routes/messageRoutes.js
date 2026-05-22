const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const {
  getMessages,
  postMessages,
  markAllAsRead,
  getUnreadCount,
} = require("../controller/userController");
const { authenticate } = require("../middleware/authMiddleware");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Saves to your existing uploads folder
  },
  filename: (req, file, cb) => {
    cb(null, "chat_" + Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// 1. Static routes MUST come first!
router.get("/unread", authenticate, getUnreadCount);
router.put("/mark-read", authenticate, markAllAsRead);
router.post("/", postMessages);

// 2. Dynamic parameter routes MUST come last!
router.get("/:user1/:user2", getMessages);

module.exports = router;
