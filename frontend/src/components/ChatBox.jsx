import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import SellerNavBar from "./SellerNavBar";
import NavBar from "./NavBar";
import Icons from "./Icons";
import BackButton from "./BackButton";
import { Send, UserCircle2 } from "lucide-react";

const socket = io("https://souqyemen.store");

export default function ChatBox() {
  const { id: receiverId } = useParams();
  const user = JSON.parse(localStorage.getItem("user"));
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const chatContainerRef = useRef(null);

  const roomId = [user.id, receiverId].sort().join("_");

  useEffect(() => {
    socket.emit("joinRoom", roomId);

    socket.on("receiveMessage", (data) => setChat((prev) => [...prev, data]));

    fetch(`https://souqyemen.store/api/messages/${user.id}/${receiverId}`)
      .then((res) => res.json())
      .then((data) => setChat(data))
      .catch((err) => console.error("Failed to fetch messages", err));

    return () => {
      socket.emit("leaveRoom", roomId);
      socket.off("receiveMessage");
    };
  }, [receiverId, roomId, user.id]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chat]);

  const sendMessage = async (e) => {
    if (e) e.preventDefault();
    if (message.trim()) {
      const data = { sender_id: user.id, receiver_id: receiverId, message };
      socket.emit("sendMessage", data);
      setChat((prev) => [...prev, data]);
      setMessage("");

      try {
        await fetch("https://souqyemen.store/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      } catch (err) {
        console.error("Failed to save message", err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f1eb] flex flex-col">
      {user?.role === "seller" ? (
        <SellerNavBar />
      ) : (
        <NavBar>
          <Icons />
        </NavBar>
      )}

      <div className="flex-1 w-full max-w-[800px] mx-auto p-4 md:p-6 flex flex-col">
        <BackButton />

        <div className="flex-1 bg-white rounded-[2rem] shadow-xl border border-gray-100 flex flex-col overflow-hidden mt-4">
          {/* Chat Header */}
          <div className="bg-white px-6 py-4 border-b border-gray-100 flex items-center gap-4 shadow-sm z-10">
            <div className="w-12 h-12 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center">
              <UserCircle2 size={32} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {user.role === "customer" ? "Seller" : "Customer"}
              </h2>
              <span className="flex items-center gap-2 text-sm text-green-500 font-medium">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Online
              </span>
            </div>
          </div>

          {/* Chat Messages Area */}
          <div
            ref={chatContainerRef}
            className="flex-1 p-6 overflow-y-auto bg-gray-50 flex flex-col gap-4 scrollbar-hide"
            style={{ maxHeight: "calc(100vh - 350px)", minHeight: "400px" }}
          >
            {chat.map((msg, i) => {
              const isMe = msg.sender_id === user.id;
              return (
                <div
                  key={i}
                  className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] p-4 shadow-sm ${
                      isMe
                        ? "bg-gradient-to-br from-rose-500 to-orange-500 text-white rounded-t-2xl rounded-bl-2xl rounded-br-sm"
                        : "bg-white text-gray-800 border border-gray-100 rounded-t-2xl rounded-br-2xl rounded-bl-sm"
                    }`}
                  >
                    <p className="text-[15px] leading-relaxed">{msg.message}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Chat Input Area */}
          <div className="p-4 bg-white border-t border-gray-100">
            <form
              onSubmit={sendMessage}
              className="flex items-center gap-3 bg-gray-50 p-2 rounded-full border border-gray-200 focus-within:border-rose-400 focus-within:bg-white transition-all shadow-inner"
            >
              <input
                type="text"
                value={message}
                placeholder="Type a message..."
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1 bg-transparent px-4 py-2 outline-none text-gray-700"
              />
              <button
                type="submit"
                disabled={!message.trim()}
                className="w-12 h-12 bg-gradient-to-r from-rose-500 to-orange-500 text-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95"
              >
                <Send size={20} className="ml-1" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
