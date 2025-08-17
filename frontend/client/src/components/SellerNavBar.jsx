import React, { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { User, House, Menu, X } from "lucide-react";
import {
  FiMessageSquare,
  FiPlusSquare,
  FiPackage,
  FiEdit3,
  FiShoppingCart,
} from "react-icons/fi";
import logo from "../assets/Logo.jpeg";

export default function SellerNavBar({ children }) {
  const navigate = useNavigate();
  const sellerId = localStorage.getItem("sellerId");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("sellerId");
    navigate("/login");
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
              <House size={20} /> Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/seller/add-product" className={linkStyle}>
              <FiPlusSquare size={18} /> Add New Item
            </NavLink>
          </li>
          <li>
            <NavLink to="/seller/my-products" className={linkStyle}>
              <FiPackage size={18} /> My Products
            </NavLink>
          </li>
          <li>
            <NavLink to="/seller/posts" className={linkStyle}>
              <FiEdit3 size={18} /> New Post
            </NavLink>
          </li>
          <li>
            <NavLink
              to={`/seller/orders/${sellerId}/status`}
              className={linkStyle}
            >
              <FiShoppingCart size={18} /> Orders
            </NavLink>
          </li>
          <li>
            <NavLink to="/seller/inbox" className={linkStyle}>
              <FiMessageSquare size={20} /> Messages
            </NavLink>
          </li>
          <li>
            <NavLink to={`/seller/public/${sellerId}`} className={linkStyle}>
              <User size={20} /> Profile
            </NavLink>
          </li>
          <li>
            <button
              onClick={handleLogout}
              className="ml-3 text-gray-800 hover:underline"
            >
              Logout
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
          className="absolute top-full left-0 w-full bg-white shadow-md border-t border-gray-200 md:hidden z-50"
        >
          <ul className="flex flex-col list-none p-3 m-0">
            <li>
              <NavLink
                to="/seller/dashboard"
                className={linkStyle}
                onClick={() => setIsOpen(false)}
              >
                <House size={20} /> Home
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/seller/add-product"
                className={linkStyle}
                onClick={() => setIsOpen(false)}
              >
                <FiPlusSquare size={18} /> Add New Item
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/seller/my-products"
                className={linkStyle}
                onClick={() => setIsOpen(false)}
              >
                <FiPackage size={18} /> My Products
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/seller/posts"
                className={linkStyle}
                onClick={() => setIsOpen(false)}
              >
                <FiEdit3 size={18} /> New Post
              </NavLink>
            </li>
            <li>
              <NavLink
                to={`/seller/orders/${sellerId}/status`}
                className={linkStyle}
                onClick={() => setIsOpen(false)}
              >
                <FiShoppingCart size={18} /> Orders
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/seller/inbox"
                className={linkStyle}
                onClick={() => setIsOpen(false)}
              >
                <FiMessageSquare size={20} /> Messages
              </NavLink>
            </li>
            <li>
              <NavLink
                to={`/seller/public/${sellerId}`}
                className={linkStyle}
                onClick={() => setIsOpen(false)}
              >
                <User size={20} /> Profile
              </NavLink>
            </li>
            <li>
              <button
                onClick={() => {
                  handleLogout();
                  setIsOpen(false);
                }}
                className="w-full text-left py-2 px-3 text-gray-800 hover:text-red-700"
              >
                Logout
              </button>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}
