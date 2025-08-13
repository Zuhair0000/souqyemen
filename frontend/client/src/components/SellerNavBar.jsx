import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { User } from "lucide-react";
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("sellerId");
    navigate("/login");
  };

  return (
    <nav className="w-full bg-[#f4f1eb] shadow-md py-2">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between flex-wrap px-4">
        {/* Logo */}
        <NavLink to="/seller/dashboard" className="flex items-center">
          <img src={logo} alt="logo" className="h-[50px] w-auto" />
        </NavLink>

        {children}

        {/* Links */}
        <ul className="flex flex-wrap items-center list-none p-0 m-0">
          <li>
            <NavLink
              to="/seller/add-product"
              className="flex items-center mx-4 text-gray-800 hover:text-red-700 transition-transform transform hover:scale-105"
            >
              <FiPlusSquare size={18} className="mr-2" />
              Add New Item
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/seller/my-products"
              className="flex items-center mx-4 text-gray-800 hover:text-red-700 transition-transform transform hover:scale-105"
            >
              <FiPackage size={18} className="mr-2" />
              My Products
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/seller/posts"
              className="flex items-center mx-4 text-gray-800 hover:text-red-700 transition-transform transform hover:scale-105"
            >
              <FiEdit3 size={18} className="mr-2" />
              New Post
            </NavLink>
          </li>

          <li>
            <NavLink
              to={`/seller/orders/${sellerId}/status`}
              className="flex items-center mx-4 text-gray-800 hover:text-red-700 transition-transform transform hover:scale-105"
            >
              <FiShoppingCart size={18} className="mr-2" />
              Orders
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/seller/inbox"
              className="flex items-center mx-4 text-gray-800 hover:text-red-700 transition-transform transform hover:scale-105"
            >
              <FiMessageSquare size={24} className="mr-2" />
              Messages
            </NavLink>
          </li>

          <li>
            <NavLink
              to={`/seller/public/${sellerId}`}
              className="flex items-center mx-4 text-gray-800 hover:text-red-700 transition-transform transform hover:scale-105"
            >
              <User className="mr-2" />
              Profile
            </NavLink>
          </li>

          <li>
            <button
              onClick={handleLogout}
              className="mx-4 text-gray-800 hover:underline"
            >
              Logout
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
}
