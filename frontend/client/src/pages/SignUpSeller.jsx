import React, { useState } from "react";
import NavBar from "../components/NavBar";
import logo from "../assets/Logo.jpeg";
import "./SignUp.css";
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
      console.log(result);
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
      <div className="signup-container">
        <div className="logo-wrapper">
          <img src={logo} alt="SouqYemen" className="logo" />
        </div>
        <div className="form-wrapper">
          <h2>Seller Registration</h2>
          <p>Enter your business details</p>

          <form onSubmit={handleSubmit} encType="multipart/form-data">
            <input
              type="text"
              name="businessName"
              placeholder="Business/Organization Name"
              value={formData.businessName}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="fullName"
              placeholder="Owner Full Name"
              value={formData.ownerFullName}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <input
              type="tel"
              name="phoneNumber"
              placeholder="Phone Number"
              value={formData.phoneNumber}
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
            <label>Upload Business ID or Owner ID:</label>
            <input
              type="file"
              name="idPhoto"
              accept="image/*"
              onChange={handleChange}
              required
            />
            <label>Upload Selfie with ID:</label>
            <input
              type="file"
              name="selfieWithId"
              accept="image/*"
              onChange={handleChange}
              required
            />
            <button type="submit" className="create-btn">
              Submit for Review
            </button>
          </form>

          <p className="login-link">
            Already registered? <Link to="/login">Log in</Link>
          </p>
        </div>
      </div>
    </>
  );
}
