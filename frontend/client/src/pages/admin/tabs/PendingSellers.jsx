import React, { useEffect, useState } from "react";
import "./PendingSellers.css";
import axios from "axios";
import SellerNavBar from "../../../components/SellerNavBar";
import NavBar from "../../../components/NavBar";

export default function PendingSellers() {
  const [sellers, setSellers] = useState([]);
  const [previewImage, setPreviewImage] = useState(null); // for modal

  useEffect(() => {
    fetchPendingSellers();
  }, []);

  const fetchPendingSellers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "http://localhost:3001/api/admin/pending-sellers",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
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
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSellers((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error("Error updating status", err);
    }
  };

  return (
    <>
      <div className="max-w-3xl mx-auto my-10 p-6 bg-white rounded-lg border border-gray-200 shadow-sm font-sans">
        <h2 className="text-xl mb-6 text-center text-gray-800">
          Pending Seller Approvals
        </h2>

        {sellers.length === 0 ? (
          <p className="text-center text-gray-600">No pending sellers</p>
        ) : (
          <div className="flex flex-col gap-5">
            {sellers.map((seller) => (
              <div
                key={seller.id}
                className="bg-white border border-gray-300 rounded-md p-4 shadow-sm"
              >
                <h3 className="text-lg text-gray-800 mb-1">
                  {seller.business_name}
                </h3>
                <p className="text-gray-700 text-sm my-1">
                  Owner: {seller.name}
                </p>
                <p className="text-gray-700 text-sm my-1">
                  Email: {seller.email}
                </p>
                <p className="text-gray-700 text-sm my-1">
                  Phone: {seller.phone}
                </p>

                <div className="flex flex-wrap gap-4 mt-3">
                  <div>
                    <strong className="block mb-1">ID Photo:</strong>
                    <img
                      src={`http://localhost:3001/uploads/${seller.id_photo}`}
                      alt="ID"
                      className="max-w-[140px] max-h-[140px] rounded-md border border-gray-300 object-cover bg-gray-100 cursor-pointer"
                      onClick={() =>
                        setPreviewImage(
                          `http://localhost:3001/uploads/${seller.id_photo}`
                        )
                      }
                    />
                  </div>

                  <div>
                    <strong className="block mb-1">Selfie with ID:</strong>
                    <img
                      src={`http://localhost:3001/uploads/${seller.selfie_with_id}`}
                      alt="Selfie"
                      className="max-w-[140px] max-h-[140px] rounded-md border border-gray-300 object-cover bg-gray-100 cursor-pointer"
                      onClick={() =>
                        setPreviewImage(
                          `http://localhost:3001/uploads/${seller.selfie_with_id}`
                        )
                      }
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-4 flex-wrap sm:flex-nowrap">
                  <button
                    onClick={() => updateStatus(seller.id, "approved")}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-md transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => updateStatus(seller.id, "rejected")}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-md transition-colors"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {previewImage && (
          <div
            className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 cursor-zoom-out"
            onClick={() => setPreviewImage(null)}
          >
            <div className="rounded-lg shadow-lg">
              <img
                src={previewImage}
                alt="Preview"
                className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-lg"
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
