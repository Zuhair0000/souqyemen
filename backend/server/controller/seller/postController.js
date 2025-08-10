const db = require("../../config/db");
const fs = require("fs");
const path = require("path");

// Create post
exports.createPost = async (req, res) => {
  const sellerId = req.user.id;
  const { title, content } = req.body;
  const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    await db.query(
      "INSERT INTO posts (seller_id, title, content, image) VALUES (?, ?, ?, ?)",
      [sellerId, title, content, imagePath]
    );
    res.status(201).json({ message: "Post created" });
  } catch (err) {
    console.error("Create post error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get posts by seller
exports.getMyPosts = async (req, res) => {
  const sellerId = req.user.id;
  try {
    const [posts] = await db.query(
      "SELECT * FROM posts WHERE seller_id = ? ORDER BY created_at DESC",
      [sellerId]
    );
    res.json(posts);
  } catch (err) {
    console.error("Get My Posts Error:", err);
    res.status(500).json({ message: "Failed to load posts" });
  }
};

// Get all posts (public)
exports.getAllPosts = async (req, res) => {
  try {
    const [posts] = await db.query(
      `SELECT 
  posts.*, 
  users.business_name, 
  users.profile_photo, 
  users.id AS seller_id
FROM posts
JOIN users ON posts.seller_id = users.id
ORDER BY posts.created_at DESC;`
    );
    res.json(posts);
  } catch (err) {
    console.error("Get All Posts Error:", err);
    res.status(500).json({ message: "Failed to load posts" });
  }
};

exports.updatePost = async (req, res) => {
  const sellerId = req.user.id;
  const postId = req.params.id;

  // fallback values if req.body is undefined
  const title = req.body?.title || null;
  const content = req.body?.content || null;
  const image = req.file?.path;

  if (!title || !content) {
    return res.status(400).json({ message: "Title and content are required" });
  }

  try {
    const [[post]] = await db.query(
      "SELECT * FROM posts WHERE id = ? AND seller_id = ?",
      [postId, sellerId]
    );
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Optional: delete old image
    if (image && post.image && fs.existsSync(post.image)) {
      fs.unlinkSync(post.image);
    }

    await db.query(
      `UPDATE posts SET title = ?, content = ?, image = COALESCE(?, image) WHERE id = ? AND seller_id = ?`,
      [title, content, image, postId, sellerId]
    );

    res.json({ message: "Post updated successfully" });
  } catch (err) {
    console.error("Update Post Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ❌ Delete post
exports.deletePost = async (req, res) => {
  const sellerId = req.user.id;
  const postId = req.params.id;

  try {
    const [[post]] = await db.query(
      "SELECT * FROM posts WHERE id = ? AND seller_id = ?",
      [postId, sellerId]
    );
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Delete image from disk
    if (post.image && fs.existsSync(post.image)) {
      fs.unlinkSync(post.image);
    }

    await db.query("DELETE FROM posts WHERE id = ? AND seller_id = ?", [
      postId,
      sellerId,
    ]);

    res.json({ message: "Post deleted" });
  } catch (err) {
    console.error("Delete Post Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
