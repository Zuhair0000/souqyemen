import React, { useState } from "react";
import NavBar from "../components/NavBar";
import logo from "../assets/Logo.jpeg";
import { Link } from "react-router-dom";

export default function SignUpCustomer() {
  const [formData, setFormData] = useState({
    name: "",
    emailOrPhone: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(
        "http://localhost:3001/api/auth/register/customer",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );
      const result = await res.json();
      if (res.ok) {
        alert("Account created successfully");
      } else {
        alert(result.message || "Failed to create account");
      }
    } catch (error) {
      console.error("Error:", error);
    }

    setFormData({ name: "", emailOrPhone: "", password: "" });
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

        {/* Form */}
        <div className="flex-1 w-full max-w-sm md:max-w-[400px] text-left md:mr-[100px]">
          <h2 className="text-2xl md:text-[28px] mb-2">Seller Registration</h2>
          <p className="text-sm md:text-[16px] text-[#444] mb-5">
            Enter your business details
          </p>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full p-2 mt-2 mb-4 text-[14px] border border-gray-300 rounded"
            />
            <input
              type="text"
              name="emailOrPhone"
              placeholder="Email or Phone Number"
              value={formData.emailOrPhone}
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
            <button
              type="submit"
              className="w-full bg-[#a40000] text-white py-3 text-[16px] rounded cursor-pointer"
            >
              Create Account
            </button>
          </form>

          <button className="w-full flex items-center justify-center mt-4 p-2 bg-white border border-gray-300 text-[14px] rounded cursor-pointer">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/4/4a/Logo_2013_Google.png"
              alt="Google"
              className="w-5 mr-2"
            />
            Sign up with Google
          </button>

          <Link to="/signup-seller">
            <button className="w-full flex items-center justify-center mt-4 p-2 bg-white border border-gray-300 text-[14px] rounded cursor-pointer">
              Become a Seller
            </button>
          </Link>

          <p className="mt-5 text-[14px]">
            Already have account?{" "}
            <Link to="/login" className="text-blue-600 hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
