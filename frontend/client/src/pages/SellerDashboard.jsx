import React, { useEffect, useState } from "react";
import SellerNavBar from "../components/SellerNavBar";
import axios from "axios";
import "./SellerDashboard.css"; // Make sure this matches new styles

export default function SellerDashboard() {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "http://localhost:3001/api/seller/dashboard",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setAnalytics(res.data);
      } catch (err) {
        console.error("Analytics Error:", err);
      }
    };

    fetchAnalytics();
  }, []);

  if (!analytics) return <p>Loading analytics...</p>;

  return (
    <>
      <SellerNavBar />
      <div className="seller-dashboard-container">
        <h2 className="dashboard-title">📊 Seller Dashboard</h2>

        {/* Total Sales Card */}
        <div className="dashboard-grid">
          <div className="dashboard-card total-sales">
            <h3>Total Sales</h3>
            <p className="metric">
              ${Number(analytics.totalSales || 0).toFixed(2)}
            </p>
          </div>

          {/* Best-Selling Products */}
          <div className="dashboard-card">
            <h3>Best-Selling Products</h3>
            <ul className="analytics-list">
              {analytics.bestSelling.map((product) => (
                <li key={product.name}>
                  <strong>{product.name}</strong> – {product.sold} sold
                </li>
              ))}
            </ul>
          </div>

          {/* Daily Sales */}
          <div className="dashboard-card">
            <h3>Daily Sales (Last 7 Days)</h3>
            <ul className="analytics-list">
              {analytics.dailySales.map((entry) => (
                <li key={entry.date}>
                  <strong>{entry.date}</strong>: $
                  {Number(entry.total).toFixed(2)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
