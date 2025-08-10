import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { User } from "lucide-react";
import { FiMessageSquare } from "react-icons/fi"; // install react-icons if needed

import logo from "../assets/Logo.jpeg";
import "./SellerNavBar.css";
import { FiPlusSquare } from "react-icons/fi"; // Add New Item
import { FiPackage } from "react-icons/fi"; // My Products
import { FiEdit3 } from "react-icons/fi"; // New Post
import { FiShoppingCart } from "react-icons/fi"; // Orders

export default function SellerNavBar({ children }) {
  const navigate = useNavigate();
  const sellerId = localStorage.getItem("sellerId"); // get the ID here

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("sellerId");
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar__container">
        <NavLink to="/seller/dashboard" className="navbar__logo">
          <img src={logo} alt="logo" className="navbar__logo-img" />
        </NavLink>

        {children}

        <ul className="navbar__links">
          <li>
            <NavLink to="/seller/add-product" className="navbar__link">
              <FiPlusSquare size={18} style={{ marginRight: "8px" }} />
              Add New Item
            </NavLink>
          </li>

          <li>
            <NavLink to="/seller/my-products" className="navbar__link">
              <FiPackage size={18} style={{ marginRight: "8px" }} />
              My Products
            </NavLink>
          </li>

          <li>
            <NavLink to="/seller/posts" className="navbar__link">
              <FiEdit3 size={18} style={{ marginRight: "8px" }} />
              New Post
            </NavLink>
          </li>

          <li>
            <NavLink
              to={`/seller/orders/${sellerId}/status`}
              className="navbar__link"
            >
              <FiShoppingCart size={18} style={{ marginRight: "8px" }} />
              Orders
            </NavLink>
          </li>
          <li>
            <NavLink to={`/seller/public/${sellerId}`} className="icon-button">
              <User />
            </NavLink>
          </li>
          <NavLink to="/seller/inbox" className="navbar__icon-link">
            <FiMessageSquare size={24} />
          </NavLink>
          <li>
            <button onClick={handleLogout} className="navbar__link logout-btn">
              Logout
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
}
