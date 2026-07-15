import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import SellerNavBar from "./SellerNavBar";
import NavBar from "./NavBar";
import Icons from "./Icons";
import BackButton from "./BackButton";
import { Send, UserCircle2, ImagePlus, X } from "lucide-react";
import { API_URL } from "../config";

const socket = io(API_URL);

export default function ChatBox() {
  const { id: receiverId } = useParams();
  const user = JSON.parse(localStorage.getItem("user"));

  const [message, setMessage] = useState("");
  const [image, setImage] = useState(null); // State for the selected file
  const [imagePreview, setImagePreview] = useState(null); // State for UI preview
  const [chat, setChat] = useState([]);
  const [isSending, setIsSending] = useState(false);

  // 🔥 NEW: State for fullscreen image modal
  const [fullScreenImage, setFullScreenImage] = useState(null);

  const chatContainerRef = useRef(null);
  const fileInputRef = useRef(null);

  const roomId = [user.id, receiverId].sort().join("_");

  useEffect(() => {
    socket.emit("joinRoom", roomId);

    socket.on("receiveMessage", (data) => {
      if (data.sender_id === user.id) return;
      setChat((prev) => (Array.isArray(prev) ? [...prev, data] : [data]));
    });

    const token = localStorage.getItem("token");

    fetch(`${API_URL}/api/messages/${user.id}/${receiverId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Request fsiled: ${res.status}`);
        return res.json();
      })
      .then((data) => setChat(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error("Failed to fetch messages", err);
        setChat([]);
      });

    // Clear unread badge
    const markAsRead = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        await fetch(`${API_URL}/api/messages/mark-read`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ sender_id: receiverId }),
        });
      } catch (err) {
        console.error("Failed to mark chat as read", err);
      }
    };
    markAsRead();

    return () => {
      socket.emit("leaveRoom", roomId);
      socket.off("receiveMessage");
    };
  }, [receiverId, roomId, user.id]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chat]);

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const sendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!message.trim() && !image) return;

    setIsSending(true);

    const formData = new FormData();
    formData.append("sender_id", user.id);
    formData.append("receiver_id", receiverId);
    formData.append("message", message);
    if (image) {
      formData.append("image", image);
    }

    try {
      const res = await fetch(`${API_URL}/api/messages`, {
        method: "POST",
        body: formData,
      });
      const result = await res.json();

      if (res.ok) {
        const finalMessageData = {
          sender_id: user.id,
          receiver_id: receiverId,
          message: message,
          image_url: result.image_url,
        };

        socket.emit("sendMessage", finalMessageData);
        setChat((prev) =>
          Array.isArray(prev)
            ? [...prev, finalMessageData]
            : [finalMessageData],
        );

        setMessage("");
        removeImage();
      }
    } catch (err) {
      console.error("Failed to save message", err);
    } finally {
      setIsSending(false);
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
            {Array.isArray(chat) &&
              chat.map((msg, i) => {
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
                      {/* 🔥 Render Image if it exists (Now Clickable) 🔥 */}
                      {msg.image_url && (
                        <img
                          src={`${API_URL}${msg.image_url}`}
                          alt="attachment"
                          onClick={() =>
                            setFullScreenImage(`${API_URL}${msg.image_url}`)
                          }
                          className="max-w-full rounded-lg mb-2 object-cover border border-white/20 cursor-pointer hover:opacity-90 transition-opacity shadow-sm"
                          style={{ maxHeight: "250px" }}
                        />
                      )}
                      {/* Render Text if it exists */}
                      {msg.message && (
                        <p className="text-[15px] leading-relaxed">
                          {msg.message}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Image Preview Area */}
          {imagePreview && (
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
              <div className="relative inline-block">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-20 w-20 object-cover rounded-xl shadow-sm border border-gray-200"
                />
                <button
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 bg-gray-900 text-white p-1 rounded-full hover:bg-rose-500 transition-colors shadow-md"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Chat Input Area */}
          <div className="p-4 bg-white border-t border-gray-100">
            <form onSubmit={sendMessage} className="flex items-center gap-3">
              {/* Hidden File Input */}
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageChange}
                className="hidden"
              />

              {/* Upload Image Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="w-12 h-12 flex-shrink-0 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center hover:bg-rose-100 transition-colors"
              >
                <ImagePlus size={24} />
              </button>

              <div className="flex-1 flex items-center bg-gray-50 p-1.5 rounded-full border border-gray-200 focus-within:border-rose-400 focus-within:bg-white transition-all shadow-inner">
                <input
                  type="text"
                  value={message}
                  placeholder="Type a message..."
                  onChange={(e) => setMessage(e.target.value)}
                  className="flex-1 bg-transparent px-4 py-2 outline-none text-gray-700 w-full"
                />
                <button
                  type="submit"
                  disabled={(!message.trim() && !image) || isSending}
                  className="w-10 h-10 flex-shrink-0 bg-gradient-to-r from-rose-500 to-orange-500 text-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95 ml-1 mr-1"
                >
                  <Send size={18} className="ml-0.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* 🔥 THE FULLSCREEN IMAGE MODAL 🔥 */}
      {fullScreenImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 sm:p-8 animate-in fade-in duration-200"
          onClick={() => setFullScreenImage(null)} // Closes when clicking the background
        >
          {/* Close Button */}
          <button
            onClick={() => setFullScreenImage(null)}
            className="absolute top-4 right-4 md:top-8 md:right-8 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 rounded-full p-2 transition-all z-50"
          >
            <X size={32} />
          </button>

          {/* The Image */}
          <img
            src={fullScreenImage}
            alt="fullscreen attachment"
            onClick={(e) => e.stopPropagation()} // Prevents closing when clicking the image itself
            className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}
