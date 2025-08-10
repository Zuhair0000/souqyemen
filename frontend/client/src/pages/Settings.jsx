// pages/customer/SettingsPage.jsx
import { useState } from "react";
import axios from "axios";

export default function SettingsPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const token = localStorage.getItem("token");

  const handleChangePassword = () => {
    axios
      .put(
        "http://localhost:3001/api/user/change-password",
        {
          currentPassword,
          newPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then(() => alert("Password changed successfully"))
      .catch((err) => alert(err.response?.data?.message || "Error"));
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Settings</h1>
      <input
        type="password"
        placeholder="Current Password"
        className="input"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
      />
      <input
        type="password"
        placeholder="New Password"
        className="input"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />
      <button className="btn btn-primary mt-2" onClick={handleChangePassword}>
        Change Password
      </button>
    </div>
  );
}
