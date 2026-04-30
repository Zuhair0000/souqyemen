import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  User,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  FileImage,
} from "lucide-react";

// Centralize the backend URL so it only needs to be updated in one place
const API_BASE = "https://souqyemen.store";

export default function PendingPartners() {
  const [partners, setPartners] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const { t } = useTranslation();

  useEffect(() => {
    fetchPendingPartners();
  }, []);

  const fetchPendingPartners = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/admin/pending-partners`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error("Failed to load partners");

      const data = await res.json();
      setPartners(data);
    } catch (err) {
      console.error("Error fetching partners", err);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/admin/partner/${id}/status`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error("Failed to update status");

      setPartners((prev) => prev.filter((s) => s.id !== id));
      alert(t(`Partner successfully ${status}!`));
    } catch (err) {
      console.error("Error updating status", err);
      alert(t("Failed to update status"));
    }
  };

  // Helper function to safely construct image URLs
  const getImageUrl = (filename) => {
    if (!filename) return "";
    // Prevents double-slashing if your DB accidentally saved "uploads/image.jpg"
    const safePath = filename.startsWith("uploads/")
      ? filename
      : `uploads/${filename}`;
    return `${API_BASE}/${safePath}`;
  };

  return (
    <div className="space-y-6">
      {partners.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center border border-gray-200 shadow-sm">
          <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
          <h3 className="text-xl font-bold text-gray-800">
            {t("All caught up!")}
          </h3>
          <p className="text-gray-500 mt-2">
            {t("No pending partners to review.")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {partners.map((seller) => (
            <div
              key={seller.id}
              className="bg-white border border-gray-200 rounded-[1.5rem] p-6 shadow-sm flex flex-col"
            >
              <div className="border-b border-gray-100 pb-4 mb-4">
                <h3 className="text-2xl font-black text-gray-900 mb-3">
                  {seller.business_name}
                </h3>
                <div className="space-y-2 text-sm font-medium text-gray-600">
                  <p className="flex items-center gap-2">
                    <User size={16} className="text-[#a22f29]" /> {t("Owner")}:{" "}
                    {seller.name}
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail size={16} className="text-[#a22f29]" /> {t("Email")}:{" "}
                    {seller.email}
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone size={16} className="text-[#a22f29]" /> {t("Phone")}:{" "}
                    {seller.phone}
                  </p>
                </div>
              </div>

              {/* Documents Area */}
              <div className="flex gap-4 mb-6">
                <div className="flex-1">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">
                    <FileImage size={14} /> {t("ID Photo")}
                  </span>
                  <div
                    className="aspect-square bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl overflow-hidden cursor-zoom-in hover:border-[#a22f29] transition-colors"
                    onClick={() =>
                      setPreviewImage(getImageUrl(seller.id_photo))
                    }
                  >
                    <img
                      src={getImageUrl(seller.id_photo)}
                      alt="ID"
                      className="w-full h-full object-cover mix-blend-multiply p-1"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">
                    <FileImage size={14} /> {t("Selfie")}
                  </span>
                  <div
                    className="aspect-square bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl overflow-hidden cursor-zoom-in hover:border-[#a22f29] transition-colors"
                    onClick={() =>
                      setPreviewImage(getImageUrl(seller.selfie_with_id))
                    }
                  >
                    <img
                      src={getImageUrl(seller.selfie_with_id)}
                      alt="Selfie"
                      className="w-full h-full object-cover mix-blend-multiply p-1"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-auto pt-4 border-t border-gray-100">
                <button
                  onClick={() => updateStatus(seller.id, "approved")}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-50 text-green-700 py-3 rounded-xl font-bold hover:bg-green-600 hover:text-white transition-colors"
                >
                  <CheckCircle size={18} /> {t("Approve")}
                </button>
                <button
                  onClick={() => updateStatus(seller.id, "rejected")}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-700 py-3 rounded-xl font-bold hover:bg-red-600 hover:text-white transition-colors"
                >
                  <XCircle size={18} /> {t("Reject")}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm flex justify-center items-center z-50 cursor-zoom-out p-4"
          onClick={() => setPreviewImage(null)}
        >
          <img
            src={previewImage}
            alt="Preview"
            className="max-w-full max-h-[90vh] rounded-xl shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}
