import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  UserCircle2,
  User,
  Package,
  Settings,
  LogOut,
  LogIn,
  UserPlus,
} from "lucide-react";
import { useTranslation } from "react-i18next";

export default function UserIconDropdown({ user: propUser }) {
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setOpen(false);
    navigate("/login");
  };

  useEffect(() => {
    setUser(propUser);
  }, [propUser]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Shared class for dropdown menu items
  const menuItemClass =
    "flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-rose-50 hover:text-[#a22f29] transition-colors w-full text-start";

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Avatar Button */}
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center justify-center w-10 h-10 rounded-xl border transition-all shadow-sm outline-none ${
          open
            ? "bg-[#a22f29] text-white border-[#a22f29]"
            : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-[#a22f29]"
        }`}
        aria-label="User menu"
      >
        <UserCircle2 size={24} />
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div className="absolute top-full end-0 mt-3 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden animate-[slideDown_0.2s_ease]">
          {user ? (
            <div className="flex flex-col">
              {/* User Identity Header */}
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 text-start">
                <p className="text-sm font-black text-gray-900 truncate">
                  {user.name || t("Customer")}
                </p>
                {user.email && (
                  <p className="text-xs font-bold text-gray-500 truncate mt-0.5">
                    {user.email}
                  </p>
                )}
              </div>

              {/* Links */}
              <Link
                to="/profile"
                className={menuItemClass}
                onClick={() => setOpen(false)}
              >
                <User size={18} /> {t("Profile")}
              </Link>
              <Link
                to="/orders"
                className={menuItemClass}
                onClick={() => setOpen(false)}
              >
                <Package size={18} /> {t("My Orders")}
              </Link>
              <Link
                to="/settings"
                className={menuItemClass}
                onClick={() => setOpen(false)}
              >
                <Settings size={18} /> {t("Settings")}
              </Link>

              <div className="h-px bg-gray-100 my-1"></div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 w-full text-start transition-colors"
              >
                <LogOut size={18} /> {t("Logout")}
              </button>
            </div>
          ) : (
            /* Logged Out State Links */
            <div className="flex flex-col p-2">
              <Link
                to="/login"
                className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-rose-50 hover:text-[#a22f29] rounded-xl transition-colors"
                onClick={() => setOpen(false)}
              >
                <LogIn size={18} /> {t("Login")}
              </Link>
              <Link
                to="/signup"
                className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-white bg-gray-900 hover:bg-gray-800 rounded-xl transition-colors mt-1 shadow-sm"
                onClick={() => setOpen(false)}
              >
                <UserPlus size={18} /> {t("Sign Up")}
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
