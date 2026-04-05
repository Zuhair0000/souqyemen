import React, { useState } from "react";
import PendingSellers from "./tabs/PendingSellers";
import UsersTab from "./tabs/UsersTab";
import ProductsTab from "./tabs/ProductsTab";
import OrdersTab from "./tabs/OrdersTab";
import AdminReportsTab from "./tabs/AdminReportsTab";
import NavBar from "../../components/NavBar";
import { useTranslation } from "react-i18next";
import {
  UserCheck,
  Users,
  Package,
  ShoppingCart,
  FileBarChart,
  LogOut,
} from "lucide-react";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("pending");
  const { t } = useTranslation();

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
      case "reports":
        return <AdminReportsTab />;
      default:
        return <PendingSellers />;
    }
  };

  const tabs = [
    { key: "pending", label: "Pending Sellers", icon: UserCheck },
    { key: "users", label: "Users", icon: Users },
    { key: "products", label: "Products", icon: Package },
    { key: "orders", label: "Orders", icon: ShoppingCart },
    { key: "reports", label: "Reports", icon: FileBarChart },
  ];

  return (
    <div className="min-h-screen bg-[#fdfbf7] flex flex-col">
      <NavBar>
        <button
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/login";
          }}
          className="ms-auto flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-gray-800 shadow-sm transition-colors"
        >
          <LogOut size={18} />
          {t("Logout")}
        </button>
      </NavBar>

      <div className="flex-1 w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center mb-8">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
            {t("Admin Dashboard")}
          </h2>
          <p className="text-gray-500 font-medium mt-2">
            {t("Platform management and oversight")}
          </p>
        </div>

        {/* Modern Tab Navigation */}
        <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-200 mb-8 overflow-x-auto scrollbar-hide">
          <div className="flex items-center min-w-max gap-2">
            {tabs.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all duration-200 ${
                  activeTab === key
                    ? "bg-[#a22f29] text-white shadow-md"
                    : "text-gray-600 hover:bg-[#f9eaea] hover:text-[#a22f29]"
                }`}
              >
                <Icon size={18} />
                {t(label)}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content Area */}
        <div className="bg-transparent">{renderTab()}</div>
      </div>
    </div>
  );
}
