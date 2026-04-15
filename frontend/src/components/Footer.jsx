import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import logo from "../assets/Logo.jpeg";
import {
  Facebook,
  Twitter,
  Instagram,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
} from "lucide-react";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-gray-900 border-t border-gray-800 pt-16 pb-8 mt-auto">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-12 mb-16">
          {/* 1. Brand & About Section */}
          <div className="xl:col-span-2 flex flex-col items-start">
            <Link to="/" className="mb-6">
              <img
                src={logo}
                alt="SouqYemen Logo"
                className="h-16 w-auto rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-700"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "https://placehold.co/150x50/1f2937/94a3b8?text=SouqYemen";
                }}
              />
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-sm text-start">
              {t(
                "SouqYemen is your premier marketplace for authentic local goods, cutting-edge electronics, and everyday essentials. Empowering local sellers, delivering globally.",
              )}
            </p>
            <div className="flex items-center gap-4">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-rose-500/10 hover:text-rose-400 transition-all duration-300"
              >
                <Facebook size={18} />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-rose-500/10 hover:text-rose-400 transition-all duration-300"
              >
                <Twitter size={18} />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-rose-500/10 hover:text-rose-400 transition-all duration-300"
              >
                <Instagram size={18} />
              </a>
            </div>
          </div>

          {/* 2. Quick Links */}
          <div className="flex flex-col text-start">
            <h4 className="text-white font-bold text-lg mb-6">
              {t("Quick Links")}
            </h4>
            <ul className="space-y-4">
              <li>
                <Link
                  to="/"
                  className="text-gray-400 hover:text-rose-400 text-sm font-medium transition-colors"
                >
                  {t("Home")}
                </Link>
              </li>
              <li>
                <Link
                  to="/products"
                  className="text-gray-400 hover:text-rose-400 text-sm font-medium transition-colors"
                >
                  {t("All Products")}
                </Link>
              </li>
              <li>
                <Link
                  to="/sellers"
                  className="text-gray-400 hover:text-rose-400 text-sm font-medium transition-colors"
                >
                  {t("Sellers Directory")}
                </Link>
              </li>
              <li>
                <Link
                  to="/cart"
                  className="text-gray-400 hover:text-rose-400 text-sm font-medium transition-colors"
                >
                  {t("Shopping Cart")}
                </Link>
              </li>
            </ul>
          </div>

          {/* 3. Customer Service */}
          <div className="flex flex-col text-start">
            <h4 className="text-white font-bold text-lg mb-6">
              {t("Customer Service")}
            </h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-gray-400 text-sm font-medium">
                <Mail size={16} className="text-rose-500" />
                support@souqyemen.com
              </li>
              <li className="flex items-center gap-3 text-gray-400 text-sm font-medium">
                <Phone size={16} className="text-rose-500" />
                +967 770 000 000
              </li>
              <li className="flex items-start gap-3 text-gray-400 text-sm font-medium">
                <MapPin size={16} className="text-rose-500 shrink-0 mt-0.5" />
                {t("Sana'a, Yemen")}
              </li>
            </ul>
          </div>

          {/* 4. Newsletter & Partners */}
          <div className="flex flex-col text-start">
            <h4 className="text-white font-bold text-lg mb-6">
              {t("Stay Updated")}
            </h4>
            <div className="relative mb-6">
              <input
                type="email"
                placeholder={t("Enter your email")}
                className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-gradient-to-r from-rose-500 to-orange-500 rounded-lg flex items-center justify-center text-white hover:shadow-md hover:from-rose-600 hover:to-orange-600 transition-all">
                <ArrowRight size={16} />
              </button>
            </div>

            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 mt-auto">
              <p className="text-xs font-bold text-gray-400 mb-2">
                {t("Partner with us")}
              </p>
              <Link
                to="/signup-seller"
                className="text-sm font-bold text-rose-400 hover:text-rose-300 hover:underline block mb-1"
              >
                {t("Become a Seller")}
              </Link>
              <Link
                to="/signup-delivery"
                className="text-sm font-bold text-rose-400 hover:text-rose-300 hover:underline block"
              >
                {t("Join Logistics Team")}
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm font-medium text-center md:text-left">
            © {new Date().getFullYear()} SouqYemen. {t("All rights reserved.")}
          </p>
          <div className="flex gap-6">
            <Link
              to="/privacy"
              className="text-gray-500 hover:text-rose-400 text-sm font-medium transition-colors"
            >
              {t("Privacy Policy")}
            </Link>
            <Link
              to="/terms"
              className="text-gray-500 hover:text-rose-400 text-sm font-medium transition-colors"
            >
              {t("Terms of Service")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
