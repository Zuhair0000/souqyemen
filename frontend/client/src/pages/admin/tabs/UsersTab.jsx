import React, { useEffect, useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { Search, ShieldAlert, User, Mail, Phone } from "lucide-react";

export default function UsersTab() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const { t } = useTranslation();

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:3001/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users", err);
    }
  };

  const banUser = async (id) => {
    if (window.confirm(t("Are you sure you want to ban this user?"))) {
      try {
        const token = localStorage.getItem("token");
        await axios.put(
          `http://localhost:3001/api/admin/users/${id}/ban`,
          {},
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setUsers((prev) => prev.filter((u) => u.id !== id));
      } catch (err) {
        console.error("Error banning user", err);
      }
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) =>
    user.name?.toLowerCase().includes(search.toLowerCase()),
  );

  const getRoleBadge = (role) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-700";
      case "seller":
        return "bg-amber-100 text-amber-700";
      default:
        return "bg-blue-100 text-blue-700";
    }
  };

  return (
    <div className="space-y-6">
      <div className="relative w-full max-w-md mx-auto shadow-sm">
        <div className="absolute inset-y-0 start-0 pl-4 flex items-center pointer-events-none text-gray-400">
          <Search size={20} />
        </div>
        <input
          type="text"
          placeholder={t("Search users by name...")}
          className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#a22f29] focus:outline-none transition-all text-gray-700 font-medium"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredUsers.length === 0 ? (
          <p className="text-center text-gray-500 py-10 font-bold">
            {t("No users found.")}
          </p>
        ) : (
          filteredUsers.map((user) => (
            <div
              key={user.id}
              className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all hover:shadow-md"
            >
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="text-lg font-black text-gray-900">
                    {user.name}
                  </h4>
                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${getRoleBadge(user.role)}`}
                  >
                    {t(user.role)}
                  </span>
                </div>
                <div className="flex flex-wrap gap-4 text-sm font-medium text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <Mail size={14} /> {user.email}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Phone size={14} /> {user.phone || "---"}
                  </span>
                </div>
              </div>

              {user.role !== "admin" && (
                <button
                  onClick={() => banUser(user.id)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-red-50 text-red-600 px-4 py-2.5 rounded-lg font-bold hover:bg-red-600 hover:text-white transition-colors"
                >
                  <ShieldAlert size={16} /> {t("Ban")}
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
