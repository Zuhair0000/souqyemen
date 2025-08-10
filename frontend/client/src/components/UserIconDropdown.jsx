import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./UserIconDropdown.css";

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
    setUser(propUser); // keep in sync with props
  }, [propUser]);

  // Close dropdown on outside click
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
    <div className="user-dropdown-container" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="user-icon-button"
        aria-label="User menu"
      >
        <i className="fas fa-user-circle"></i>
      </button>

      {open && (
        <div className="dropdown-menu">
          {user ? (
            <ul>
              <li>
                <Link to="/profile" className="dashboard-card">
                  Profile
                </Link>
              </li>
              <li>
                <Link to="/orders">My Orders</Link>
              </li>
              <li>
                <Link to="/settings" className="dashboard-card">
                  Settings
                </Link>
              </li>
              <li className="logout-item" onClick={handleLogout}>
                Logout
              </li>
            </ul>
          ) : (
            <ul>
              <li>
                <Link to="/login">Login</Link>
              </li>
              <li>
                <Link to="/signup">Sign Up</Link>
              </li>
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
