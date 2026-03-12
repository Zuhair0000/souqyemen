import React, { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { User, House, Menu, X, Globe } from "lucide-react"; // Added Globe for optional language switcher
import {
  FiMessageSquare,
  FiPlusSquare,
  FiPackage,
  FiEdit3,
  FiShoppingCart,
} from "react-icons/fi";
import logo from "../assets/Logo.jpeg";
import { useTranslation } from "react-i18next"; // Added import

export default function SellerNavBar({ children }) {
  const navigate = useNavigate();
  const sellerId = localStorage.getItem("sellerId");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { t, i18n } = useTranslation(); // Initialize translation hook

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("sellerId");
    navigate("/login");
  };

  // Language toggle helper (Optional, but highly recommended for the seller side too)
  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "ar" : "en";
    i18n.changeLanguage(newLang);
    document.dir = newLang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = newLang;
  };

  // close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const linkStyle =
    "flex items-center gap-2 py-2 px-3 text-gray-800 hover:text-red-700 transition-colors";

  return (
    <nav className="w-full bg-[#f4f1eb] shadow-md py-2 relative">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between px-4">
        {/* Logo */}
        <NavLink to="/seller/dashboard" className="flex items-center">
          <img src={logo} alt="logo" className="h-[50px] w-auto" />
        </NavLink>

        {children}

        {/* Desktop menu */}
        <ul className="hidden md:flex items-center list-none p-0 m-0">
          <li>
            <NavLink to="/seller/dashboard" className={linkStyle}>
              <House size={20} /> {t("Home")}
            </NavLink>
          </li>
          <li>
            <NavLink to="/seller/add-product" className={linkStyle}>
              <FiPlusSquare size={18} /> {t("Add New Item")}
            </NavLink>
          </li>
          <li>
            <NavLink to="/seller/my-products" className={linkStyle}>
              <FiPackage size={18} /> {t("My Products")}
            </NavLink>
          </li>
          <li>
            <NavLink to="/seller/posts" className={linkStyle}>
              <FiEdit3 size={18} /> {t("New Post")}
            </NavLink>
          </li>
          <li>
            <NavLink
              to={`/seller/orders/${sellerId}/status`}
              className={linkStyle}
            >
              <FiShoppingCart size={18} /> {t("Orders")}
            </NavLink>
          </li>
          <li>
            <NavLink to="/seller/inbox" className={linkStyle}>
              <FiMessageSquare size={20} /> {t("Messages")}
            </NavLink>
          </li>
          <li>
            <NavLink to={`/seller/public/${sellerId}`} className={linkStyle}>
              <User size={20} /> {t("Profile")}
            </NavLink>
          </li>
          <li>
            <button
              onClick={handleLogout}
              // Changed ml-3 to ms-3 for RTL support
              className="ms-3 text-gray-800 hover:underline"
            >
              {t("Logout")}
            </button>
          </li>
          {/* Optional: Language Switcher button for desktop */}
          <li>
            <button
              onClick={toggleLanguage}
              className="ms-3 flex items-center gap-1 text-gray-800 hover:text-red-700"
            >
              <Globe size={18} /> {i18n.language === "en" ? "AR" : "EN"}
            </button>
          </li>
        </ul>

        {/* Mobile hamburger */}
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="md:hidden text-gray-800 p-2"
        >
          {isOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          // Changed left-0 to start-0 for RTL support
          className="absolute top-full start-0 w-full bg-white shadow-md border-t border-gray-200 md:hidden z-50"
        >
          <ul className="flex flex-col list-none p-3 m-0">
            <li>
              <NavLink
                to="/seller/dashboard"
                className={linkStyle}
                onClick={() => setIsOpen(false)}
              >
                <House size={20} /> {t("Home")}
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/seller/add-product"
                className={linkStyle}
                onClick={() => setIsOpen(false)}
              >
                <FiPlusSquare size={18} /> {t("Add New Item")}
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/seller/my-products"
                className={linkStyle}
                onClick={() => setIsOpen(false)}
              >
                <FiPackage size={18} /> {t("My Products")}
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/seller/posts"
                className={linkStyle}
                onClick={() => setIsOpen(false)}
              >
                <FiEdit3 size={18} /> {t("New Post")}
              </NavLink>
            </li>
            <li>
              <NavLink
                to={`/seller/orders/${sellerId}/status`}
                className={linkStyle}
                onClick={() => setIsOpen(false)}
              >
                <FiShoppingCart size={18} /> {t("Orders")}
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/seller/inbox"
                className={linkStyle}
                onClick={() => setIsOpen(false)}
              >
                <FiMessageSquare size={20} /> {t("Messages")}
              </NavLink>
            </li>
            <li>
              <NavLink
                to={`/seller/public/${sellerId}`}
                className={linkStyle}
                onClick={() => setIsOpen(false)}
              >
                <User size={20} /> {t("Profile")}
              </NavLink>
            </li>
            <li>
              <button
                onClick={() => {
                  handleLogout();
                  setIsOpen(false);
                }}
                // Changed text-left to text-start for RTL support
                className="w-full text-start py-2 px-3 text-gray-800 hover:text-red-700"
              >
                {t("Logout")}
              </button>
            </li>
            {/* Optional: Language Switcher button for mobile */}
            <li>
              <button
                onClick={() => {
                  toggleLanguage();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2 py-2 px-3 text-gray-800 hover:text-red-700 text-start"
              >
                <Globe size={18} />{" "}
                {i18n.language === "en" ? "العربية" : "English"}
              </button>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}
