// pages/customer/ProfilePage.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import "./Profile.css";
import NavBar from "../components/NavBar";
import Icons from "../components/Icons";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const token = localStorage.getItem("token");

  useEffect(() => {
    axios
      .get("http://localhost:3001/api/user/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setUser(res.data);
        setFormData({
          name: res.data.name || "",
          email: res.data.email || "",
          phone: res.data.phone || "",
          address: res.data.address || "",
        });
      })
      .catch((err) => console.error(err));
  }, [token]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleUpdate = () => {
    axios
      .put("http://localhost:3001/api/user/profile", formData, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => alert("Profile updated"))
      .catch((err) => console.error(err));
  };

  if (!user) return <p>Loading...</p>;

  return (
    <>
      <NavBar>
        <Icons />
      </NavBar>
      <div className="profile-container">
        <div className="profile-wrapper">
          <div className="info-wrapper">
            <h2>My Profile</h2>
            <p>
              <strong>Name:</strong> {user.name}
            </p>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <p>
              <strong>Phone Number:</strong> {user.phone}
            </p>
            <p>
              <strong>Address:</strong> {user.address || "Not provided"}
            </p>
          </div>

          <div className="form-wrapper">
            <h2>Update Information</h2>
            <p>Make changes to your profile below:</p>
            <form onSubmit={(e) => e.preventDefault()}>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Name"
                required
              />
              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                required
              />
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone Number"
                required
              />
              <input
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Address"
              />
              <button className="save-btn" onClick={handleUpdate}>
                Save Changes
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
