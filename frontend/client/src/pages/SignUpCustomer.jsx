import React, { useState } from "react";
import NavBar from "../components/NavBar";
import logo from "../assets/Logo.jpeg";
import "./SignUp.css";
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
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const result = await res.json();
      console.log(result);

      if (res.ok) {
        alert("Account created successfully");
      } else {
        alert(result.message || "Failed to create account");
      }
    } catch (error) {
      console.error("Error:", error);
    }

    setFormData({
      name: "",
      emailOrPhone: "",
      password: "",
    });
  };
  return (
    <>
      <NavBar>Need help?</NavBar>
      <div className="signup-container">
        <div className="logo-wrapper">
          <img src={logo} alt="SouqYemen" className="logo" />
        </div>
        <div className="form-wrapper">
          <h2>Create an account</h2>
          <p>Enter your details</p>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
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
            <button type="submit" className="create-btn">
              Create Account
            </button>
          </form>
          <button className="google-btn">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/4/4a/Logo_2013_Google.png"
              alt="Google"
              style={{ width: "20px", marginRight: "8px" }}
            />
            Sign up with Google
          </button>
          <Link to="/signup-seller">
            <button className="google-btn">Become a Seller</button>
          </Link>

          <p className="login-link">
            Already have account? <Link to="/login">Log in</Link>
          </p>
        </div>
      </div>
    </>
  );
}
