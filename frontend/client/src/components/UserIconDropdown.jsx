import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";

export default function UserIconDropdown({ user: propUser }) {
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

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

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="text-gray-800 text-2xl bg-transparent border-none cursor-pointer hover:text-red-700"
        aria-label="User menu"
      >
        <FaUserCircle />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-md z-50">
          {user ? (
            <ul className="flex flex-col">
              <li>
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                >
                  Profile
                </Link>
              </li>
              <li>
                <Link
                  to="/orders"
                  className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                >
                  My Orders
                </Link>
              </li>
              <li>
                <Link
                  to="/settings"
                  className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                >
                  Settings
                </Link>
              </li>
              <li
                onClick={handleLogout}
                className="block px-4 py-2 text-red-600 hover:bg-gray-100 cursor-pointer"
              >
                Logout
              </li>
            </ul>
          ) : (
            <ul className="flex flex-col">
              <li>
                <Link
                  to="/login"
                  className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                >
                  Login
                </Link>
              </li>
              <li>
                <Link
                  to="/signup"
                  className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                >
                  Sign Up
                </Link>
              </li>
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
