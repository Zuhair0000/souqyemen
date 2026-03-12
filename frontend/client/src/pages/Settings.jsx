import { useState } from "react";
import axios from "axios";
import NavBar from "../components/NavBar";
import Icons from "../components/Icons";
import { useTranslation } from "react-i18next";

export default function SettingsPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");
  const { t } = useTranslation();

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword) {
      return alert(t("Please fill in both fields."));
    }

    setLoading(true);
    axios
      .put(
        "http://localhost:3001/api/user/change-password",
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } },
      )
      .then(() => {
        alert(t("✅ Password changed successfully"));
        setCurrentPassword("");
        setNewPassword("");
      })
      .catch((err) =>
        alert(err.response?.data?.message || t("Something went wrong")),
      )
      .finally(() => setLoading(false));
  };

  return (
    <>
      <NavBar>
        <Icons />
      </NavBar>

      <div className="flex justify-center items-center min-h-[80vh] bg-gray-50 px-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
          <h1 className="text-2xl font-bold text-center mb-6">
            {t("Account Settings")}
          </h1>

          {/* Current Password */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1 text-start">
              {t("Current Password")}
            </label>
            <input
              type="password"
              placeholder={t("Enter current password")}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-start"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>

          {/* New Password */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1 text-start">
              {t("New Password")}
            </label>
            <input
              type="password"
              placeholder={t("Enter new password")}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-start"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          {/* Button */}
          <button
            onClick={handleChangePassword}
            disabled={loading}
            className="w-full bg-red-900 text-white py-2 rounded-lg hover:bg-red-700 transition disabled:opacity-50"
          >
            {loading ? t("Changing...") : t("Change Password")}
          </button>
        </div>
      </div>
    </>
  );
}
