import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Truck, LogOut, Globe } from "lucide-react";
import logo from "../assets/Logo.jpeg";
import { useTranslation } from "react-i18next";

export default function DeliveryNavBar() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "ar" : "en";
    i18n.changeLanguage(newLang);
    document.dir = newLang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = newLang;
  };

  return (
    <nav className="w-full bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-[1500px] mx-auto flex items-center justify-between px-6 py-4">
        <NavLink
          to="/delivery/orders"
          className="flex items-center gap-4 transition-transform hover:scale-105"
        >
          <img
            src={logo}
            alt="logo"
            className="h-[55px] w-auto rounded-lg shadow-sm border border-gray-100"
          />
          <div className="hidden lg:flex flex-col text-start">
            <span className="text-4xl font-black text-[#a22f29] leading-none">
              {i18n.language === "ar" ? "سوق اليمن" : "Souq Yemen"}
            </span>
            <span className="text-[20px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">
              {t("Logistics")}
            </span>
          </div>
        </NavLink>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 py-2.5 px-4 rounded-xl text-base font-bold text-gray-700 hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200"
          >
            <Globe size={20} className="text-indigo-600" />
            <span>{i18n.language === "en" ? "AR" : "EN"}</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 py-2.5 px-4 ms-2 rounded-xl text-base font-bold text-white bg-gray-900 hover:bg-gray-800 shadow-md transition-colors"
          >
            <LogOut size={20} />
            <span className="hidden sm:inline">{t("Logout")}</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
