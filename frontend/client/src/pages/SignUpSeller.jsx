import React, { useState } from "react";
import NavBar from "../components/NavBar";
import logo from "../assets/Logo.jpeg";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Store,
  User,
  Mail,
  Phone,
  Lock,
  UploadCloud,
  Image as ImageIcon,
} from "lucide-react";

export default function SignUpSeller() {
  const [formData, setFormData] = useState({
    businessName: "",
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    idPhoto: null,
    selfieWithId: null,
  });
  const { t } = useTranslation();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({ ...formData, [name]: files ? files[0] : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach((key) => data.append(key, formData[key]));

    try {
      const res = await fetch(
        "http://localhost:3001/api/auth/register/seller",
        { method: "POST", body: data },
      );
      const result = await res.json();
      if (res.ok) alert(t("Submitted for review!"));
      else alert(result.message || t("Failed to register seller"));
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50/50 via-white to-orange-50/30 flex flex-col">
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
            <div className="w-12 h-12 bg-rose-100 text-rose-500 rounded-xl flex items-center justify-center shadow-inner">
              <Store size={24} />
            </div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">
              {t("Seller Registration")}
            </h2>
          </div>
          <p className="text-gray-500 font-medium mb-8 ml-16">
            {t("Enter your business details")}
          </p>

          <form
            onSubmit={handleSubmit}
            encType="multipart/form-data"
            className="space-y-4"
          >
            {/* Grid Layout for compact feel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <Store size={18} />
                </div>
                <input
                  type="text"
                  name="businessName"
                  placeholder={t("Business Name")}
                  value={formData.businessName}
                  onChange={handleChange}
                  required
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-400 focus:bg-white outline-none transition-all"
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
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-400 focus:bg-white outline-none transition-all"
                />
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  name="email"
                  placeholder={t("Email")}
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-400 focus:bg-white outline-none transition-all"
                />
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <Phone size={18} />
                </div>
                <input
                  type="tel"
                  name="phoneNumber"
                  placeholder={t("Phone")}
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-400 focus:bg-white outline-none transition-all"
                />
              </div>
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
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-400 focus:bg-white outline-none transition-all"
              />
            </div>

            {/* Custom File Upload Styling */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-rose-200 rounded-xl bg-rose-50/50 hover:bg-rose-50 cursor-pointer transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {formData.idPhoto ? (
                    <ImageIcon className="text-rose-500 mb-1" />
                  ) : (
                    <UploadCloud className="text-rose-400 mb-1" />
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

              <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-rose-200 rounded-xl bg-rose-50/50 hover:bg-rose-50 cursor-pointer transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {formData.selfieWithId ? (
                    <ImageIcon className="text-rose-500 mb-1" />
                  ) : (
                    <UploadCloud className="text-rose-400 mb-1" />
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

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-gray-900 to-gray-800 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all mt-6"
            >
              {t("Submit for Review")}
            </button>
          </form>

          <div className="mt-6 flex flex-col items-center gap-2">
            <p className="text-center text-gray-500 font-medium">
              {t("Already registered?")}{" "}
              <Link
                to="/login"
                className="text-rose-500 font-bold hover:underline"
              >
                {t("Log in")}
              </Link>
            </p>

            {/* NEW: Logistics Link */}
            <Link
              to="/signup-delivery"
              className="text-sm font-bold text-indigo-600 hover:underline mt-2"
            >
              {t("Want to deliver instead? Join as Logistics.")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
