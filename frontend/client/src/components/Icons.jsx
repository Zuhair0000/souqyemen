import React, { useEffect, useState, useRef } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { Heart, ShoppingCart, User, Megaphone } from "lucide-react";
import { useCart } from "../context/cartContext";

export default function Icons() {
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { cartCount } = useCart();

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
    <div className="flex items-center gap-4" ref={dropdownRef}>
      {/* Wishlist Icon */}
      <button className="bg-transparent border-none cursor-pointer text-gray-600 text-xl flex items-center transition-colors duration-200 hover:text-[#a22f29]">
        <Heart />
      </button>

      {/* Cart Icon */}
      <NavLink
        to="/cart"
        className="relative bg-transparent border-none cursor-pointer text-gray-600 text-xl flex items-center transition-colors duration-200 hover:text-[#a22f29]"
      >
        <ShoppingCart />
        {cartCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-[#a22f29] text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
            {cartCount}
          </span>
        )}
      </NavLink>

      {/* Promotions */}
      <NavLink
        to="/promotions"
        title="Promotions"
        className="text-gray-600 hover:text-[#a22f29] transition-colors duration-200"
      >
        <Megaphone size={25} />
      </NavLink>

      {/* User Menu */}
      {user ? (
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="bg-transparent border-none cursor-pointer text-gray-600 text-xl flex items-center transition-colors duration-200 hover:text-[#a22f29]"
          >
            <User />
          </button>

          {showDropdown && (
            <div className="absolute top-[60px] right-0 w-64 bg-white border border-gray-300 shadow-lg p-3 rounded-lg z-50 animate-[dropdownFadeSlide_0.3s_ease_forwards]">
              <ul className="list-none m-0 p-0">
                <li className="my-2">
                  <NavLink
                    to="/profile"
                    onClick={() => setShowDropdown(false)}
                    className="text-gray-800 hover:text-[#a22f29] transition-colors"
                  >
                    Profile
                  </NavLink>
                </li>
                <li className="my-2">
                  <NavLink
                    to="/orders"
                    onClick={() => setShowDropdown(false)}
                    className="text-gray-800 hover:text-[#a22f29] transition-colors"
                  >
                    My Orders
                  </NavLink>
                </li>
                <li className="my-2">
                  <NavLink
                    to="/settings"
                    onClick={() => setShowDropdown(false)}
                    className="text-gray-800 hover:text-[#a22f29] transition-colors"
                  >
                    Settings
                  </NavLink>
                </li>
                <li
                  className="my-2 text-gray-800 cursor-pointer hover:text-[#a22f29] transition-colors"
                  onClick={handleLogout}
                >
                  Logout
                </li>
              </ul>
            </div>
          )}
        </div>
      ) : (
        <NavLink
          to="/signup"
          className="bg-transparent border-none cursor-pointer text-gray-600 text-xl flex items-center transition-colors duration-200 hover:text-[#a22f29]"
        >
          <User />
        </NavLink>
      )}
    </div>
  );
}
