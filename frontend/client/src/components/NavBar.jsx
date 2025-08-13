import React from "react";
import logo from "../assets/Logo.jpeg";
import { NavLink } from "react-router-dom";

export default function NavBar({ setSelectedCategory, children }) {
  const handleLogoClick = () => {
    if (setSelectedCategory) {
      setSelectedCategory(null);
    }
  };

  return (
    <nav className="w-full py-2.5 bg-[#f4f1eb]">
      <div className="max-w-[1200px] mx-auto flex items-center justify-between relative">
        <NavLink to="/" className="flex items-center" onClick={handleLogoClick}>
          <img src={logo} alt="logo" className="h-[50px] w-auto" />
        </NavLink>
        {children}
      </div>
    </nav>
  );
}
