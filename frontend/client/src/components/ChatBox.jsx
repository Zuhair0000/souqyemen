import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
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

      <div className="max-w-[800px] mx-auto my-10 p-5 bg-[#fdfdfd] border border-[#e2e0db] rounded-lg shadow-md font-[Segoe_UI]">
        <h2 className="text-2xl mb-5 text-[#333] text-center">
          Chat with {user.role === "customer" ? "Seller" : "Customer"}
        </h2>

        <div className="max-h-[350px] overflow-y-auto bg-[#f9f7f3] p-4 border border-[#e0ded7] rounded-lg mb-5">
          {chat.map((msg, i) => (
            <p
              className="mb-3 p-3.5 bg-white border border-[#e8e6e1] rounded-lg text-[#333]"
              key={i}
            >
              <strong className="block mb-1.5 text-[#555] text-[0.95rem]">
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

        <div className="flex gap-2.5">
          <input
            type="text"
            value={message}
            placeholder="Type a message"
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 p-3.5 text-base border border-[#d6d3ce] rounded-lg bg-[#fffefc] focus:outline-none focus:border-[#b5b1aa] transition"
          />
          <button
            onClick={sendMessage}
            className="bg-[#8a775f] text-white px-4 py-2.5 rounded-lg font-bold cursor-pointer transition hover:bg-[#6e5f4c]"
          >
            Send
          </button>
        </div>
      </div>
    </>
  );
}
