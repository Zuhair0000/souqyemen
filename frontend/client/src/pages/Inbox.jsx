import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SellerNavBar from "../components/SellerNavBar";
import BackButton from "../components/BackButton";
import NavBar from "../components/NavBar";
import Icons from "../components/Icons";

export default function SellerInbox() {
  const [inbox, setInbox] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchInbox = async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:3001/api/user/inbox/${user.id}`,
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
  }, [user.id]);

  return (
    <>
      {user?.role === "seller" ? (
        <SellerNavBar />
      ) : (
        <NavBar>
          <Icons />
        </NavBar>
      )}

      <div className="max-w-2xl mx-auto my-8 p-5 bg-[#f4f1eb] rounded-lg">
        <BackButton />
        <h2 className="text-2xl font-bold mb-5 text-center">Messages</h2>
        {inbox.length === 0 ? (
          <p className="text-center text-gray-500 italic">No messages yet</p>
        ) : (
          inbox.map((user) => (
            <Link
              to={`/chat/${user.id}`}
              key={user.id}
              className="no-underline text-inherit"
            >
              <div className="bg-white border border-gray-300 rounded-lg px-5 py-4 mb-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
                <h4 className="text-lg font-semibold text-gray-800 mb-1">
                  {user.name}
                </h4>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
            </Link>
          ))
        )}
      </div>
    </>
  );
}
