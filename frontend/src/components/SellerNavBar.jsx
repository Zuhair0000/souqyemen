import React, { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  LayoutDashboard,
  PlusCircle,
  Package,
  PenLine,
  ShoppingCart,
  MessageSquare,
  UserCircle2,
  LogOut,
  Globe,
  Menu,
  X,
} from "lucide-react";
import logo from "../assets/Logo.jpeg";
import { useTranslation } from "react-i18next";

export default function SellerNavBar({ children }) {
  const navigate = useNavigate();
  const sellerId = localStorage.getItem("sellerId");
  const [isOpen, setIsOpen] = useState(false);

  // Notification States
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  const dropdownRef = useRef(null);
  const { t, i18n } = useTranslation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("sellerId");
    navigate("/login");
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "ar" : "en";
    i18n.changeLanguage(newLang);
  };

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      // Fetch Orders
      try {
        const ordersRes = await axios.get(
          "https://souqyemen.store/api/seller/orders",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const orders = ordersRes.data.orders || ordersRes.data;
        const pendingCount = orders.filter(
          (order) => order.status?.toLowerCase() === "pending",
        ).length;
        setNewOrdersCount(pendingCount);
      } catch (error) {
        console.error("Failed to fetch pending orders", error);
      }

      // Fetch Unread Messages
      try {
        const msgRes = await axios.get(
          "https://souqyemen.store/api/messages/unread",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setUnreadMessagesCount(msgRes.data.unreadCount || 0);
      } catch (error) {
        console.error("Failed to fetch unread messages", error);
      }
    };

    fetchNotifications();

    // Poll every 30 seconds so the badge updates naturally
    // after a user marks a specific chat as read inside ChatBox.jsx
    const intervalId = setInterval(fetchNotifications, 30000);
    return () => clearInterval(intervalId);
  }, []);

  // RTL Layout fix
  useEffect(() => {
    const dir = i18n.language === "ar" ? "rtl" : "ltr";
    document.dir = dir;
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  // Click outside listener for mobile menu
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const linkClass = ({ isActive }) => `
    flex items-center gap-1.5 py-2 px-3 rounded-lg text-sm font-bold transition-all duration-200
    ${
      isActive
        ? "bg-[#a22f29] text-white shadow-sm"
        : "text-gray-700 hover:bg-[#f9eaea] hover:text-[#a22f29]"
    }
  `;

  // Removed the custom onClick handler from the Inbox item
  const navItems = [
    { to: "/seller/dashboard", icon: LayoutDashboard, label: t("Dashboard") },
    { to: "/seller/add-product", icon: PlusCircle, label: t("Add Item") },
    { to: "/seller/my-products", icon: Package, label: t("Inventory") },
    { to: "/seller/posts", icon: PenLine, label: t("Promote") },
    {
      to: `/seller/orders/${sellerId}/status`,
      icon: ShoppingCart,
      label: t("Orders"),
    },
    {
      to: "/seller/inbox",
      icon: MessageSquare,
      label: t("Messages"),
    },
    {
      to: `/seller/public/${sellerId}`,
      icon: UserCircle2,
      label: t("Profile"),
    },
  ];

  return (
    <nav className="w-full py-5 bg-white/80 backdrop-blur-xl shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-[1500px] mx-auto flex items-center justify-between px-4 py-2">
        {/* Logo */}
        <NavLink
          to="/seller/dashboard"
          className="flex items-center gap-3 transition-transform hover:scale-105"
        >
          <img
            src={logo}
            alt="logo"
            className="h-[80px] w-auto rounded shadow-sm border border-gray-100"
          />
          <div className="hidden lg:flex flex-col text-start">
            <span className="text-4xl font-black text-[#a22f29] leading-none">
              {i18n.language === "ar" ? "سوق اليمن" : "Souq Yemen"}
            </span>
            <span className="text-[20px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">
              {t("Seller Hub")}
            </span>
          </div>
        </NavLink>

        {children}

        {/* Desktop Menu */}
        <div className="hidden xl:flex items-center gap-1">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={linkClass}>
              <div className="relative">
                <item.icon size={18} />

                {/* Orders Badge */}
                {item.to.includes("/orders") && newOrdersCount > 0 && (
                  <span className="absolute -top-1.5 -end-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-1 ring-white">
                    {newOrdersCount > 99 ? "99+" : newOrdersCount}
                  </span>
                )}

                {/* Messages Badge */}
                {item.to.includes("/inbox") && unreadMessagesCount > 0 && (
                  <span className="absolute -top-1.5 -end-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-1 ring-white">
                    {unreadMessagesCount > 99 ? "99+" : unreadMessagesCount}
                  </span>
                )}
              </div>
              <span>{item.label}</span>
            </NavLink>
          ))}

          <div className="h-6 w-px bg-gray-200 mx-2"></div>

          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 py-2 px-3 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <Globe size={18} className="text-[#a22f29]" />
            <span>{i18n.language === "en" ? "AR" : "EN"}</span>
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 py-2 px-3 ms-1 rounded-lg text-sm font-bold text-white bg-gray-900 hover:bg-gray-800 shadow-sm transition-colors"
          >
            <LogOut size={18} />
            <span>{t("Logout")}</span>
          </button>
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="xl:hidden text-[#a22f29] p-1.5 rounded-lg hover:bg-[#f9eaea] transition-colors relative"
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}

          {/* Mobile hamburger indicator if ANY notifications exist */}
          {!isOpen && (newOrdersCount > 0 || unreadMessagesCount > 0) && (
            <span className="absolute top-0 end-0 flex h-3 w-3 rounded-full bg-red-500 ring-2 ring-white"></span>
          )}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full start-0 w-full bg-white shadow-xl border-t border-gray-200 xl:hidden z-50"
        >
          <div className="flex flex-col p-4 gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={linkClass}
                onClick={() => setIsOpen(false)}
              >
                <div className="relative">
                  <item.icon size={20} />

                  {/* Mobile Orders Badge */}
                  {item.to.includes("/orders") && newOrdersCount > 0 && (
                    <span className="absolute -top-1 -end-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                      {newOrdersCount}
                    </span>
                  )}

                  {/* Mobile Messages Badge */}
                  {item.to.includes("/inbox") && unreadMessagesCount > 0 && (
                    <span className="absolute -top-1 -end-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                      {unreadMessagesCount}
                    </span>
                  )}
                </div>
                <span>{item.label}</span>
              </NavLink>
            ))}

            <div className="h-px bg-gray-200 my-2"></div>

            <button
              onClick={() => {
                toggleLanguage();
                setIsOpen(false);
              }}
              className="flex items-center gap-3 py-2 px-3 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-100 text-start"
            >
              <Globe size={20} className="text-[#a22f29]" />
              {i18n.language === "en" ? "العربية" : "English"}
            </button>

            <button
              onClick={() => {
                handleLogout();
                setIsOpen(false);
              }}
              className="flex items-center gap-3 py-2 px-3 rounded-lg text-sm font-bold text-white bg-gray-900 hover:bg-gray-800 text-start mt-1"
            >
              <LogOut size={20} />
              {t("Logout")}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
