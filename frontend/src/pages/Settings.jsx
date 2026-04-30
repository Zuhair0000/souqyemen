import { useState } from "react";
import axios from "axios";
import NavBar from "../components/NavBar";
import Icons from "../components/Icons";
import { useTranslation } from "react-i18next";
import { ShieldCheck, KeyRound } from "lucide-react";

export default function SettingsPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");
  const { t } = useTranslation();

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword)
      return alert(t("Please fill in both fields."));

    setLoading(true);
    axios
      .put(
        "https://souqyemen.store/api/user/change-password",
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-[#f4f1eb]">
      {/* <NavBar>
        <Icons />
      </NavBar> */}

      <div className="flex justify-center items-center py-20 px-4">
        <div className="w-full max-w-[450px] bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-xl border border-white p-8">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-rose-100 to-orange-100 text-rose-500 rounded-full flex items-center justify-center mb-4 shadow-sm">
              <ShieldCheck size={32} />
            </div>
            <h1 className="text-3xl font-black text-gray-800 tracking-tight">
              {t("Account Settings")}
            </h1>
            <p className="text-gray-500 mt-2">
              {t("Update your security preferences")}
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-2 px-1 text-start">
                {t("Current Password")}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <KeyRound size={18} />
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-400 focus:bg-white focus:outline-none transition-all text-start"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-600 mb-2 px-1 text-start">
                {t("New Password")}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <KeyRound size={18} />
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-400 focus:bg-white focus:outline-none transition-all text-start"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              onClick={handleChangePassword}
              disabled={loading}
              className="w-full bg-gradient-to-r from-gray-900 to-gray-800 text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all mt-4 disabled:opacity-50"
            >
              {loading ? t("Changing...") : t("Change Password")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
