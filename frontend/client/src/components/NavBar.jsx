import React, { useState } from "react";
import logo from "../assets/Logo.jpeg";
import { NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";

export default function NavBar({ setSelectedCategory, children }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleLogoClick = () => {
    if (setSelectedCategory) setSelectedCategory(null);
    setIsOpen(false); // Close mobile menu when clicking logo
  };

  return (
    <nav className="w-full bg-[#f4f1eb] shadow-md relative">
      {/* Top bar */}
      <div className="max-w-[1200px] mx-auto flex items-center justify-between px-4 py-2.5">
        {/* Logo */}
        <NavLink to="/" className="flex items-center" onClick={handleLogoClick}>
          <img src={logo} alt="logo" className="h-[50px] w-auto" />
        </NavLink>

        {/* Desktop layout: children side by side */}
        <div className="hidden md:flex items-center gap-4">{children}</div>

        {/* Mobile hamburger */}
        <button
          aria-label={isOpen ? "Close menu" : "Open menu"}
          className="md:hidden text-gray-800 p-2 -mr-2"
          onClick={() => setIsOpen((v) => !v)}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile dropdown (overlay panel) */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 md:hidden">
          <div className="bg-[#f4f1eb] border-t border-gray-300 shadow-md">
            <div className="px-6 py-6 space-y-6">
              {/* Force children (Search + Icons) into vertical layout */}
              {children}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
