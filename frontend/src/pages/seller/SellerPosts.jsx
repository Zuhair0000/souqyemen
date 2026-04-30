import React, { useEffect, useState } from "react";
import axios from "axios";
import BackButton from "../../components/BackButton";
import { useTranslation } from "react-i18next";
import {
  PenLine,
  Image as ImageIcon,
  Edit3,
  Trash2,
  Megaphone,
} from "lucide-react";

export default function SellerPosts() {
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState({ title: "", content: "" });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const { t } = useTranslation();

  const token = localStorage.getItem("token");

  const fetchMyPosts = async () => {
    const res = await axios.get("https://souqyemen.store/api/seller/my-posts", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setPosts(res.data);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("content", form.content);
    if (imageFile) formData.append("image", imageFile);

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    };
    if (editingId) {
      await axios.put(
        `https://souqyemen.store/api/seller/posts/${editingId}`,
        formData,
        { headers },
      );
    } else {
      await axios.post("https://souqyemen.store/api/seller/posts", formData, {
        headers,
      });
    }

    setForm({ title: "", content: "" });
    setImageFile(null);
    setPreview(null);
    setEditingId(null);
    fetchMyPosts();
  };

  const handleEdit = (post) => {
    setForm({ title: post.title, content: post.content });
    setImageFile(null);
    setPreview(
      post.image
        ? `https://souqyemen.store/${post.image.replace(/^\/?uploads/, "uploads")}`
        : null,
    );
    setEditingId(post.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (window.confirm(t("Are you sure you want to delete this post?"))) {
      await axios.delete(`https://souqyemen.store/api/seller/posts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchMyPosts();
    }
  };

  useEffect(() => {
    fetchMyPosts();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50/40 via-orange-50/30 to-white pb-20 py-8">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <BackButton />

        <div className="flex items-center gap-4 mb-8 mt-4">
          <div className="w-14 h-14 bg-white shadow-sm border border-gray-100 rounded-2xl flex items-center justify-center text-[#a22f29]">
            <Megaphone size={28} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">
              {t("Promotional Posts")}
            </h2>
            <p className="text-gray-500 font-medium mt-1">
              {t("Share updates and offers with customers.")}
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left Column: Composer */}
          <div className="w-full lg:w-[450px] bg-white rounded-[1.5rem] shadow-sm border border-gray-100 p-6 sticky top-[100px]">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <PenLine size={20} className="text-[#a22f29]" />
              {editingId ? t("Edit Post") : t("Create Post")}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder={t("Catchy Title...")}
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#a22f29] focus:bg-white transition-colors font-bold text-gray-800"
              />
              <textarea
                placeholder={t("What do you want to share?")}
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#a22f29] focus:bg-white transition-colors h-32 resize-none"
              />

              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors relative overflow-hidden group">
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-400 group-hover:text-[#a22f29] transition-colors">
                    <ImageIcon size={32} className="mb-2" />
                    <span className="text-sm font-bold">
                      {t("Attach Image")}
                    </span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>

              <div className="pt-2 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-gray-900 text-white py-3.5 rounded-xl font-bold hover:bg-gray-800 shadow-md transition-all active:scale-95"
                >
                  {editingId ? t("Update") : t("Publish")}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setForm({ title: "", content: "" });
                      setPreview(null);
                      setImageFile(null);
                    }}
                    className="px-6 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                  >
                    {t("Cancel")}
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Right Column: Feed */}
          <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-6">
            {posts.length === 0 ? (
              <div className="col-span-full text-center py-20 text-gray-500 font-bold">
                {t("No posts yet. Create your first one!")}
              </div>
            ) : (
              posts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white rounded-[1.5rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow"
                >
                  {post.image && (
                    <div className="w-full h-48 bg-gray-50">
                      <img
                        src={`https://souqyemen.store/${post.image.replace(/^\/?uploads/, "uploads")}`}
                        alt="Post"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-5 flex-1 flex flex-col text-start">
                    <span className="text-xs font-bold text-gray-400 mb-2">
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>
                    <h4 className="text-xl font-black text-gray-900 mb-2 leading-tight">
                      {post.title}
                    </h4>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {post.content}
                    </p>

                    <div className="mt-auto pt-4 border-t border-gray-100 flex gap-2">
                      <button
                        onClick={() => handleEdit(post)}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-blue-50 text-blue-600 py-2 rounded-lg text-sm font-bold hover:bg-blue-600 hover:text-white transition-colors"
                      >
                        <Edit3 size={16} /> {t("Edit")}
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-red-50 text-red-600 py-2 rounded-lg text-sm font-bold hover:bg-red-600 hover:text-white transition-colors"
                      >
                        <Trash2 size={16} /> {t("Delete")}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
