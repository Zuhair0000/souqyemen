import React, { useEffect, useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import {
  Search,
  ShieldAlert,
  ShieldCheck,
  Mail,
  Phone,
  Ban,
} from "lucide-react";

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

  const toggleBanStatus = async (id, currentStatus) => {
    const isBanned = currentStatus === "banned";
    const actionText = isBanned ? t("unban") : t("ban");

    if (
      window.confirm(t(`Are you sure you want to ${actionText} this user?`))
    ) {
      try {
        const token = localStorage.getItem("token");
        const endpoint = isBanned
          ? `http://localhost:3001/api/admin/users/${id}/unban`
          : `http://localhost:3001/api/admin/users/${id}/ban`;

        await axios.put(
          endpoint,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        // Optimistically update the UI without needing to refresh the page
        setUsers((prev) =>
          prev.map((u) =>
            u.id === id ? { ...u, status: isBanned ? "active" : "banned" } : u,
          ),
        );
      } catch (err) {
        console.error(`Error trying to ${actionText} user`, err);
        alert(t("Action failed."));
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
      case "delivery":
        return "bg-indigo-100 text-indigo-700";
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
          filteredUsers.map((user) => {
            const isBanned = user.status === "banned";

            return (
              <div
                key={user.id}
                className={`bg-white border rounded-xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all hover:shadow-md ${
                  isBanned
                    ? "border-red-200 bg-red-50/30 opacity-80"
                    : "border-gray-200"
                }`}
              >
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h4
                      className={`text-lg font-black ${isBanned ? "text-red-900 line-through decoration-red-300" : "text-gray-900"}`}
                    >
                      {user.name}
                    </h4>
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${getRoleBadge(user.role)}`}
                    >
                      {t(user.role)}
                    </span>

                    {/* BANNED BADGE */}
                    {isBanned && (
                      <span className="flex items-center gap-1 bg-red-100 text-red-700 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">
                        <Ban size={12} /> {t("Banned")}
                      </span>
                    )}
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
                    onClick={() => toggleBanStatus(user.id, user.status)}
                    className={`w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-bold transition-colors ${
                      isBanned
                        ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white"
                        : "bg-red-50 text-red-600 hover:bg-red-600 hover:text-white"
                    }`}
                  >
                    {isBanned ? (
                      <>
                        <ShieldCheck size={16} /> {t("Unban")}
                      </>
                    ) : (
                      <>
                        <ShieldAlert size={16} /> {t("Ban")}
                      </>
                    )}
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
