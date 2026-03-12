import React, { useEffect, useState, useRef } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { Heart, ShoppingCart, User, Megaphone, House } from "lucide-react";
import { useCart } from "../context/cartContext";
import { FiMessageSquare } from "react-icons/fi";
import { useTranslation } from "react-i18next";

export default function Icons() {
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const { t } = useTranslation();

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
        <House size={20} /> <span className="md:hidden">{t("Home")}</span>
      </NavLink>

      {/* Cart */}
      <NavLink to="/cart" className={`${baseIcon} relative`}>
        <ShoppingCart size={20} />
        <span className="md:hidden">{t("Cart")}</span>
        {cartCount > 0 && (
          // Changed -right-2 to -end-2 for RTL logic
          <span className="absolute -top-1 -end-2 bg-[#a22f29] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
            {cartCount}
          </span>
        )}
      </NavLink>

      {/* Messages */}
      <NavLink to="/seller/inbox" className={baseIcon}>
        <FiMessageSquare size={20} />{" "}
        <span className="md:hidden">{t("Messages")}</span>
      </NavLink>

      {/* Promotions */}
      <NavLink to="/promotions" className={baseIcon}>
        <Megaphone size={20} />{" "}
        <span className="md:hidden">{t("Promotions")}</span>
      </NavLink>

      {/* User */}
      {user ? (
        <div className="relative">
          <button
            onClick={() => setShowDropdown((v) => !v)}
            className={baseIcon}
          >
            <User size={20} /> <span className="md:hidden">{t("Account")}</span>
          </button>

          {showDropdown && (
            // Changed right-0 / right-1 to end-0 / end-1 for RTL alignment
            <div className="absolute md:top-[52px] md:end-0 top-10 end-1 w-64 bg-white border border-gray-300 shadow-lg p-3 rounded-lg z-50 text-start">
              <ul className="list-none m-0 p-0">
                <li className="my-2">
                  <NavLink
                    to="/profile"
                    onClick={() => setShowDropdown(false)}
                    className="block text-gray-800 hover:text-[#a22f29]"
                  >
                    {t("Profile")}
                  </NavLink>
                </li>
                <li className="my-2">
                  <NavLink
                    to="/orders"
                    onClick={() => setShowDropdown(false)}
                    className="block text-gray-800 hover:text-[#a22f29]"
                  >
                    {t("My Orders")}
                  </NavLink>
                </li>
                <li className="my-2">
                  <NavLink
                    to="/settings"
                    onClick={() => setShowDropdown(false)}
                    className="block text-gray-800 hover:text-[#a22f29]"
                  >
                    {t("Settings")}
                  </NavLink>
                </li>
                <li
                  onClick={handleLogout}
                  className="my-2 cursor-pointer text-gray-800 hover:text-[#a22f29] transition-colors"
                >
                  {t("Logout")}
                </li>
              </ul>
            </div>
          )}
        </div>
      ) : (
        <NavLink to="/signup" className={baseIcon}>
          <User size={20} /> <span className="md:hidden">{t("Sign Up")}</span>
        </NavLink>
      )}
    </div>
  );
}
