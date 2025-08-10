import React, { useState } from "react";
import PendingSellers from "./tabs/PendingSellers";
import UsersTab from "./tabs/UsersTab";
import ProductsTab from "./tabs/ProductsTab";
import OrdersTab from "./tabs/OrdersTab";
import "./AdminDashboard.css";
import NavBar from "../../components/NavBar";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("pending");

  const renderTab = () => {
    switch (activeTab) {
      case "pending":
        return <PendingSellers />;
      case "users":
        return <UsersTab />;
      case "products":
        return <ProductsTab />;
      case "orders":
        return <OrdersTab />;
      default:
        return <PendingSellers />;
    }
  };

  return (
    <>
      <NavBar>
        <button
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/login";
          }}
          className="logout-btn"
        >
          Logout
        </button>
      </NavBar>
      <div className="admin-dashboard">
        <h2 className="admin-title">Admin Dashboard</h2>
        <div className="admin-tabs">
          <button
            onClick={() => setActiveTab("pending")}
            className={activeTab === "pending" ? "active" : ""}
          >
            Pending Sellers
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={activeTab === "users" ? "active" : ""}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab("products")}
            className={activeTab === "products" ? "active" : ""}
          >
            Products
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={activeTab === "orders" ? "active" : ""}
          >
            Orders
          </button>
        </div>
        <div className="admin-content">{renderTab()}</div>
      </div>
    </>
  );
}
