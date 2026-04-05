import React, { useState } from "react";
import NavBar from "../components/NavBar";
import logo from "../assets/Logo.jpeg";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Truck, Mail, Phone, Lock, Building } from "lucide-react";

export default function SignUpDelivery() {
  const [formData, setFormData] = useState({
    companyName: "",
    email: "",
    phone: "",
    password: "",
  });
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(
        "http://localhost:3001/api/delivery/auth/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        },
      );
      const result = await res.json();
      if (res.ok) {
        alert(t("Logistics Account Created!"));
        navigate("/login");
      } else {
        alert(result.message || t("Registration failed"));
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfbf7] flex flex-col">
      <NavBar />

      <div className="flex-1 flex flex-col lg:flex-row justify-center items-center px-4 md:px-12 py-10 gap-10">
        <div className="hidden lg:flex flex-1 items-center justify-center">
          <img
            src={logo}
            alt="SouqYemen"
            className="w-[80%] max-w-[500px] h-auto drop-shadow-2xl rounded-[3rem]"
          />
        </div>

        <div className="w-full max-w-[450px] bg-white rounded-[2rem] shadow-xl border border-gray-100 p-8 md:p-10 text-start">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center shadow-inner">
              <Truck size={24} />
            </div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">
              {t("Partner with Us")}
            </h2>
          </div>
          <p className="text-gray-500 font-medium mb-8 ml-16">
            {t("Register your delivery company.")}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <Building size={18} />
              </div>
              <input
                type="text"
                name="companyName"
                placeholder={t("Company Name")}
                value={formData.companyName}
                onChange={handleChange}
                required
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:bg-white outline-none transition-all"
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
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:bg-white outline-none transition-all"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <Phone size={18} />
              </div>
              <input
                type="tel"
                name="phone"
                placeholder={t("Contact Phone")}
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:bg-white outline-none transition-all"
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
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:bg-white outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg shadow-md hover:bg-indigo-700 hover:-translate-y-0.5 transition-all mt-6"
            >
              {t("Register Company")}
            </button>
          </form>

          <p className="text-center text-gray-500 font-medium mt-6">
            {t("Already registered?")}{" "}
            <Link
              to="/login"
              className="text-indigo-600 font-bold hover:underline"
            >
              {t("Log in")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
