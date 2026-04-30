import { useEffect, useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { User, Mail, Phone, MapPin, Edit3 } from "lucide-react";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const token = localStorage.getItem("token");
  const { t } = useTranslation();

  useEffect(() => {
    axios
      .get("https://souqyemen.store/api/user/profile", {
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

        // Sync local storage initially if it's missing data
        const localUser = JSON.parse(localStorage.getItem("user"));
        if (localUser) {
          localStorage.setItem(
            "user",
            JSON.stringify({ ...localUser, ...res.data }),
          );
        }
      })
      .catch((err) => console.error(err));
  }, [token]);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleUpdate = (e) => {
    e.preventDefault();
    axios
      .put("https://souqyemen.store/api/user/profile", formData, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        // --- NEW: UPDATE LOCAL STORAGE SYNC ---
        const currentUser = JSON.parse(localStorage.getItem("user"));
        const updatedUser = {
          ...currentUser,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
        };

        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser); // Update local state UI

        alert(t("Profile updated successfully!"));
      })
      .catch((err) => {
        console.error(err);
        alert(t("Failed to update profile"));
      });
  };

  if (!user)
    return (
      <div className="min-h-screen flex items-center justify-center text-xl text-gray-500 animate-pulse">
        {t("Loading")}...
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-[#f4f1eb] py-12">
      <div className="max-w-[1000px] mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left: ID Card */}
          <div className="md:w-1/3">
            <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-gray-100 text-center relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-r from-rose-500 to-orange-500"></div>
              <div className="relative w-32 h-32 mx-auto bg-white rounded-full p-2 mt-6 shadow-md mb-4">
                <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                  <User size={64} />
                </div>
              </div>
              <h2 className="text-2xl font-black text-gray-800">{user.name}</h2>
              <p className="text-rose-500 font-bold text-sm uppercase tracking-widest mb-6">
                {t("Customer")}
              </p>

              <div className="space-y-4 text-start text-sm bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-3 text-gray-600">
                  <Mail size={16} className="text-rose-400" />{" "}
                  <span className="truncate">{user.email}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Phone size={16} className="text-rose-400" />{" "}
                  <span>{user.phone || "---"}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <MapPin size={16} className="text-rose-400" />{" "}
                  <span className="leading-tight">
                    {user.address || t("Address not provided")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Edit Form */}
          <div className="md:w-2/3">
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 h-full">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-500 flex items-center justify-center">
                  <Edit3 size={20} />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {t("Update Information")}
                </h2>
              </div>

              <form onSubmit={handleUpdate} className="space-y-5 text-start">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-600 mb-2">
                      {t("Name")}
                    </label>
                    <input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-rose-500 focus:bg-white transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-600 mb-2">
                      {t("Phone Number")}
                    </label>
                    <input
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-rose-500 focus:bg-white transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-2">
                    {t("Email")}
                  </label>
                  <input
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-rose-500 focus:bg-white transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-2">
                    {t("Address")}
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder={t("Enter your full delivery address...")}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-rose-500 focus:bg-white transition-colors h-24 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-gray-900 to-gray-800 text-white py-4 rounded-xl font-bold shadow-md hover:shadow-xl hover:-translate-y-1 transition-all mt-4"
                >
                  {t("Save Changes")}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
