import React, { useState } from "react";
import NavBar from "../components/NavBar";
import logo from "../assets/Logo.jpeg";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { GoogleLogin } from "@react-oauth/google";
import { User, Mail, Lock, ShieldCheck } from "lucide-react";

export default function SignUpCustomer() {
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(
        "http://localhost:3001/api/auth/register/request-otp",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: formData.email }),
        },
      );
      const result = await res.json();
      if (res.ok) setStep(2);
      else alert(result.message || t("Failed to send verification email"));
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(
        "http://localhost:3001/api/auth/register/customer",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...formData, otp }),
        },
      );
      const result = await res.json();
      if (res.ok) {
        alert(t("Account created successfully"));
        navigate("/login");
      } else alert(result.message || t("Invalid OTP"));
    } catch (error) {
      console.error("Error:", error);
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
        alert(t("Account created successfully"));
        navigate("/login");
      } else alert(data.message || t("Failed to create account"));
    } catch (error) {
      console.error("Google Auth Error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50/50 via-white to-orange-50/30 flex flex-col">
      <NavBar />

      <div className="flex-1 flex flex-col md:flex-row justify-center items-center px-6 md:px-16 lg:px-24 py-10 gap-10">
        <div className="hidden md:flex flex-1 items-center justify-center">
          <img
            src={logo}
            alt="SouqYemen"
            className="w-[80%] max-w-[500px] h-auto drop-shadow-2xl rounded-[3rem]"
          />
        </div>

        <div className="w-full max-w-[450px] bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white p-8 md:p-10 text-start">
          {step === 1 ? (
            <>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">
                {t("Create an account")}
              </h2>
              <p className="text-gray-500 font-medium mb-8">
                {t("Enter your details")}
              </p>

              <form onSubmit={handleRequestOtp} className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    name="name"
                    placeholder={t("Full Name")}
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-400 focus:bg-white outline-none transition-all"
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    name="email"
                    placeholder={t("Email Address")}
                    value={formData.email}
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
                    placeholder={t("Create Password")}
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
                  {t("Continue")}
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
                  text="signup_with"
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
                {t("Already have an account?")}{" "}
                <Link
                  to="/login"
                  className="text-rose-500 font-bold hover:underline"
                >
                  {t("Log in")}
                </Link>
              </p>
            </>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <ShieldCheck size={32} />
              </div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">
                {t("Verify your email")}
              </h2>
              <p className="text-gray-500 font-medium mb-8">
                {t("We sent a code to")}{" "}
                <span className="font-bold text-gray-800">
                  {formData.email}
                </span>
              </p>

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <input
                  type="text"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  maxLength="6"
                  className="w-full py-4 text-3xl font-black tracking-[0.5em] text-center text-gray-800 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-400 focus:bg-white outline-none transition-all placeholder-gray-300"
                />
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-gray-900 to-gray-800 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all mt-4"
                >
                  {t("Verify & Create Account")}
                </button>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full py-3 text-sm font-bold text-gray-500 hover:text-gray-800 transition-colors mt-2"
                >
                  {t("Back to details")}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
