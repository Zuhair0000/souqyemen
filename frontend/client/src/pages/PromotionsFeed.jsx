import React, { useEffect, useState } from "react";
import axios from "axios";
import NavBar from "../components/NavBar";
import Icons from "../components/Icons";
import "./PromotionsFeed.css";
import { Link } from "react-router-dom";
import logo from "../assets/Logo.jpeg";

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
      <div className="promo-feed-container">
        <h2 className="promo-feed-title">Promotional Posts</h2>
        <div className="promo-post-list">
          {posts.map((post) => (
            <div className="promo-post-card" key={post.id}>
              <div className="promo-post-header">
                <Link
                  to={`/seller/public/${post.seller_id}`}
                  className="promo-seller-link"
                >
                  <img
                    src={
                      post.profile_photo
                        ? `http://localhost:3001${post.profile_photo}`
                        : logo
                    }
                    alt="Business"
                    className="promo-seller-avatar"
                  />
                  <span className="promo-seller-name">
                    {post.business_name}
                  </span>
                </Link>
                <span className="promo-post-date">
                  {new Date(post.created_at).toLocaleDateString()}
                </span>
              </div>

              <h4 className="promo-post-title">{post.title}</h4>
              <p className="promo-post-content">{post.content}</p>
              {post.image && (
                <img
                  src={`http://localhost:3001/${post.image.replace(
                    /^\/?uploads/,
                    "uploads"
                  )}`}
                  alt="Post"
                  className="promo-post-image"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
