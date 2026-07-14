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
  Download,
  ZoomIn,
} from "lucide-react";
import { API_URL } from "../../../config";

export default function UsersTab() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [lightboxPhoto, setLightboxPhoto] = useState(null);
  const [zoom, setZoom] = useState(1);
  const { t } = useTranslation();

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/api/admin/users`, {
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
          ? `${API_URL}/api/admin/users/${id}/unban`
          : `${API_URL}/api/admin/users/${id}/ban`;

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

  const photoUrl = (filename) => `${API_URL}/uploads/${filename}`;

  const handleDownload = async (filename) => {
    try {
      const response = await fetch(photoUrl(filename));
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed", err);
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
                  {(user.role === "seller" || user.role === "delivery") && (
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-bold bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 transition-colors"
                    >
                      <Eye size={16} /> {t("View")}
                    </button>
                  )}
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
                <span className="font-bold text-gray-400 w-16">{t("ID")}</span>
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
              {/* ID Photo */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  {t("ID Photo")}
                </p>
                {selectedUser.id_photo ? (
                  <button
                    onClick={() => {
                      setLightboxPhoto(selectedUser.id_photo);
                      setZoom(1);
                    }}
                    className="w-full relative group rounded-2xl overflow-hidden border border-gray-200 cursor-zoom-in"
                  >
                    <img
                      src={photoUrl(selectedUser.id_photo)}
                      alt="ID"
                      onError={(e) => {
                        e.target.onerror = null;
                      }}
                      className="w-full aspect-video object-cover transition-opacity duration-200 group-hover:opacity-60"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <ZoomIn size={28} className="text-gray-900" />
                    </div>
                  </button>
                ) : (
                  <div className="w-full aspect-video rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 text-xs font-bold">
                    {t("Not uploaded")}
                  </div>
                )}
              </div>

              {/* Selfie with ID */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  {t("Selfie with ID")}
                </p>
                {selectedUser.selfie_with_id ? (
                  <button
                    onClick={() => {
                      setLightboxPhoto(selectedUser.selfie_with_id);
                      setZoom(1);
                    }}
                    className="w-full relative group rounded-2xl overflow-hidden border border-gray-200 cursor-zoom-in"
                  >
                    <img
                      src={photoUrl(selectedUser.selfie_with_id)}
                      alt="Selfie with ID"
                      onError={(e) => {
                        e.target.onerror = null;
                      }}
                      className="w-full aspect-video object-cover transition-opacity duration-200 group-hover:opacity-60"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <ZoomIn size={28} className="text-gray-900" />
                    </div>
                  </button>
                ) : (
                  <div className="w-full aspect-video rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 text-xs font-bold">
                    {t("Not uploaded")}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LIGHTBOX */}
      {/* LIGHTBOX */}
      {lightboxPhoto && (
        <div
          className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          onClick={() => {
            setLightboxPhoto(null);
            setZoom(1);
          }}
        >
          {/* Top bar */}
          <div
            className="flex items-center justify-between w-full max-w-8xl mb-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Zoom controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  setZoom((z) => Math.max(1, parseFloat((z - 0.25).toFixed(2))))
                }
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-lg transition-colors"
              >
                −
              </button>
              <span className="text-white text-sm font-bold w-12 text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() =>
                  setZoom((z) => Math.min(4, parseFloat((z + 0.25).toFixed(2))))
                }
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-lg transition-colors"
              >
                +
              </button>
              <button
                onClick={() => setZoom(1)}
                className="text-white/60 hover:text-white text-xs font-bold px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition-colors ml-1"
              >
                {t("Reset")}
              </button>
            </div>

            {/* Download + Close */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDownload(lightboxPhoto)}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-colors"
              >
                <Download size={16} /> {t("Download")}
              </button>
              <button
                onClick={() => {
                  setLightboxPhoto(null);
                  setZoom(1);
                }}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
              >
                <X size={18} className="text-white" />
              </button>
            </div>
          </div>

          {/* Image */}
          <div
            className="overflow-auto max-w-8xl w-full max-h-[100vh] flex items-center justify-center rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={photoUrl(lightboxPhoto)}
              alt="Full view"
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: "center center",
                transition: "transform 0.2s ease",
              }}
              className="max-w-full max-h-[100vh] object-contain rounded-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
