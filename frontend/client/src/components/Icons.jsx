import React, { useEffect, useState, useRef } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { Heart, ShoppingCart, User, Megaphone, House } from "lucide-react";
import { useCart } from "../context/cartContext";
import { FiMessageSquare } from "react-icons/fi";

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
      } catch {
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
    localStorage.removeItem("token");
    setUser(null);
    setShowDropdown(false);
    navigate("/login");
  };

  const baseIcon =
    "flex items-center gap-2 text-gray-600 transition-colors duration-200 hover:text-[#a22f29]";

  return (
    <div
      className="flex flex-col md:flex-row md:items-center md:gap-5"
      ref={dropdownRef}
    >
      {/* Home */}
      <NavLink to="/" className={baseIcon}>
        <House size={20} /> <span className="md:hidden">Home</span>
      </NavLink>

      {/* Wishlist */}
      <NavLink to="/wishlist" className={baseIcon}>
        <Heart size={20} /> <span className="md:hidden">Wishlist</span>
      </NavLink>

      {/* Cart */}
      <NavLink to="/cart" className={`${baseIcon} relative`}>
        <ShoppingCart size={20} />
        <span className="md:hidden">Cart</span>
        {cartCount > 0 && (
          <span className="absolute -top-1 -right-2 bg-[#a22f29] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
            {cartCount}
          </span>
        )}
      </NavLink>

      {/* Messages */}
      <NavLink to="/seller/inbox" className={baseIcon}>
        <FiMessageSquare size={20} />{" "}
        <span className="md:hidden">Messages</span>
      </NavLink>

      {/* Promotions */}
      <NavLink to="/promotions" className={baseIcon}>
        <Megaphone size={20} /> <span className="md:hidden">Promotions</span>
      </NavLink>

      {/* User */}
      {user ? (
        <div className="relative">
          <button
            onClick={() => setShowDropdown((v) => !v)}
            className={baseIcon}
          >
            <User size={20} /> <span className="md:hidden">Account</span>
          </button>

          {showDropdown && (
            <div className="absolute md:top-[52px] md:right-0 top-10 right-1 w-64 bg-white border border-gray-300 shadow-lg p-3 rounded-lg z-50">
              <ul className="list-none m-0 p-0">
                <li className="my-2">
                  <NavLink
                    to="/profile"
                    onClick={() => setShowDropdown(false)}
                    className="block text-gray-800 hover:text-[#a22f29]"
                  >
                    Profile
                  </NavLink>
                </li>
                <li className="my-2">
                  <NavLink
                    to="/orders"
                    onClick={() => setShowDropdown(false)}
                    className="block text-gray-800 hover:text-[#a22f29]"
                  >
                    My Orders
                  </NavLink>
                </li>
                <li className="my-2">
                  <NavLink
                    to="/settings"
                    onClick={() => setShowDropdown(false)}
                    className="block text-gray-800 hover:text-[#a22f29]"
                  >
                    Settings
                  </NavLink>
                </li>
                <li
                  onClick={handleLogout}
                  className="my-2 cursor-pointer text-gray-800 hover:text-[#a22f29] transition-colors"
                >
                  Logout
                </li>
              </ul>
            </div>
          )}
        </div>
      ) : (
        <NavLink to="/signup" className={baseIcon}>
          <User size={20} /> <span className="md:hidden">Sign Up</span>
        </NavLink>
      )}
    </div>
  );
}
