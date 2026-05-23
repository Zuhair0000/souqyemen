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
  Eye,
  X,
  Users,
  Store,
  Truck,
  User,
} from "lucide-react";

export default function UsersTab() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const { t } = useTranslation();

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("https://souqyemen.store/api/admin/users", {
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
          ? `https://souqyemen.store/api/admin/users/${id}/unban`
          : `https://souqyemen.store/api/admin/users/${id}/ban`;

        await axios.put(
          endpoint,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

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

  const roleTabs = [
    { key: "all", label: t("All"), icon: Users },
    { key: "customer", label: t("Customer"), icon: User },
    { key: "seller", label: t("Seller"), icon: Store },
    { key: "delivery", label: t("Delivery"), icon: Truck },
  ];

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.name
      ?.toLowerCase()
      .includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role) => {
    switch (role) {
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
      {/* SEARCH */}
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

      {/* ROLE FILTER TABS */}
      <div className="flex items-center gap-2 flex-wrap">
        {roleTabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setRoleFilter(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              roleFilter === key
                ? "bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-md"
                : "bg-white border border-gray-200 text-gray-600 hover:border-rose-300 hover:text-rose-600"
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* USER LIST */}
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
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
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

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {/* EYE BUTTON — sellers and delivery only */}
                  {(user.role === "seller" || user.role === "delivery") && (
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-bold bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 transition-colors"
                    >
                      <Eye size={16} /> {t("View")}
                    </button>
                  )}

                  {/* BAN / UNBAN */}
                  {user.role !== "admin" && (
                    <button
                      onClick={() => toggleBanStatus(user.id, user.status)}
                      className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-bold transition-colors ${
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
              </div>
            );
          })
        )}
      </div>

      {/* VERIFICATION MODAL */}
      {selectedUser && (
        <>
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setSelectedUser(null)}
          >
            <div
              className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg p-8 relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close */}
              <button
                onClick={() => setSelectedUser(null)}
                className="absolute top-5 right-5 w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <X size={18} className="text-gray-600" />
              </button>

              {/* Header */}
              <div className="mb-6">
                <h3 className="text-2xl font-black text-gray-900">
                  {selectedUser.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${getRoleBadge(selectedUser.role)}`}
                  >
                    {t(selectedUser.role)}
                  </span>
                  {selectedUser.status === "banned" && (
                    <span className="flex items-center gap-1 bg-red-100 text-red-700 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">
                      <Ban size={12} /> {t("Banned")}
                    </span>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-4 py-2.5 rounded-xl">
                  <span className="font-bold text-gray-400 w-16">
                    {t("ID")}
                  </span>
                  <span className="font-bold text-gray-800">
                    #{selectedUser.id}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-4 py-2.5 rounded-xl">
                  <Mail size={14} className="text-gray-400 shrink-0" />
                  <span className="font-bold text-gray-800 truncate">
                    {selectedUser.email}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-4 py-2.5 rounded-xl">
                  <Phone size={14} className="text-gray-400 shrink-0" />
                  <span className="font-bold text-gray-800">
                    {selectedUser.phone || "---"}
                  </span>
                </div>
              </div>

              {/* Photos */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    {t("ID Photo")}
                  </p>
                  {selectedUser.id_photo ? (
                    <img
                      src={`https://souqyemen.store/uploads/${selectedUser.id_photo}`}
                      alt="ID"
                      onError={(e) => {
                        e.target.onerror = null;
                      }}
                      className="w-full aspect-video object-cover rounded-2xl border border-gray-200"
                    />
                  ) : (
                    <div className="w-full aspect-video rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 text-xs font-bold">
                      {t("Not uploaded")}
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    {t("Selfie with ID")}
                  </p>
                  {selectedUser.selfie_with_id ? (
                    <img
                      src={`https://souqyemen.store/uploads/${selectedUser.selfie_with_id}`}
                      alt="Selfie with ID"
                      onError={(e) => {
                        e.target.onerror = null;
                      }}
                      className="w-full aspect-video object-cover rounded-2xl border border-gray-200"
                    />
                  ) : (
                    <div className="w-full aspect-video rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 text-xs font-bold">
                      {t("Not uploaded")}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
