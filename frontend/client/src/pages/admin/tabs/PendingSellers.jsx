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
      <div className="pending-sellers-page">
        <h2>Pending Seller Approvals</h2>
        {sellers.length === 0 ? (
          <p>No pending sellers</p>
        ) : (
          <div className="seller-list">
            {sellers.map((seller) => (
              <div key={seller.id} className="seller-card">
                <h3>{seller.business_name}</h3>
                <p>Owner: {seller.name}</p>
                <p>Email: {seller.email}</p>
                <p>Phone: {seller.phone}</p>
                <div className="images">
                  <div>
                    <strong>ID Photo:</strong>
                    <br />
                    <img
                      src={`http://localhost:3001/uploads/${seller.id_photo}`}
                      alt="ID"
                      className="id-photo"
                      onClick={() =>
                        setPreviewImage(
                          `http://localhost:3001/uploads/${seller.id_photo}`
                        )
                      }
                    />
                  </div>
                  <div>
                    <strong>Selfie with ID:</strong>
                    <br />
                    <img
                      src={`http://localhost:3001/uploads/${seller.selfie_with_id}`}
                      alt="Selfie"
                      className="selfie-photo"
                      onClick={() =>
                        setPreviewImage(
                          `http://localhost:3001/uploads/${seller.selfie_with_id}`
                        )
                      }
                    />
                  </div>
                </div>
                <div className="buttons">
                  <button
                    onClick={() => updateStatus(seller.id, "approved")}
                    className="approve-btn"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => updateStatus(seller.id, "rejected")}
                    className="reject-btn"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal for Image Preview */}
        {previewImage && (
          <div className="image-modal" onClick={() => setPreviewImage(null)}>
            <div className="image-modal-content">
              <img src={previewImage} alt="Preview" />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
