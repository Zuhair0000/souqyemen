import React, { useEffect, useState } from "react";
import axios from "axios";
import SellerNavBar from "../../components/SellerNavBar";
import BackButton from "../../components/BackButton";

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
      <div className="font-sans bg-[#f4f1eb] max-w-[1000px] mx-auto py-5 mt-8">
        <BackButton />
        <h2 className="text-center my-8 text-2xl text-[#2c3e50]">
          {editingId ? "Edit Post" : "Create Post"}
        </h2>

        <form
          onSubmit={handleSubmit}
          className="max-w-[600px] mx-auto mb-8 bg-white p-8 rounded-lg shadow-md"
        >
          <input
            type="text"
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
            className="w-full mb-4 p-3 border border-gray-300 rounded-md text-base"
          />
          <textarea
            placeholder="Content"
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            required
            className="w-full mb-4 p-3 border border-gray-300 rounded-md text-base h-[120px] resize-y"
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files[0])}
            className="w-full mb-4 p-3 border border-gray-300 rounded-md text-base"
          />
          <button
            type="submit"
            className="bg-[#1abc9c] text-white px-6 py-3 rounded-md text-base cursor-pointer transition-colors duration-300 hover:bg-[#16a085]"
          >
            {editingId ? "Update Post" : "Create Post"}
          </button>
          {editingId && (
            <button
              type="button"
              className="ml-2 bg-gray-400 text-black px-4 py-3 rounded-md"
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

        <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6 px-8 pb-12 max-w-[1100px] mx-auto">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-white p-5 rounded-lg shadow-md transition-transform duration-200 hover:-translate-y-1"
            >
              <h4 className="mb-2 text-lg text-[#34495e]">{post.title}</h4>
              <p className="my-1 text-[#555]">{post.content}</p>
              {post.image && (
                <img
                  src={`http://localhost:3001/${post.image.replace(
                    /^\/?uploads/,
                    "uploads"
                  )}`}
                  alt="Post"
                  className="w-full h-[180px] object-cover rounded-md my-3"
                />
              )}
              <small className="block text-gray-500 text-sm">
                {new Date(post.created_at).toLocaleString()}
              </small>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => handleEdit(post)}
                  className="bg-[#2980b9] text-white px-4 py-2 rounded-md text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(post.id)}
                  className="bg-[#e74c3c] text-white px-4 py-2 rounded-md text-sm hover:bg-[#c0392b]"
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
