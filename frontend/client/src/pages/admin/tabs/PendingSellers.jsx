import React, { useEffect, useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import {
  User,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  FileImage,
} from "lucide-react";

export default function PendingSellers() {
  const [sellers, setSellers] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const { t } = useTranslation();

  useEffect(() => {
    fetchPendingSellers();
  }, []);

  const fetchPendingSellers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "http://localhost:3001/api/admin/pending-sellers",
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setSellers(res.data);
    } catch (err) {
      console.error("Error fetching sellers", err);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:3001/api/admin/seller/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setSellers((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error("Error updating status", err);
    }
  };

  return (
    <div className="space-y-6">
      {sellers.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center border border-gray-200 shadow-sm">
          <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
          <h3 className="text-xl font-bold text-gray-800">
            {t("All caught up!")}
          </h3>
          <p className="text-gray-500 mt-2">
            {t("No pending sellers to review.")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sellers.map((seller) => (
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
                      setPreviewImage(
                        `http://localhost:3001/uploads/${seller.id_photo}`,
                      )
                    }
                  >
                    <img
                      src={`http://localhost:3001/uploads/${seller.id_photo}`}
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
                      setPreviewImage(
                        `http://localhost:3001/uploads/${seller.selfie_with_id}`,
                      )
                    }
                  >
                    <img
                      src={`http://localhost:3001/uploads/${seller.selfie_with_id}`}
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
