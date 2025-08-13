import React, { useState } from "react";
import NavBar from "../components/NavBar";
import logo from "../assets/Logo.jpeg";
import { Link } from "react-router-dom";

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
        }
      );
      const result = await res.json();
      if (res.ok) {
        alert("Submitted for review!");
      } else {
        alert(result.message || "Failed to register seller");
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
      <div className="flex justify-between items-center px-[100px] py-10 gap-5 w-full">
        <div className="flex-1 flex items-center text-center">
          <img
            src={logo}
            alt="SouqYemen"
            className="w-[50rem] max-w-full h-auto block"
          />
        </div>
        <div className="flex-1 text-left max-w-[400px] mr-[100px]">
          <h2 className="text-[28px] mb-2">Seller Registration</h2>
          <p className="text-[16px] text-[#444] mb-5">
            Enter your business details
          </p>

          <form onSubmit={handleSubmit} encType="multipart/form-data">
            <input
              type="text"
              name="businessName"
              placeholder="Business/Organization Name"
              value={formData.businessName}
              onChange={handleChange}
              required
              className="w-full p-2 mt-2 mb-4 text-[14px] border border-gray-300 rounded"
            />
            <input
              type="text"
              name="fullName"
              placeholder="Owner Full Name"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="w-full p-2 mt-2 mb-4 text-[14px] border border-gray-300 rounded"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full p-2 mt-2 mb-4 text-[14px] border border-gray-300 rounded"
            />
            <input
              type="tel"
              name="phoneNumber"
              placeholder="Phone Number"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
              className="w-full p-2 mt-2 mb-4 text-[14px] border border-gray-300 rounded"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full p-2 mt-2 mb-4 text-[14px] border border-gray-300 rounded"
            />
            <label className="block mt-2">
              Upload Business ID or Owner ID:
            </label>
            <input
              type="file"
              name="idPhoto"
              accept="image/*"
              onChange={handleChange}
              required
              className="w-full p-2 mt-2 mb-4 text-[14px] border border-gray-300 rounded"
            />
            <label className="block mt-2">Upload Selfie with ID:</label>
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
              Submit for Review
            </button>
          </form>

          <p className="mt-5 text-[14px]">
            Already registered?{" "}
            <Link to="/login" className="text-blue-600 hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
