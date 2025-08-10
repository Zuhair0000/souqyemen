import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./SellerInbox.css"; // ✅ Import the CSS file
import SellerNavBar from "./SellerNavBar";

export default function SellerInbox() {
  const [inbox, setInbox] = useState([]);
  const seller = JSON.parse(localStorage.getItem("user")); // seller info

  useEffect(() => {
    const fetchInbox = async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:3001/api/seller/inbox/${seller.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      setInbox(Array.isArray(data) ? data : []);
    };
    fetchInbox();
  }, [seller.id]);

  return (
    <>
      <SellerNavBar />
      <div className="inbox-container">
        <h2 className="inbox-title">Messages</h2>
        {inbox.length === 0 ? (
          <p className="inbox-empty">No messages yet</p>
        ) : (
          inbox.map((user) => (
            <Link
              to={`/seller/chat/${user.id}`}
              key={user.id}
              className="inbox-link"
            >
              <div className="message-card">
                <h4>{user.name}</h4>
                <p>{user.email}</p>
              </div>
            </Link>
          ))
        )}
      </div>
    </>
  );
}
