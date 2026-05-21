const express = require("express");
const router = express.Router();
const {
  getMessages,
  postMessages,
  markAllAsRead,
  getUnreadCount,
} = require("../controller/userController");
const { authenticate } = require("../middleware/authMiddleware");

// 1. Static routes MUST come first!
router.get("/unread", authenticate, getUnreadCount);
router.put("/mark-read", authenticate, markAllAsRead);
router.post("/", postMessages);

// 2. Dynamic parameter routes MUST come last!
router.get("/:user1/:user2", getMessages);

module.exports = router;
