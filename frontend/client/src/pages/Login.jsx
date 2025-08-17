import React, { useState } from "react";
import NavBar from "../components/NavBar";
import logo from "../assets/Logo.jpeg";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const [formData, setFormData] = useState({
    emailOrPhone: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:3001/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);
        localStorage.setItem("user", JSON.stringify(data.user));

        const { role, id, status } = data.user;

        if (role === "seller") {
          localStorage.setItem("sellerId", id);
        }

        if (role === "admin") {
          navigate("/admin/pending-sellers");
        } else if (role === "seller") {
          if (status === "approved") {
            navigate("/seller/dashboard");
          } else {
            alert("Your seller account is still under review or was rejected.");
          }
        } else if (role === "customer") {
          navigate("/");
        } else {
          navigate("/"); // fallback
        }
      } else {
        alert(data.message || "Login failed");
      }
    } catch (err) {
      console.error("Login Error:", err);
      alert("Something went wrong");
    }
  };

  return (
    <>
      <NavBar>Need help?</NavBar>
      <div className="flex flex-col md:flex-row justify-between items-center px-6 md:px-24 py-10 gap-5 w-full">
        {/* Logo Section */}
        <div className="flex-1 flex items-center justify-center text-center mb-6 md:mb-0">
          <img
            src={logo}
            alt="SouqYemen"
            className="w-40 md:w-[30rem] lg:w-[50rem] h-auto block"
          />
        </div>

        {/* Form Section */}
        <div className="flex-1 w-full max-w-md text-left md:mr-24">
          <h2 className="text-2xl md:text-[28px] mb-2">Welcome back</h2>
          <p className="text-base text-gray-700 mb-5">Log in to your account</p>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="emailOrPhone"
              placeholder="Email or Phone Number"
              value={formData.emailOrPhone}
              onChange={handleChange}
              required
              className="w-full box-border p-2.5 mb-4 text-sm border border-gray-300 rounded"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full box-border p-2.5 mb-4 text-sm border border-gray-300 rounded"
            />
            <button
              type="submit"
              className="w-full bg-red-900 text-white py-3 text-base rounded cursor-pointer mb-4 border-none"
            >
              Log In
            </button>
          </form>

          <button
            className="w-full flex items-center justify-center p-2.5 bg-white border border-gray-300 rounded cursor-pointer text-sm mb-4"
            type="button"
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/4/4a/Logo_2013_Google.png"
              alt="Google"
              className="w-5 mr-2"
            />
            Log in with Google
          </button>

          <Link to="/signup-seller">
            <button
              className="w-full flex items-center justify-center p-2.5 bg-white border border-gray-300 rounded cursor-pointer text-sm"
              type="button"
            >
              Become a Seller
            </button>
          </Link>

          <p className="mt-5 text-sm">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-red-900 underline hover:text-red-700"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
