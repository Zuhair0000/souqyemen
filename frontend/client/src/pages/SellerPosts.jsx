import React, { useEffect, useState } from "react";
import axios from "axios";
import SellerNavBar from "../components/SellerNavBar";
import "./SellerPosts.css";

export default function SellerPosts() {
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState({ title: "", content: "" });
  const [imageFile, setImageFile] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const token = localStorage.getItem("token");

  const fetchMyPosts = async () => {
    const res = await axios.get("http://localhost:3001/api/seller/my-posts", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setPosts(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("content", form.content);
    if (imageFile) formData.append("image", imageFile);

    if (editingId) {
      // 🔁 Update post
      await axios.put(
        `http://localhost:3001/api/seller/posts/${editingId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
    } else {
      // ➕ Create post
      await axios.post("http://localhost:3001/api/seller/posts", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
    }

    setForm({ title: "", content: "" });
    setImageFile(null);
    setEditingId(null);
    fetchMyPosts();
  };

  const handleEdit = (post) => {
    setForm({ title: post.title, content: post.content });
    setImageFile(null);
    setEditingId(post.id);
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this post?")) {
      await axios.delete(`http://localhost:3001/api/seller/posts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchMyPosts();
    }
  };

  useEffect(() => {
    fetchMyPosts();
  }, []);

  return (
    <>
      <SellerNavBar />
      <div className="seller-posts">
        <h2>{editingId ? "Edit Post" : "Create Post"}</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <textarea
            placeholder="Content"
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            required
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files[0])}
          />
          <button type="submit">
            {editingId ? "Update Post" : "Create Post"}
          </button>
          {editingId && (
            <button
              type="button"
              className="cancel-btn"
              onClick={() => {
                setEditingId(null);
                setForm({ title: "", content: "" });
                setImageFile(null);
              }}
            >
              Cancel
            </button>
          )}
        </form>

        <div className="post-list">
          {posts.map((post) => (
            <div key={post.id} className="post-card">
              <h4>{post.title}</h4>
              <p>{post.content}</p>
              {post.image && (
                <img
                  src={`http://localhost:3001/${post.image.replace(
                    /^\/?uploads/,
                    "uploads"
                  )}`}
                  alt="Post"
                />
              )}
              <small>{new Date(post.created_at).toLocaleString()}</small>
              <div className="post-actions">
                <button onClick={() => handleEdit(post)}>Edit</button>
                <button
                  className="delete"
                  onClick={() => handleDelete(post.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
