import React from "react";
import "./NavBar.css";
import logo from "../assets/Logo.jpeg";
import { NavLink } from "react-router-dom";

export default function NavBar({ setSelectedCategory, children }) {
  const hanleLogoClick = () => {
    if (setSelectedCategory) {
      setSelectedCategory(null);
    }
  };
  return (
    <nav className="navbar">
      <div className="navbar__container">
        <NavLink to="/" className="navbar__logo" onClick={hanleLogoClick}>
          <img src={logo} alt="logo" className="navbar__logo-img" />
        </NavLink>

        {children}
      </div>
    </nav>
  );
}
