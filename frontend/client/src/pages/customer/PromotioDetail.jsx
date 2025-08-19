import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import logo from "../../assets/Logo.jpeg"; // fallback logo image
import NavBar from "../../components/NavBar";
import Icons from "../../components/Icons";
import BackButton from "../../components/BackButton";

export default function PromotionDetails() {
  const { id } = useParams();
  const [post, setPost] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:3001/api/posts/${id}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const text = await res.text();
        return JSON.parse(text);
      })
      .then((data) => setPost(data))
      .catch((err) => console.error("Error fetching promotion post:", err));
  }, [id]);

  if (!post) return <div>Loading...</div>;

  const isValidDate = post.created_at && !isNaN(new Date(post.created_at));

  return (
    <>
      <div className="max-w-[900px] mx-auto mt-8 px-7 border-2 py-8">
        {/* Seller Info */}
        <BackButton />
        <div className="flex justify-between items-center mb-4">
          <Link
            to={`/seller/public/${post.seller_id}`}
            className="flex items-center gap-3 text-inherit no-underline"
          >
            <img
              src={
                post.profile_photo
                  ? `http://localhost:3001${post.profile_photo}`
                  : logo
              }
              alt={post.business_name || "Business"}
              className="w-12 h-12 rounded-full object-cover border-2 border-[#a22f29]"
            />
            <span className="text-base font-semibold text-[#1c1e21]">
              {post.business_name || "Unknown Business"}
            </span>
          </Link>
          <span className="text-sm text-[#65676b]">
            {isValidDate
              ? new Date(post.created_at).toLocaleDateString()
              : "Unknown date"}
          </span>
        </div>

        {/* Post Content */}
        <h2 className="text-2xl font-semibold mb-4">{post.title}</h2>
        <p className="mb-4">{post.content}</p>
        {post.image && (
          <img
            src={`http://localhost:3001/${post.image.replace(
              /^\/?uploads/,
              "uploads"
            )}`}
            alt={post.title}
            className="w-full max-h-[400px] object-cover rounded-md mb-4"
          />
        )}
        <Link to={`/chat/${post.seller_id}`}>
          <button className="mt-4 ml-4 px-6 py-3 bg-red-700 text-white rounded-md text-lg hover:bg-red-900 transition">
            Chat with Seller
          </button>
        </Link>
      </div>
    </>
  );
}
