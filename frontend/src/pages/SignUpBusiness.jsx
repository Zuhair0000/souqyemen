import React, { useState } from "react";
import NavBar from "../components/NavBar";
import logo from "../assets/Logo.jpeg";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Store,
  User,
  Mail,
  Phone,
  Lock,
  UploadCloud,
  Image as ImageIcon,
  Truck,
  CheckCircle,
  X,
  Loader2,
  Building,
} from "lucide-react";

export default function SignUpBusiness() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    role: "seller",
    businessName: "",
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    idPhoto: null,
    selfieWithId: null,
  });

  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState("");

  const [agreePolicies, setAgreePolicies] = useState(false);
  const [showPolicies, setShowPolicies] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({ ...formData, [name]: files ? files[0] : value });

    if (name === "email" && isEmailVerified) {
      setIsEmailVerified(false);
    }
  };

  const handleRequestOtp = async () => {
    if (!formData.email || !formData.email.includes("@")) {
      alert(t("Please enter a valid email address first."));
      return;
    }

    setIsSendingOtp(true);
    try {
      const res = await fetch("http://localhost:3001/api/auth/send-otp", {
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

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setOtpError("");

    try {
      const res = await fetch("http://localhost:3001/api/auth/verify-otp", {
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isEmailVerified) {
      alert(t("You must verify your email provider before registering."));
      return;
    }
    if (!agreePolicies) {
      alert(t("You must agree to the platform policies."));
      return;
    }

    const data = new FormData();
    Object.keys(formData).forEach((key) => data.append(key, formData[key]));

    const endpoint =
      formData.role === "seller"
        ? "http://localhost:3001/api/auth/register/seller"
        : "http://localhost:3001/api/delivery/auth/register";

    try {
      const res = await fetch(endpoint, { method: "POST", body: data });
      const result = await res.json();

      if (res.ok) {
        alert(t("Submitted for review! You will be notified upon approval."));
        navigate("/login");
      } else {
        alert(result.message || t("Failed to register account"));
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50/50 via-white to-orange-50/30 flex flex-col relative">
      <NavBar />

      <div className="flex-1 flex flex-col lg:flex-row justify-center items-center px-4 md:px-12 py-10 gap-10">
        <div className="hidden lg:flex flex-1 items-center justify-center">
          <img
            src={logo}
            alt="SouqYemen"
            className="w-[80%] max-w-[500px] h-auto drop-shadow-2xl rounded-[3rem]"
          />
        </div>

        <div className="w-full max-w-[550px] bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white p-6 md:p-10 text-start">
          <div className="flex items-center gap-4 mb-2">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-inner transition-colors duration-300 ${
                formData.role === "seller"
                  ? "bg-rose-100 text-rose-500"
                  : "bg-indigo-100 text-indigo-600"
              }`}
            >
              {formData.role === "seller" ? (
                <Store size={24} />
              ) : (
                <Truck size={24} />
              )}
            </div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">
              {t("Partner Registration")}
            </h2>
          </div>
          <p className="text-gray-500 font-medium mb-6 ml-16">
            {t("Submit your business details for verification")}
          </p>

          <form
            onSubmit={handleSubmit}
            encType="multipart/form-data"
            className="space-y-4"
          >
            {/* ROLE SELECTION TOGGLE */}
            <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: "seller" })}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                  formData.role === "seller"
                    ? "bg-white text-rose-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {t("Store Seller")}
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: "shipping" })}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                  formData.role === "shipping"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {t("Shipping Company")}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  {formData.role === "seller" ? (
                    <Store size={18} />
                  ) : (
                    <Building size={18} />
                  )}
                </div>
                <input
                  type="text"
                  name="businessName"
                  placeholder={
                    formData.role === "seller"
                      ? t("Store Name")
                      : t("Company Name")
                  }
                  value={formData.businessName}
                  onChange={handleChange}
                  required
                  className={`w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:bg-white outline-none transition-all ${
                    formData.role === "seller"
                      ? "focus:ring-rose-400"
                      : "focus:ring-indigo-400"
                  }`}
                />
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  name="fullName"
                  placeholder={t("Owner Name")}
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className={`w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:bg-white outline-none transition-all ${
                    formData.role === "seller"
                      ? "focus:ring-rose-400"
                      : "focus:ring-indigo-400"
                  }`}
                />
              </div>
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
                  placeholder={t("Business Email")}
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className={`w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:bg-white outline-none transition-all ${
                    formData.role === "seller"
                      ? "focus:ring-rose-400"
                      : "focus:ring-indigo-400"
                  }`}
                />
              </div>
              <button
                type="button"
                onClick={handleRequestOtp}
                disabled={isEmailVerified || isSendingOtp || !formData.email}
                className={`px-4 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <Phone size={18} />
                </div>
                <input
                  type="tel"
                  name="phoneNumber"
                  placeholder={t("Contact Phone")}
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                  className={`w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:bg-white outline-none transition-all ${
                    formData.role === "seller"
                      ? "focus:ring-rose-400"
                      : "focus:ring-indigo-400"
                  }`}
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
                  className={`w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:bg-white outline-none transition-all ${
                    formData.role === "seller"
                      ? "focus:ring-rose-400"
                      : "focus:ring-indigo-400"
                  }`}
                />
              </div>
            </div>

            {/* FILE UPLOADS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <label
                className={`flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                  formData.role === "seller"
                    ? "border-rose-200 bg-rose-50/50 hover:bg-rose-50"
                    : "border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50"
                }`}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {formData.idPhoto ? (
                    <ImageIcon
                      className={`mb-1 ${formData.role === "seller" ? "text-rose-500" : "text-indigo-500"}`}
                    />
                  ) : (
                    <UploadCloud
                      className={`mb-1 ${formData.role === "seller" ? "text-rose-400" : "text-indigo-400"}`}
                    />
                  )}
                  <p className="text-xs text-gray-500 font-medium px-2 text-center">
                    {formData.idPhoto
                      ? formData.idPhoto.name
                      : t("Upload Business ID")}
                  </p>
                </div>
                <input
                  type="file"
                  name="idPhoto"
                  accept="image/*"
                  onChange={handleChange}
                  required
                  className="hidden"
                />
              </label>

              <label
                className={`flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                  formData.role === "seller"
                    ? "border-rose-200 bg-rose-50/50 hover:bg-rose-50"
                    : "border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50"
                }`}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {formData.selfieWithId ? (
                    <ImageIcon
                      className={`mb-1 ${formData.role === "seller" ? "text-rose-500" : "text-indigo-500"}`}
                    />
                  ) : (
                    <UploadCloud
                      className={`mb-1 ${formData.role === "seller" ? "text-rose-400" : "text-indigo-400"}`}
                    />
                  )}
                  <p className="text-xs text-gray-500 font-medium px-2 text-center">
                    {formData.selfieWithId
                      ? formData.selfieWithId.name
                      : t("Selfie with ID")}
                  </p>
                </div>
                <input
                  type="file"
                  name="selfieWithId"
                  accept="image/*"
                  onChange={handleChange}
                  required
                  className="hidden"
                />
              </label>
            </div>

            {/* POLICIES AGREEMENT */}
            <div className="flex items-center gap-3 pt-4">
              <input
                type="checkbox"
                id="policies"
                checked={agreePolicies}
                onChange={(e) => setAgreePolicies(e.target.checked)}
                className={`w-5 h-5 border-gray-300 rounded cursor-pointer ${
                  formData.role === "seller"
                    ? "text-rose-500 focus:ring-rose-400"
                    : "text-indigo-600 focus:ring-indigo-400"
                }`}
              />
              <label
                htmlFor="policies"
                className="text-sm text-gray-600 font-medium"
              >
                {t("I have read and agree to the")}{" "}
                <button
                  type="button"
                  onClick={() => setShowPolicies(true)}
                  className={`font-bold hover:underline bg-transparent border-none p-0 cursor-pointer ${
                    formData.role === "seller"
                      ? "text-rose-600"
                      : "text-indigo-600"
                  }`}
                >
                  {t("platform policies")}
                </button>
              </label>
            </div>

            {/* THE UNIFIED DYNAMIC BUTTON */}
            <button
              type="submit"
              disabled={!isEmailVerified || !agreePolicies}
              className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all mt-6 ${
                !isEmailVerified || !agreePolicies
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : formData.role === "seller"
                    ? "bg-gradient-to-r from-rose-500 to-orange-500 text-white hover:shadow-xl hover:-translate-y-0.5"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-xl hover:-translate-y-0.5"
              }`}
            >
              {t("Submit for Review")}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-500 font-medium">
              {t("Already registered?")}{" "}
              <Link
                to="/login"
                className={`font-bold hover:underline ${
                  formData.role === "seller"
                    ? "text-rose-500"
                    : "text-indigo-600"
                }`}
              >
                {t("Log in")}
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* POLICIES MODAL */}
      {showPolicies && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg p-6 md:p-8 relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setShowPolicies(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-700 transition-colors"
            >
              <X size={24} />
            </button>
            <h3 className="text-2xl font-black text-gray-900 mb-4">
              {t("Platform Policies")}
            </h3>
            <div className="h-64 overflow-y-auto pr-2 text-gray-600 text-sm space-y-4 font-medium custom-scrollbar">
              <p>{t("policy_1")}</p>
              <p>{t("policy_2")}</p>
              <p>{t("policy_3")}</p>
              <p>{t("policy_4")}</p>
              <p>{t("policy_5")}</p>
            </div>
            <button
              onClick={() => {
                setAgreePolicies(true);
                setShowPolicies(false);
              }}
              className={`w-full mt-6 text-white font-bold py-3 rounded-xl transition-colors ${
                formData.role === "seller"
                  ? "bg-rose-500 hover:bg-rose-600"
                  : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              {t("I Agree")}
            </button>
          </div>
        </div>
      )}

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
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${
                formData.role === "seller"
                  ? "bg-rose-100 text-rose-500"
                  : "bg-indigo-100 text-indigo-600"
              }`}
            >
              <Mail size={24} />
            </div>
            <h3 className="text-xl font-black text-center text-gray-900 mb-2">
              {t("Verify your email")}
            </h3>
            <p className="text-center text-gray-500 text-sm mb-6">
              {t("We sent a 6-digit code to")}{" "}
              <span className="font-bold text-gray-700">{formData.email}</span>
            </p>

            <form onSubmit={handleVerifyOtp}>
              <input
                type="text"
                maxLength="6"
                placeholder="000000"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className={`w-full text-center text-3xl font-black tracking-[0.5em] py-4 bg-gray-50 border border-gray-200 rounded-xl outline-none mb-2 focus:ring-2 ${
                  formData.role === "seller"
                    ? "focus:ring-rose-400"
                    : "focus:ring-indigo-400"
                }`}
                required
              />
              {otpError && (
                <p className="text-rose-500 text-xs text-center font-bold mb-4">
                  {otpError}
                </p>
              )}
              <button
                type="submit"
                className={`w-full text-white font-bold py-3 rounded-xl mt-4 ${
                  formData.role === "seller"
                    ? "bg-rose-500 hover:bg-rose-600"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
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
