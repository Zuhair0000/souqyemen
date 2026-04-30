import React, { useEffect, useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { Search, ShoppingBag, Hash } from "lucide-react";

export default function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const { t } = useTranslation();

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("https://souqyemen.store/api/admin/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data);
    } catch (err) {
      console.error("Error fetching orders", err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((order) =>
    order.id.toString().includes(search),
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-700";
      case "processing":
        return "bg-blue-100 text-blue-700";
      case "shipped":
        return "bg-purple-100 text-purple-700";
      case "completed":
        return "bg-green-100 text-green-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      <div className="relative w-full max-w-md mx-auto shadow-sm">
        <div className="absolute inset-y-0 start-0 pl-4 flex items-center pointer-events-none text-gray-400">
          <Search size={20} />
        </div>
        <input
          type="text"
          placeholder={t("Search by order number...")}
          className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#a22f29] focus:outline-none transition-all text-gray-700 font-medium"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredOrders.length === 0 ? (
          <p className="text-center text-gray-500 py-10 font-bold">
            {t("No matching orders.")}
          </p>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-center justify-between gap-4 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100 shrink-0">
                  <ShoppingBag size={20} />
                </div>
                <div>
                  <h4 className="text-lg font-black text-gray-900 flex items-center gap-1">
                    <Hash size={16} className="text-[#a22f29]" /> {order.id}
                  </h4>
                  <span className="text-sm font-medium text-gray-500">
                    {t("Customer ID")}: {order.customer_id}
                  </span>
                </div>
              </div>

              <span
                className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${getStatusBadge(order.status)}`}
              >
                {t(order.status)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
