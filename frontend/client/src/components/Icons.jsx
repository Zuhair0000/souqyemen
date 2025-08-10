import React, { useEffect, useState, useRef } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { Heart, ShoppingCart, User } from "lucide-react";
import "./Icons.css";
import { useCart } from "../context/cartContext"; // ✅ correct import
import { Megaphone } from "lucide-react";

export default function Icons() {
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { cartCount } = useCart(); // get cart from context

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser && storedUser !== "undefined") {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error("Invalid user data in localStorage:", err);
        localStorage.removeItem("user");
      }
    }
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setShowDropdown(false);
    navigate("/login");
  };

  return (
    <div className="navbar__icons" ref={dropdownRef}>
      <button className="icon-button">
        <Heart />
      </button>
      <NavLink to="/cart" className="icon-button cart-icon">
        <ShoppingCart />
        {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
      </NavLink>

      <NavLink to="/promotions" className="navbar__link" title="Promotions">
        <Megaphone size={25} />
      </NavLink>

      {user ? (
        <div className="user-dropdown-wrapper">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="icon-button"
          >
            <User />
          </button>

          {showDropdown && (
            <div className="dropdown-menu">
              <ul>
                <li>
                  <NavLink to="/profile" onClick={() => setShowDropdown(false)}>
                    Profile
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/orders" onClick={() => setShowDropdown(false)}>
                    My Orders
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/settings"
                    onClick={() => setShowDropdown(false)}
                  >
                    Settings
                  </NavLink>
                </li>
                <li className="logout-item" onClick={handleLogout}>
                  Logout
                </li>
              </ul>
            </div>
          )}
        </div>
      ) : (
        <NavLink to="/signup" className="icon-button">
          <User />
        </NavLink>
      )}
    </div>
  );
}
