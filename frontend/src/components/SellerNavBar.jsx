import React, { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
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

  // CRITICAL FIX: This effect runs on load and ensures the layout matches the saved language
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

  // Smaller, tighter link styles
  const linkClass = ({ isActive }) => `
    flex items-center gap-1.5 py-2 px-3 rounded-lg text-sm font-bold transition-all duration-200
    ${
      isActive
        ? "bg-[#a22f29] text-white shadow-sm"
        : "text-gray-700 hover:bg-[#f9eaea] hover:text-[#a22f29]"
    }
  `;

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
    { to: "/seller/inbox", icon: MessageSquare, label: t("Messages") },
    {
      to: `/seller/public/${sellerId}`,
      icon: UserCircle2,
      label: t("Profile"),
    },
  ];

  return (
    <nav className="w-full py-5 bg-white/80 backdrop-blur-xl shadow-sm border-b border-gray-200 sticky top-0 z-50">
      {/* Reduced padding (py-2) for a slimmer navbar */}
      <div className="max-w-[1500px] mx-auto flex items-center justify-between px-4 py-2">
        {/* Smaller Logo */}
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

        {/* Desktop Menu - Tighter Gap */}
        <div className="hidden xl:flex items-center gap-1">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={linkClass}>
              <item.icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          ))}

          <div className="h-6 w-px bg-gray-200 mx-2"></div>

          {/* Language Toggle (Slimmer) */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 py-2 px-3 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <Globe size={18} className="text-[#a22f29]" />
            <span>{i18n.language === "en" ? "AR" : "EN"}</span>
          </button>

          {/* Logout Button (Slimmer) */}
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
          className="xl:hidden text-[#a22f29] p-1.5 rounded-lg hover:bg-[#f9eaea] transition-colors"
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
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
                <item.icon size={20} />
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
