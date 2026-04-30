import React, { useState } from "react";
import NavBar from "../components/NavBar";
import logo from "../assets/Logo.jpeg";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { GoogleLogin } from "@react-oauth/google";
import {
  User,
  Mail,
  Lock,
  ShieldCheck,
  CheckCircle,
  X,
  Loader2,
  Briefcase,
} from "lucide-react";

export default function SignUpCustomer() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const navigate = useNavigate();
  const { t } = useTranslation();

  // UNIFIED VERIFICATION STATES
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Prevent cheating: strip verified status if they change the email
    if (name === "email" && isEmailVerified) {
      setIsEmailVerified(false);
    }
  };

  // 1. Request OTP (Uses the exact same route as businesses!)
  const handleRequestOtp = async () => {
    if (!formData.email || !formData.email.includes("@")) {
      alert(t("Please enter a valid email address first."));
      return;
    }

    setIsSendingOtp(true);
    try {
      const res = await fetch("https://souqyemen.store/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      if (res.ok) {
        setShowOtpModal(true);
      } else {
        const error = await res.json();
        alert(error.message || t("Failed to send verification code."));
      }
    } catch (error) {
      console.error("OTP Error:", error);
      alert(t("Server error. Please make sure backend is running."));
    } finally {
      setIsSendingOtp(false);
    }
  };

  // 2. Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setOtpError("");

    try {
      const res = await fetch("https://souqyemen.store/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, otp: otpCode }),
      });

      if (res.ok) {
        setIsEmailVerified(true);
        setShowOtpModal(false);
      } else {
        setOtpError(t("Incorrect or expired code."));
      }
    } catch (error) {
      setOtpError(t("Server error during verification."));
    }
  };

  // 3. Final Submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isEmailVerified) {
      alert(t("You must verify your email before registering."));
      return;
    }

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        otp: otpCode,
      };

      const res = await fetch(
        "https://souqyemen.store/api/auth/register/customer",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const result = await res.json();
      if (res.ok) {
        alert(t("Account created successfully"));
        navigate("/login");
      } else alert(result.message || t("Registration failed"));
    } catch (error) {
      console.error("Error:", error);
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
      if (res.ok) {
        alert(t("Account created successfully"));
        navigate("/login");
      } else alert(data.message || t("Failed to create account"));
    } catch (error) {
      console.error("Google Auth Error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50/50 via-white to-orange-50/30 flex flex-col relative">
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
          <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">
            {t("Create an account")}
          </h2>
          <p className="text-gray-500 font-medium mb-8">
            {t("Enter your details")}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
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

            {/* EMAIL WITH VERIFICATION BUTTON */}
            <div className="relative flex gap-2">
              <div className="relative flex-1">
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
              <button
                type="button"
                onClick={handleRequestOtp}
                disabled={isEmailVerified || isSendingOtp || !formData.email}
                className={`px-4 py-3.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                  isEmailVerified
                    ? "bg-green-100 text-green-600 border border-green-200 cursor-not-allowed"
                    : isSendingOtp
                      ? "bg-gray-200 text-gray-500 cursor-wait"
                      : "bg-gray-900 text-white hover:bg-gray-800 shadow-md active:scale-95"
                }`}
              >
                {isSendingOtp ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : isEmailVerified ? (
                  <>
                    <CheckCircle size={16} /> {t("Verified")}
                  </>
                ) : (
                  t("Verify")
                )}
              </button>
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
              disabled={!isEmailVerified}
              className={`w-full py-4 rounded-xl font-bold text-lg shadow-md transition-all mt-2 ${
                !isEmailVerified
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-rose-500 to-orange-500 text-white hover:shadow-lg hover:-translate-y-0.5"
              }`}
            >
              {t("Create Account")}
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

          {/* THE NEW UNIFIED BUSINESS BUTTON */}
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
            {t("Already have an account?")}{" "}
            <Link
              to="/login"
              className="text-rose-500 font-bold hover:underline"
            >
              {t("Log in")}
            </Link>
          </p>
        </div>
      </div>

      {/* OTP VERIFICATION MODAL */}
      {showOtpModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm p-8 relative">
            <button
              onClick={() => setShowOtpModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-700"
            >
              <X size={20} />
            </button>
            <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <ShieldCheck size={32} />
            </div>
            <h3 className="text-2xl font-black text-center text-gray-900 mb-2">
              {t("Verify your email")}
            </h3>
            <p className="text-center text-gray-500 text-sm mb-6">
              {t("We sent a 6-digit code to")}{" "}
              <span className="font-bold text-gray-800">{formData.email}</span>
            </p>

            <form onSubmit={handleVerifyOtp}>
              <input
                type="text"
                maxLength="6"
                placeholder="000000"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className="w-full text-center text-3xl font-black tracking-[0.5em] py-4 bg-gray-50 border border-gray-200 rounded-xl outline-none mb-2 focus:ring-2 focus:ring-rose-400 placeholder-gray-300"
                required
              />
              {otpError && (
                <p className="text-rose-500 text-xs text-center font-bold mb-4">
                  {otpError}
                </p>
              )}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-gray-900 to-gray-800 text-white font-bold py-4 rounded-xl mt-4 hover:shadow-lg transition-all"
              >
                {t("Confirm Code")}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
