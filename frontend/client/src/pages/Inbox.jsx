import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SellerNavBar from "../components/SellerNavBar";
import BackButton from "../components/BackButton";
import NavBar from "../components/NavBar";
import Icons from "../components/Icons";
import { useTranslation } from "react-i18next";
import { MessageSquare, ChevronRight, MessageCircle } from "lucide-react";

export default function SellerInbox() {
  const [inbox, setInbox] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));
  const { t, i18n } = useTranslation();

  const isArabic = i18n.language === "ar";

  useEffect(() => {
    const fetchInbox = async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:3001/api/user/inbox/${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const data = await res.json();
      setInbox(Array.isArray(data) ? data : []);
    };
    fetchInbox();
  }, [user.id]);

  // Helper function to extract initials for the colorful avatars
  const getInitials = (name) => {
    if (!name) return "U";
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-[#f4f1eb]">
      {/* Navigation */}
      {user?.role === "seller" ? (
        <SellerNavBar />
      ) : (
        <NavBar>
          <Icons />
        </NavBar>
      )}

      <div className="max-w-[800px] mx-auto my-8 px-4 md:px-8">
        <BackButton />

        {/* Header Section */}
        <div className="flex items-center gap-4 mb-8 mt-6">
          <div className="w-14 h-14 bg-gradient-to-br from-rose-500 to-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-rose-500/30">
            <MessageSquare size={28} />
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-gray-800 tracking-tight">
            {t("Messages")}
          </h2>
        </div>

        {/* Inbox Container */}
        <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 p-3 md:p-5">
          {inbox.length === 0 ? (
            /* Empty State */
            <div className="text-center py-16 flex flex-col items-center">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-6 border-4 border-white shadow-sm">
                <MessageCircle size={48} />
              </div>
              <p className="text-2xl font-bold text-gray-800 mb-2">
                {t("No messages yet")}
              </p>
              <p className="text-gray-500 font-medium">
                {t("When you start a conversation, it will appear here.") ||
                  "When you start a conversation, it will appear here."}
              </p>
            </div>
          ) : (
            /* Chat List */
            <div className="flex flex-col gap-2">
              {inbox.map((chatUser, index) => (
                <Link
                  to={`/chat/${chatUser.id}`}
                  key={chatUser.id}
                  className="group flex items-center justify-between p-4 rounded-[1.5rem] hover:bg-rose-50 transition-all duration-300 border border-transparent hover:border-rose-100 outline-none animate-[fadeSlideUp_0.4s_ease_forwards]"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center gap-4">
                    {/* Dynamic Avatar */}
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-rose-100 to-orange-100 text-rose-600 flex items-center justify-center font-black text-lg shadow-inner group-hover:scale-105 transition-transform duration-300 shrink-0 border border-rose-200/50">
                      {getInitials(chatUser.name)}
                    </div>

                    {/* Chat Info */}
                    <div className="text-start">
                      <h4 className="text-lg font-bold text-gray-900 group-hover:text-rose-600 transition-colors">
                        {chatUser.name}
                      </h4>
                      <p className="text-sm font-medium text-gray-500 truncate max-w-[180px] sm:max-w-[400px]">
                        {chatUser.email}
                      </p>
                    </div>
                  </div>

                  {/* Action Icon */}
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-gray-300 group-hover:text-rose-500 group-hover:bg-white group-hover:shadow-sm transition-all duration-300 shrink-0">
                    <ChevronRight
                      size={22}
                      className={isArabic ? "rotate-180" : ""}
                    />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
