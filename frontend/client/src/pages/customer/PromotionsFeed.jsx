import React, { useEffect, useState } from "react";
import axios from "axios";
import NavBar from "../../components/NavBar";
import Icons from "../../components/Icons";
import { Link } from "react-router-dom";
import logo from "../../assets/Logo.jpeg";
import BackButton from "../../components/BackButton";

export default function PromotionsFeed() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:3001/api/posts").then((res) => {
      setPosts(res.data);
    });
  }, []);

  return (
    <>
      <NavBar>
        <Icons />
      </NavBar>
      <div className="max-w-[1000px] mx-auto mt-8 px-7 bg-[#f4f1eb] py-8">
        <BackButton />
        <h2 className="text-center mb-6 text-[1.8rem] text-[#1c1e21] font-semibold">
          Promotional Posts
        </h2>
        <div className="flex flex-col gap-6">
          {posts.map((post) => (
            <div className="bg-white rounded-lg p-4 shadow-md" key={post.id}>
              <div className="flex justify-between items-center mb-3">
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
                    alt="Business"
                    className="w-12 h-12 rounded-full object-cover border-2 border-[#a22f29]"
                  />
                  <span className="text-base font-semibold text-[#1c1e21]">
                    {post.business_name}
                  </span>
                </Link>
                <span className="text-sm text-[#65676b]">
                  {new Date(post.created_at).toLocaleDateString()}
                </span>
              </div>

              <h4 className="text-lg font-semibold my-2">{post.title}</h4>
              <p className="text-base mb-3">{post.content}</p>
              {post.image && (
                <img
                  src={`http://localhost:3001/${post.image.replace(
                    /^\/?uploads/,
                    "uploads"
                  )}`}
                  alt="Post"
                  className="w-full max-h-[300px] object-cover rounded-md mt-2"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
