import React, { useState } from "react";
import PendingSellers from "./tabs/PendingSellers";
import UsersTab from "./tabs/UsersTab";
import ProductsTab from "./tabs/ProductsTab";
import OrdersTab from "./tabs/OrdersTab";
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
          className="ml-auto bg-[#a22f29] text-white px-4 py-2 rounded-lg font-bold cursor-pointer transition-colors duration-300 hover:bg-[#76201b]"
        >
          Logout
        </button>
      </NavBar>
      <div className="max-w-3xl mx-auto my-10 p-6 bg-[#f4f1eb] rounded-lg border border-gray-300 shadow-md font-sans">
        <h2 className="text-xl mb-6 text-center text-gray-800 font-semibold">
          Admin Dashboard
        </h2>
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {[
            { key: "pending", label: "Pending Sellers" },
            { key: "users", label: "Users" },
            { key: "products", label: "Products" },
            { key: "orders", label: "Orders" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`bg-[#a22f29] text-white px-5 py-2 rounded-lg font-bold cursor-pointer transition-colors duration-300 hover:bg-[#76201b] ${
                activeTab === key ? "bg-[#76201b]" : ""
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="py-4">{renderTab()}</div>
      </div>
    </>
  );
}
