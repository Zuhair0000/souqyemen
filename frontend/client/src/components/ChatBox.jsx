import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import "./ChatBox.css";
import SellerNavBar from "./SellerNavBar";
import NavBar from "./NavBar";

const socket = io("http://localhost:3001");

export default function ChatBox() {
  const { id: receiverId } = useParams();
  const user = JSON.parse(localStorage.getItem("user"));
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

  const roomId = [user.id, receiverId].sort().join("_");

  useEffect(() => {
    socket.emit("joinRoom", roomId);

    socket.on("receiveMessage", (data) => {
      setChat((prev) => [...prev, data]);
    });

    fetch(`http://localhost:3001/api/messages/${user.id}/${receiverId}`)
      .then((res) => res.json())
      .then((data) => setChat(data))
      .catch((err) => console.error("Failed to fetch messages", err));

    return () => {
      socket.emit("leaveRoom", roomId);
      socket.off("receiveMessage");
    };
  }, [receiverId, roomId, user.id]);

  const sendMessage = async () => {
    if (message.trim()) {
      const data = {
        sender_id: user.id,
        receiver_id: receiverId,
        message,
      };

      socket.emit("sendMessage", data);
      setChat((prev) => [...prev, data]);
      setMessage("");

      try {
        await fetch("http://localhost:3001/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      } catch (err) {
        console.error("Failed to save message to database", err);
      }
    }
  };

  return (
    <>
      {user?.role === "seller" ? <SellerNavBar /> : <NavBar />}

      <div className="chatbox-container">
        <h2>Chat with {user.role === "customer" ? "Seller" : "Customer"}</h2>

        <div className="chatbox-messages">
          {chat.map((msg, i) => (
            <p className="chatbox-message" key={i}>
              <strong>
                {msg.sender_id === user.id
                  ? "You"
                  : user.role === "customer"
                  ? "Seller"
                  : "Customer"}
                :
              </strong>
              {msg.message}
            </p>
          ))}
        </div>

        <div className="chatbox-input">
          <input
            type="text"
            value={message}
            placeholder="Type a message"
            onChange={(e) => setMessage(e.target.value)}
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </>
  );
}
