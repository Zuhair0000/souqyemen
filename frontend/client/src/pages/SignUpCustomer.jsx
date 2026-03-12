import React, { useState } from "react";
import NavBar from "../components/NavBar";
import logo from "../assets/Logo.jpeg";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { GoogleLogin } from "@react-oauth/google";

export default function SignUpCustomer() {
  const [step, setStep] = useState(1); // Step 1: Details, Step 2: OTP
  const [otp, setOtp] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- Step 1: Send details and request OTP ---
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(
        "http://localhost:3001/api/auth/register/request-otp",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: formData.email }), // Send email to get OTP
        },
      );
      const result = await res.json();

      if (res.ok) {
        setStep(2); // Move to OTP screen
      } else {
        alert(result.message || t("Failed to send verification email"));
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // --- Step 2: Verify OTP and Create Account ---
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(
        "http://localhost:3001/api/auth/register/customer",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          // Send all data PLUS the otp
          body: JSON.stringify({ ...formData, otp }),
        },
      );
      const result = await res.json();

      if (res.ok) {
        alert(t("Account created successfully"));
        navigate("/login");
      } else {
        alert(result.message || t("Invalid OTP"));
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // --- Google Sign Up Logic ---
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
      } else {
        alert(data.message || t("Failed to create account"));
      }
    } catch (error) {
      console.error("Google Auth Error:", error);
    }
  };

  return (
    <>
      <NavBar />
      <div className="flex flex-col md:flex-row justify-between items-center px-6 md:px-[100px] py-10 gap-5 w-full">
        <div className="flex-1 flex items-center justify-center text-center mb-6 md:mb-0">
          <img
            src={logo}
            alt="SouqYemen"
            className="w-40 md:w-[30rem] lg:w-[50rem] h-auto block"
          />
        </div>

        <div className="flex-1 w-full max-w-sm md:max-w-[400px] text-start md:me-[100px]">
          {step === 1 ? (
            <>
              <h2 className="text-2xl md:text-[28px] mb-2">
                {t("Create an account")}
              </h2>
              <p className="text-sm md:text-[16px] text-[#444] mb-5">
                {t("Enter your details")}
              </p>

              <form onSubmit={handleRequestOtp}>
                <input
                  type="text"
                  name="name"
                  placeholder={t("Name")}
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full p-2 mt-2 mb-4 text-[14px] border border-gray-300 rounded text-start focus:ring-2 focus:ring-[#a40000] outline-none transition-all"
                />
                <input
                  type="email"
                  name="email"
                  placeholder={t("Email")}
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full p-2 mt-2 mb-4 text-[14px] border border-gray-300 rounded text-start focus:ring-2 focus:ring-[#a40000] outline-none transition-all"
                />
                <input
                  type="password"
                  name="password"
                  placeholder={t("Password")}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full p-2 mt-2 mb-4 text-[14px] border border-gray-300 rounded text-start focus:ring-2 focus:ring-[#a40000] outline-none transition-all"
                />
                <button
                  type="submit"
                  className="w-full bg-[#a40000] text-white py-3 text-[16px] rounded cursor-pointer hover:bg-[#850000] transition-colors"
                >
                  {t("Continue")}
                </button>
              </form>

              <div className="mt-6 flex justify-center w-full">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => alert(t("Google Sign-In Failed"))}
                  text="signup_with"
                  shape="rectangular"
                />
              </div>

              <Link
                to="/signup-seller"
                className="block w-full text-center mt-4 p-2 bg-white border border-gray-300 text-[14px] rounded cursor-pointer hover:bg-gray-50 transition-colors"
              >
                {t("Become a Seller")}
              </Link>

              <p className="mt-5 text-[14px]">
                {t("Already have account?")}{" "}
                <Link to="/login" className="text-blue-600 hover:underline">
                  {t("Log in")}
                </Link>
              </p>
            </>
          ) : (
            <>
              {/* OTP Verification UI */}
              <h2 className="text-2xl md:text-[28px] mb-2">
                {t("Verify your email")}
              </h2>
              <p className="text-sm md:text-[16px] text-[#444] mb-5">
                {t("We sent a code to")}{" "}
                <span className="font-semibold">{formData.email}</span>
              </p>

              <form onSubmit={handleVerifyOtp}>
                <input
                  type="text"
                  placeholder={t("Enter 6-digit OTP")}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  maxLength="6"
                  className="w-full p-3 mt-2 mb-4 text-[18px] text-center tracking-widest border border-gray-300 rounded focus:ring-2 focus:ring-[#a40000] outline-none transition-all"
                />
                <button
                  type="submit"
                  className="w-full bg-[#a40000] text-white py-3 text-[16px] rounded cursor-pointer hover:bg-[#850000] transition-colors"
                >
                  {t("Verify & Create Account")}
                </button>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full mt-3 py-3 text-[14px] text-gray-600 hover:underline"
                >
                  {t("Back to details")}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
}
