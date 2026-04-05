import React, { useState, useEffect } from "react";
import logo from "../assets/Logo.jpeg";
import { NavLink } from "react-router-dom";
import { Menu, X, Globe } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function NavBar({ setSelectedCategory, children }) {
  const [isOpen, setIsOpen] = useState(false);
  const { i18n } = useTranslation();

  const handleLogoClick = () => {
    if (setSelectedCategory) setSelectedCategory(null);
    setIsOpen(false);
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "ar" : "en";
    i18n.changeLanguage(newLang);
  };

  useEffect(() => {
    const dir = i18n.language === "ar" ? "rtl" : "ltr";
    document.dir = dir;
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  const LanguageBtn = ({ isMobile = false }) => (
    <button
      onClick={() => {
        toggleLanguage();
        if (isMobile) setIsOpen(false);
      }}
      className={`flex items-center gap-2 border-2 border-transparent bg-rose-50/50 backdrop-blur-sm rounded-full px-5 py-2.5 transition-all duration-300 hover:bg-gradient-to-r hover:from-rose-100 hover:to-orange-100 hover:border-rose-300 hover:text-rose-600 hover:shadow-[0_0_15px_rgba(244,63,94,0.2)] text-gray-800 ${
        isMobile ? "w-full justify-center" : ""
      }`}
    >
      <Globe size={20} className="text-rose-500 animate-pulse" />
      <span className="font-bold tracking-wide">
        {i18n.language === "en" ? "العربية" : "English"}
      </span>
    </button>
  );

  return (
    <nav className="w-full bg-white/80 backdrop-blur-xl shadow-sm sticky top-0 z-50 transition-all border-b border-rose-100">
      <div className="max-w-[1300px] mx-auto flex items-center justify-between px-4 py-3 md:py-4">
        {/* BIGGER LOGO & BILINGUAL NAME */}
        <NavLink
          to="/"
          className="flex items-center gap-4 transition-transform duration-300 hover:scale-[1.02]"
          onClick={handleLogoClick}
        >
          <img
            src={logo}
            alt="Souq Yemen Logo"
            className="h-[65px] md:h-[80px] w-auto drop-shadow-lg rounded-2xl border-2 border-white"
          />
          <span className="text-2xl md:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-rose-600 via-red-500 to-orange-500 drop-shadow-sm tracking-tight">
            {i18n.language === "ar" ? "سوق اليمن" : "Souq Yemen"}
          </span>
        </NavLink>

        {/* Desktop Layout */}
        <div className="hidden md:flex items-center gap-6">
          {children}
          <div className="border-s-2 border-gray-200 ps-6 ms-2">
            <LanguageBtn />
          </div>
        </div>

        {/* Mobile Hamburger */}
        <button
          aria-label={isOpen ? "Close menu" : "Open menu"}
          className="md:hidden text-rose-600 p-2 -me-2 hover:bg-rose-50 rounded-full transition-colors"
          onClick={() => setIsOpen((v) => !v)}
        >
          {isOpen ? <X size={32} /> : <Menu size={32} />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="absolute start-0 end-0 top-full z-50 md:hidden origin-top transition-all duration-300">
          <div className="bg-gradient-to-b from-white to-rose-50/50 shadow-2xl border-t border-rose-100 rounded-b-3xl">
            <div className="px-6 py-8 flex flex-col gap-6">
              {children}
              <div className="border-t-2 border-gray-200/50 pt-6">
                <LanguageBtn isMobile={true} />
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
