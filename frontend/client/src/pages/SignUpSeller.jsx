import React, { useState } from "react";
import NavBar from "../components/NavBar";
import logo from "../assets/Logo.jpeg";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

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
    if (files) {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("businessName", formData.businessName);
    data.append("fullName", formData.fullName);
    data.append("email", formData.email);
    data.append("password", formData.password);
    data.append("phoneNumber", formData.phoneNumber);
    data.append("idPhoto", formData.idPhoto);
    data.append("selfieWithId", formData.selfieWithId);

    try {
      const res = await fetch(
        "http://localhost:3001/api/auth/register/seller",
        {
          method: "POST",
          body: data,
        },
      );
      const result = await res.json();
      if (res.ok) {
        alert(t("Submitted for review!"));
      } else {
        alert(result.message || t("Failed to register seller"));
      }
    } catch (error) {
      console.error("Error:", error);
    }

    setFormData({
      businessName: "",
      fullName: "",
      email: "",
      phoneNumber: "",
      password: "",
      idPhoto: null,
      selfieWithId: null,
    });
  };

  return (
    <>
      <NavBar />
      <div className="flex flex-col md:flex-row justify-between items-center px-6 md:px-[100px] py-10 gap-5 w-full">
        {/* Logo */}
        <div className="flex-1 flex items-center justify-center text-center mb-6 md:mb-0">
          <img
            src={logo}
            alt="SouqYemen"
            className="w-40 md:w-[30rem] lg:w-[50rem] h-auto block"
          />
        </div>

        {/* Form - Changed text-left to text-start and md:mr-[100px] to md:me-[100px] */}
        <div className="flex-1 w-full max-w-sm md:max-w-[400px] text-start md:me-[100px]">
          <h2 className="text-2xl md:text-[28px] mb-2">
            {t("Seller Registration")}
          </h2>
          <p className="text-sm md:text-[16px] text-[#444] mb-5">
            {t("Enter your business details")}
          </p>

          <form onSubmit={handleSubmit} encType="multipart/form-data">
            <input
              type="text"
              name="businessName"
              placeholder={t("Business/Organization Name")}
              value={formData.businessName}
              onChange={handleChange}
              required
              className="w-full p-2 mt-2 mb-4 text-[14px] border border-gray-300 rounded text-start"
            />
            <input
              type="text"
              name="fullName"
              placeholder={t("Owner Full Name")}
              value={formData.fullName}
              onChange={handleChange}
              required
              className="w-full p-2 mt-2 mb-4 text-[14px] border border-gray-300 rounded text-start"
            />
            <input
              type="email"
              name="email"
              placeholder={t("Email")}
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full p-2 mt-2 mb-4 text-[14px] border border-gray-300 rounded text-start"
            />
            <input
              type="tel"
              name="phoneNumber"
              placeholder={t("Phone Number")}
              value={formData.phoneNumber}
              onChange={handleChange}
              required
              className="w-full p-2 mt-2 mb-4 text-[14px] border border-gray-300 rounded text-start"
            />
            <input
              type="password"
              name="password"
              placeholder={t("Password")}
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full p-2 mt-2 mb-4 text-[14px] border border-gray-300 rounded text-start"
            />
            <label className="block mt-2">
              {t("Upload Business ID or Owner ID:")}
            </label>
            <input
              type="file"
              name="idPhoto"
              accept="image/*"
              onChange={handleChange}
              required
              className="w-full p-2 mt-2 mb-4 text-[14px] border border-gray-300 rounded"
            />
            <label className="block mt-2">{t("Upload Selfie with ID:")}</label>
            <input
              type="file"
              name="selfieWithId"
              accept="image/*"
              onChange={handleChange}
              required
              className="w-full p-2 mt-2 mb-4 text-[14px] border border-gray-300 rounded"
            />
            <button
              type="submit"
              className="w-full bg-[#a40000] text-white py-3 text-[16px] rounded cursor-pointer"
            >
              {t("Submit for Review")}
            </button>
          </form>

          <p className="mt-5 text-[14px]">
            {t("Already registered?")}{" "}
            <Link to="/login" className="text-blue-600 hover:underline">
              {t("Log in")}
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
