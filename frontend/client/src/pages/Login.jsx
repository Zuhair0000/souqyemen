import React, { useState } from "react";
import NavBar from "../components/NavBar";
import logo from "../assets/Logo.jpeg";
import "./Login.css";
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
      <div className="login-container">
        <div className="logo-wrapper">
          <img src={logo} alt="SouqYemen" className="logo" />
        </div>

        <div className="form-wrapper">
          <h2>Welcome back</h2>
          <p>Log in to your account</p>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="emailOrPhone"
              placeholder="Email or Phone Number"
              value={formData.emailOrPhone}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <button type="submit" className="login-btn">
              Log In
            </button>
          </form>

          <button className="google-btn">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/4/4a/Logo_2013_Google.png"
              alt="Google"
            />
            Log in with Google
          </button>

          <Link to="/signup-seller">
            <button className="google-btn">Become a Seller</button>
          </Link>

          <p className="signup-link">
            Don't have an account? <Link to="/signup">Create one</Link>
          </p>
        </div>
      </div>
    </>
  );
}
