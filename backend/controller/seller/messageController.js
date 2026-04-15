// backend/controller/seller/messageController.js
const db = require("../../config/db");

exports.getInbox = async (req, res) => {
  const { sellerId } = req.params;
  try {
    const [rows] = await db.query(
      `SELECT DISTINCT u.id, u.name, u.email
       FROM messages m
       JOIN users u ON u.id = m.sender_id
       WHERE m.receiver_id = ?`,
      [sellerId],
    );
    res.json(rows);
  } catch (err) {
    console.error("Inbox error:", err);
    res.status(500).json({ message: "Failed to fetch inbox" });
  }
};

exports.getChatHistory = async (req, res) => {
  const { user1, user2 } = req.params;
  try {
    // FIXED: Swapped MongoDB code for the correct MySQL query
    const [messages] = await db.query(
      `SELECT * FROM messages 
       WHERE (sender_id = ? AND receiver_id = ?) 
          OR (sender_id = ? AND receiver_id = ?) 
       ORDER BY timestamp ASC`,
      [user1, user2, user2, user1],
    );
    res.json(messages);
  } catch (err) {
    console.error("Chat history error:", err);
    res.status(500).json({ message: "Server error fetching messages" });
  }
};
