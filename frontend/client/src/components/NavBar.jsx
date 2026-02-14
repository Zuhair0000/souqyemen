import React, { useState, useEffect } from "react";
import logo from "../assets/Logo.jpeg";
import { NavLink } from "react-router-dom";
import { Menu, X, Globe } from "lucide-react"; // Added Globe icon
import { useTranslation } from "react-i18next"; // Import translation hook

export default function NavBar({ setSelectedCategory, children }) {
  const [isOpen, setIsOpen] = useState(false);

  // 1. Initialize translation hook
  const { i18n } = useTranslation();

  const handleLogoClick = () => {
    if (setSelectedCategory) setSelectedCategory(null);
    setIsOpen(false);
  };

  // 2. Logic to toggle language
  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "ar" : "en";
    i18n.changeLanguage(newLang);
  };

  // 3. Effect to update document direction (RTL/LTR) automatically
  useEffect(() => {
    const dir = i18n.language === "ar" ? "rtl" : "ltr";
    document.dir = dir;
    document.documentElement.lang = i18n.language;

    // Optional: If you added a specific Arabic font in tailwind.config.js
    // document.body.className = i18n.language === 'ar' ? 'font-cairo' : 'font-sans';
  }, [i18n.language]);

  // Reusable Language Button Component (to avoid code duplication)
  const LanguageBtn = ({ isMobile = false }) => (
    <button
      onClick={() => {
        toggleLanguage();
        if (isMobile) setIsOpen(false); // Close menu on mobile after switch
      }}
      className={`flex items-center gap-2 border border-gray-400 rounded-full px-3 py-1.5 transition-colors hover:bg-gray-200 text-gray-800 ${
        isMobile ? "w-full justify-center" : ""
      }`}
    >
      <Globe size={18} />
      <span className="font-medium">
        {i18n.language === "en" ? "العربية" : "English"}
      </span>
    </button>
  );

  return (
    <nav className="w-full bg-[#f4f1eb] shadow-md relative">
      <div className="max-w-[1200px] mx-auto flex items-center justify-between px-4 py-2.5">
        {/* Logo */}
        <NavLink to="/" className="flex items-center" onClick={handleLogoClick}>
          <img src={logo} alt="logo" className="h-[50px] w-auto" />
        </NavLink>

        {/* Desktop Layout */}
        <div className="hidden md:flex items-center gap-4">
          {children}
          {/* 4. Language Button (Desktop) */}
          <div className="border-l border-gray-300 pl-4 ms-2">
            {" "}
            {/* Separator line */}
            <LanguageBtn />
          </div>
        </div>

        {/* Mobile Hamburger */}
        <button
          aria-label={isOpen ? "Close menu" : "Open menu"}
          className="md:hidden text-gray-800 p-2 -mr-2"
          onClick={() => setIsOpen((v) => !v)}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 md:hidden">
          <div className="bg-[#f4f1eb] border-t border-gray-300 shadow-md">
            <div className="px-6 py-6 flex flex-col gap-6">
              {children}

              {/* 5. Language Button (Mobile) - Added divider */}
              <div className="border-t border-gray-300 pt-4">
                <LanguageBtn isMobile={true} />
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
