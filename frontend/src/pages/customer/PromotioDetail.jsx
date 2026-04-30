import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import logo from "../../assets/Logo.jpeg";
import BackButton from "../../components/BackButton";
import { useTranslation } from "react-i18next";
import { MessageCircle, Calendar } from "lucide-react";

export default function PromotionDetails() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const { t } = useTranslation();

  useEffect(() => {
    fetch(`https://souqyemen.store/api/posts/${id}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const text = await res.text();
        return JSON.parse(text);
      })
      .then((data) => setPost(data))
      .catch((err) => console.error("Error fetching promotion post:", err));
  }, [id]);

  if (!post)
    return (
      <div className="min-h-screen flex items-center justify-center text-xl text-rose-500 font-bold animate-pulse">
        {t("Loading...")}
      </div>
    );

  const isValidDate = post.created_at && !isNaN(new Date(post.created_at));

  return (
    <div className="min-h-screen bg-[#f4f1eb] py-8 md:py-12">
      <div className="max-w-[900px] mx-auto px-4 md:px-8">
        <BackButton />

        <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden mt-6">
          {/* Post Image Hero (If exists) */}
          {post.image && (
            <div className="w-full h-[300px] md:h-[450px] bg-gray-900 relative">
              <img
                src={
                  post.image.startsWith("http")
                    ? post.image.replace(
                        "https://souqyemen.store",
                        "https://souqyemen.store",
                      )
                    : `https://souqyemen.store${post.image.startsWith("/") ? "" : "/"}${post.image}`
                }
                alt={post.title}
                className="w-full h-full object-cover opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            </div>
          )}

          <div className="p-6 md:p-10 text-start">
            {/* Seller Info Header */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8 pb-8 border-b border-gray-100">
              <Link
                to={`/seller/public/${post.seller_id}`}
                className="flex items-center gap-4 group"
              >
                <img
                  src={
                    post.profile_photo
                      ? post.profile_photo.startsWith("http")
                        ? post.profile_photo.replace(
                            "https://souqyemen.store",
                            "https://souqyemen.store",
                          )
                        : `https://souqyemen.store${post.profile_photo.startsWith("/") ? "" : "/"}${post.profile_photo}`
                      : logo
                  }
                  alt={post.business_name || t("Business")}
                  className="w-16 h-16 rounded-full object-cover border-[3px] border-rose-100 shadow-sm group-hover:border-rose-400 transition-colors"
                />
                <div>
                  <span className="block text-xl font-black text-gray-800 group-hover:text-rose-600 transition-colors">
                    {post.business_name || t("Unknown Business")}
                  </span>
                  <span className="flex items-center gap-1.5 text-sm text-gray-500 font-medium mt-1">
                    <Calendar size={14} />
                    {isValidDate
                      ? new Date(post.created_at).toLocaleDateString()
                      : t("Unknown date")}
                  </span>
                </div>
              </Link>

              {/* Chat Button */}
              <Link to={`/chat/${post.seller_id}`}>
                <button className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-500 to-orange-500 text-white rounded-xl font-bold hover:shadow-lg hover:-translate-y-1 transition-all active:scale-95 w-full sm:w-auto">
                  <MessageCircle size={20} />
                  {t("Chat with Seller")}
                </button>
              </Link>
            </div>

            {/* Post Typography */}
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-6 leading-tight">
              {post.title}
            </h1>
            <div className="prose prose-lg text-gray-700 max-w-none leading-relaxed whitespace-pre-wrap">
              {post.content}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
