import React, { useState } from "react";
import NavBar from "../components/NavBar";
import logo from "../assets/Logo.jpeg";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { GoogleLogin } from "@react-oauth/google";
import { Mail, Lock, Briefcase, X, Loader2, CheckCircle } from "lucide-react";

export default function Login() {
  const [formData, setFormData] = useState({ emailOrPhone: "", password: "" });
  const navigate = useNavigate();
  const { t } = useTranslation();

  // --- PASSWORD RESET STATES ---
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetStep, setResetStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [resetEmail, setResetEmail] = useState("");
  const [resetOtp, setResetOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState("");

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
      navigate("/delivery/orders");
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
      const res = await fetch("https://souqyemen.store/api/auth/login", {
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
      const res = await fetch("https://souqyemen.store/api/auth/google/login", {
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

  // --- PASSWORD RESET HANDLERS ---
  const handleSendResetOtp = async (e) => {
    e.preventDefault();
    setResetLoading(true);
    setResetError("");
    try {
      // Reusing your existing OTP endpoint
      const res = await fetch("https://souqyemen.store/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail }),
      });
      if (res.ok) setResetStep(2);
      else {
        const error = await res.json();
        setResetError(error.message || t("Failed to send verification code."));
      }
    } catch (err) {
      setResetError(t("Server error."));
    }
    setResetLoading(false);
  };

  const handleVerifyResetOtp = async (e) => {
    e.preventDefault();
    setResetLoading(true);
    setResetError("");
    try {
      // Reusing your existing OTP verification endpoint
      const res = await fetch("https://souqyemen.store/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail, otp: resetOtp }),
      });
      if (res.ok) setResetStep(3);
      else setResetError(t("Incorrect or expired code."));
    } catch (err) {
      setResetError(t("Server error."));
    }
    setResetLoading(false);
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setResetError(t("Password must be at least 6 characters."));
      return;
    }
    setResetLoading(true);
    setResetError("");
    try {
      // Calls a new endpoint to actually update the password
      const res = await fetch(
        "https://souqyemen.store/api/auth/reset-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: resetEmail, newPassword }),
        },
      );
      if (res.ok) {
        alert(t("Password updated successfully! You can now log in."));
        closeResetModal();
      } else {
        const error = await res.json();
        setResetError(error.message || t("Failed to update password."));
      }
    } catch (err) {
      setResetError(t("Server error."));
    }
    setResetLoading(false);
  };

  const closeResetModal = () => {
    setShowResetModal(false);
    setResetStep(1);
    setResetEmail("");
    setResetOtp("");
    setNewPassword("");
    setResetError("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50/50 via-white to-orange-50/30 flex flex-col relative">
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

            {/* FORGOT PASSWORD LINK */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowResetModal(true)}
                className="text-sm font-bold text-rose-500 hover:text-rose-600 hover:underline transition-colors"
              >
                {t("Forgot Password?")}
              </button>
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

          <div className="mb-6">
            <Link
              to="/signup-business"
              className="flex items-center justify-center gap-2 w-full py-3.5 bg-gray-900 text-white font-bold rounded-xl shadow-md hover:bg-gray-800 transition-all active:scale-95"
            >
              <Briefcase size={18} />
              {t("Partner with Us (Store & Logistics)")}
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

      {/* --- FORGOT PASSWORD MODAL --- */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md p-8 relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={closeResetModal}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 transition-colors"
            >
              <X size={20} />
            </button>

            {resetStep === 1 && (
              <form onSubmit={handleSendResetOtp} className="space-y-4">
                <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center mx-auto mb-4">
                  <Mail size={24} />
                </div>
                <h3 className="text-2xl font-black text-center text-gray-900 mb-2">
                  {t("Reset Password")}
                </h3>
                <p className="text-center text-gray-500 text-sm mb-6">
                  {t(
                    "Enter your email address to receive a verification code.",
                  )}
                </p>
                <input
                  type="email"
                  placeholder={t("Email")}
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-rose-400"
                />
                {resetError && (
                  <p className="text-rose-500 text-sm font-bold text-center">
                    {resetError}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full bg-rose-500 text-white font-bold py-3 rounded-xl hover:bg-rose-600 transition-colors flex justify-center items-center gap-2"
                >
                  {resetLoading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    t("Send Code")
                  )}
                </button>
              </form>
            )}

            {resetStep === 2 && (
              <form onSubmit={handleVerifyResetOtp} className="space-y-4">
                <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-500 flex items-center justify-center mx-auto mb-4">
                  <Lock size={24} />
                </div>
                <h3 className="text-2xl font-black text-center text-gray-900 mb-2">
                  {t("Verify Code")}
                </h3>
                <p className="text-center text-gray-500 text-sm mb-6">
                  {t("Enter the 6-digit code sent to")} <br />
                  <span className="font-bold text-gray-800">{resetEmail}</span>
                </p>
                <input
                  type="text"
                  maxLength="6"
                  placeholder="000000"
                  value={resetOtp}
                  onChange={(e) => setResetOtp(e.target.value)}
                  required
                  className="w-full text-center text-3xl font-black tracking-[0.5em] py-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-400"
                />
                {resetError && (
                  <p className="text-rose-500 text-sm font-bold text-center">
                    {resetError}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors flex justify-center items-center gap-2"
                >
                  {resetLoading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    t("Verify")
                  )}
                </button>
              </form>
            )}

            {resetStep === 3 && (
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div className="w-12 h-12 rounded-full bg-green-100 text-green-500 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={24} />
                </div>
                <h3 className="text-2xl font-black text-center text-gray-900 mb-2">
                  {t("Set New Password")}
                </h3>
                <p className="text-center text-gray-500 text-sm mb-6">
                  {t("Please enter a new strong password for your account.")}
                </p>
                <input
                  type="password"
                  placeholder={t("New Password")}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-400"
                />
                {resetError && (
                  <p className="text-rose-500 text-sm font-bold text-center">
                    {resetError}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full bg-green-500 text-white font-bold py-3 rounded-xl hover:bg-green-600 transition-colors flex justify-center items-center gap-2"
                >
                  {resetLoading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    t("Update Password")
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
