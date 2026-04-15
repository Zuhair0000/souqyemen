import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import logo from "../../assets/Logo.jpeg";
import BackButton from "../../components/BackButton";
import { useTranslation } from "react-i18next";
import { Sparkles } from "lucide-react";

export default function PromotionsFeed() {
  const [posts, setPosts] = useState([]);
  const { t } = useTranslation();

  useEffect(() => {
    axios.get("http://localhost:3001/api/posts").then((res) => {
      setPosts(res.data);
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdfbf7] via-rose-50/30 to-[#f4f1eb] py-8">
      <div className="max-w-[800px] mx-auto px-4 md:px-8">
        <BackButton />

        {/* Glowing Header */}
        <div className="flex items-center justify-center gap-4 mb-10 mt-6">
          <div className="w-14 h-14 bg-gradient-to-br from-rose-500 to-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-rose-500/30">
            <Sparkles size={28} />
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-gray-800 tracking-tight">
            {t("Promotional Posts")}
          </h2>
        </div>

        <div className="flex flex-col gap-8">
          {posts.map((post) => (
            <div
              className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-rose-100/50 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              key={post.id}
            >
              {/* Post Header (Seller Info) */}
              <div className="flex justify-between items-center mb-5">
                <Link
                  to={`/seller/public/${post.seller_id}`}
                  className="flex items-center gap-4 group no-underline"
                >
                  <img
                    src={
                      post.profile_photo
                        ? `http://localhost:3001${post.profile_photo}`
                        : logo
                    }
                    alt="Business"
                    className="w-14 h-14 rounded-full object-cover border-[3px] border-rose-100 group-hover:border-rose-400 transition-colors shadow-sm"
                  />
                  <div>
                    <span className="block text-lg font-bold text-gray-900 group-hover:text-rose-600 transition-colors">
                      {post.business_name}
                    </span>
                    <span className="text-sm text-gray-400 font-medium">
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </Link>
              </div>

              {/* Post Content */}
              <Link
                to={`/promotions/${post.id}`}
                className="block outline-none group"
              >
                <h4 className="text-2xl font-black text-gray-800 mb-3 group-hover:text-rose-500 transition-colors">
                  {post.title}
                </h4>
                <p className="text-lg text-gray-600 leading-relaxed mb-5 line-clamp-3">
                  {post.content}
                </p>

                {post.image && (
                  <div className="w-full rounded-[1.5rem] overflow-hidden bg-gray-50 border border-gray-100 relative">
                    <img
                      src={`http://localhost:3001/${post.image.replace(/^\/?uploads/, "uploads")}`}
                      alt="Post"
                      className="w-full max-h-[450px] object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    {/* Subtle overlay gradient on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                )}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
