import React, { useState } from "react";
import NavBar from "../components/NavBar";
import logo from "../assets/Logo.jpeg";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { GoogleLogin } from "@react-oauth/google";

export default function Login() {
  const [formData, setFormData] = useState({ emailOrPhone: "", password: "" });
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSuccessfulLogin = (data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("role", data.role);
    localStorage.setItem("user", JSON.stringify(data.user));

    const { role, id, status } = data.user;

    if (role === "seller") localStorage.setItem("sellerId", id);

    if (role === "admin") {
      navigate("/admin/pending-sellers");
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

      if (res.ok) {
        handleSuccessfulLogin(data);
      } else {
        alert(data.message || t("Login failed"));
      }
    } catch (err) {
      console.error("Login Error:", err);
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

      if (res.ok) {
        handleSuccessfulLogin(data);
      } else {
        alert(data.message || t("Login failed"));
      }
    } catch (error) {
      console.error("Google Auth Error:", error);
      alert(t("Something went wrong"));
    }
  };

  return (
    <>
      <NavBar>{t("Need help?")}</NavBar>
      <div className="flex flex-col md:flex-row justify-between items-center px-6 md:px-24 py-10 gap-5 w-full">
        <div className="flex-1 flex items-center justify-center text-center mb-6 md:mb-0">
          <img
            src={logo}
            alt="SouqYemen"
            className="w-40 md:w-[30rem] lg:w-[50rem] h-auto block"
          />
        </div>

        <div className="flex-1 w-full max-w-md text-start md:me-24">
          <h2 className="text-2xl md:text-[28px] mb-2">{t("Welcome back")}</h2>
          <p className="text-base text-gray-700 mb-5">
            {t("Log in to your account")}
          </p>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="emailOrPhone"
              placeholder={t("Email or Phone Number")}
              value={formData.emailOrPhone}
              onChange={handleChange}
              required
              className="w-full box-border p-2.5 mb-4 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-red-900 outline-none"
            />
            <input
              type="password"
              name="password"
              placeholder={t("Password")}
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full box-border p-2.5 mb-4 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-red-900 outline-none"
            />
            <button
              type="submit"
              className="w-full bg-red-900 text-white py-3 text-base rounded cursor-pointer mb-4 border-none hover:bg-red-800 transition-colors"
            >
              {t("Log In")}
            </button>
          </form>

          <div className="mb-4 flex justify-center w-full">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => alert(t("Google Sign-In Failed"))}
              shape="rectangular"
            />
          </div>

          <Link
            to="/signup-seller"
            className="block w-full text-center p-2.5 bg-white border border-gray-300 rounded cursor-pointer text-sm hover:bg-gray-50 transition-colors"
          >
            {t("Become a Seller")}
          </Link>

          <p className="mt-5 text-sm">
            {t("Don't have an account?")}{" "}
            <Link
              to="/signup"
              className="text-red-900 underline hover:text-red-700"
            >
              {t("Create one")}
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
