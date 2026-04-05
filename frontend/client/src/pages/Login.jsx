import React, { useState } from "react";
import NavBar from "../components/NavBar";
import logo from "../assets/Logo.jpeg";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { GoogleLogin } from "@react-oauth/google";
import { Mail, Lock } from "lucide-react";

export default function Login() {
  const [formData, setFormData] = useState({ emailOrPhone: "", password: "" });
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSuccessfulLogin = (data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("role", data.role);
    localStorage.setItem("user", JSON.stringify(data.user));

    const { role, id, status } = data.user;

    if (role === "seller") localStorage.setItem("sellerId", id);

    if (role === "admin") {
      navigate("/admin/pending-sellers");
    } else if (role === "delivery") {
      navigate("/delivery/orders"); // <-- Redirects to Delivery Portal
    } else if (role === "seller") {
      if (status === "approved") {
        navigate("/seller/dashboard");
      } else {
        alert(t("Your seller account is still under review or was rejected."));
      }
    } else {
      navigate("/");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:3001/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) handleSuccessfulLogin(data);
      else alert(data.message || t("Login failed"));
    } catch (err) {
      alert(t("Something went wrong"));
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await fetch("http://localhost:3001/api/auth/google/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });
      const data = await res.json();
      if (res.ok) handleSuccessfulLogin(data);
      else alert(data.message || t("Login failed"));
    } catch (error) {
      alert(t("Something went wrong"));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50/50 via-white to-orange-50/30 flex flex-col">
      <NavBar>{t("Need help?")}</NavBar>

      <div className="flex-1 flex flex-col md:flex-row justify-center items-center px-6 md:px-16 lg:px-24 py-10 gap-10">
        {/* Left Side: Logo */}
        <div className="hidden md:flex flex-1 items-center justify-center">
          <img
            src={logo}
            alt="SouqYemen"
            className="w-[80%] max-w-[500px] h-auto drop-shadow-2xl rounded-[3rem]"
          />
        </div>

        {/* Right Side: Glass Form */}
        <div className="w-full max-w-[450px] bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white p-8 md:p-10 text-start">
          <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">
            {t("Welcome back")}
          </h2>
          <p className="text-gray-500 font-medium mb-8">
            {t("Log in to your account")}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <Mail size={18} />
              </div>
              <input
                type="text"
                name="emailOrPhone"
                placeholder={t("Email or Phone")}
                value={formData.emailOrPhone}
                onChange={handleChange}
                required
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-400 focus:bg-white outline-none transition-all"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <Lock size={18} />
              </div>
              <input
                type="password"
                name="password"
                placeholder={t("Password")}
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-400 focus:bg-white outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-rose-500 to-orange-500 text-white py-4 rounded-xl font-bold text-lg shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all mt-2"
            >
              {t("Log In")}
            </button>
          </form>

          <div className="my-6 flex items-center before:flex-1 before:border-t before:border-gray-200 after:flex-1 after:border-t after:border-gray-200">
            <span className="px-3 text-sm text-gray-400 font-medium">
              {t("OR")}
            </span>
          </div>

          <div className="flex justify-center w-full mb-6">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => alert(t("Google Sign-In Failed"))}
              shape="rectangular"
            />
          </div>

          <div className="space-y-3 mb-6">
            <Link
              to="/signup-seller"
              className="flex items-center justify-center w-full py-3.5 bg-white border-2 border-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-50 hover:border-gray-200 transition-all"
            >
              {t("Become a Seller")}
            </Link>

            {/* NEW: Logistics Link */}
            <Link
              to="/signup-delivery"
              className="flex items-center justify-center w-full py-3.5 bg-indigo-50 border-2 border-indigo-100 text-indigo-700 font-bold rounded-xl hover:bg-indigo-100 hover:border-indigo-200 transition-all"
            >
              {t("Join as Logistics Partner")}
            </Link>
          </div>

          <p className="text-center text-gray-500 font-medium">
            {t("Don't have an account?")}{" "}
            <Link
              to="/signup"
              className="text-rose-500 font-bold hover:underline"
            >
              {t("Create one")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
