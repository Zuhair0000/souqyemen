import { useEffect, useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  MapPin,
} from "lucide-react";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const token = localStorage.getItem("token");
  const { t } = useTranslation();

  const fetchOrders = () => {
    axios
      .get("http://localhost:3001/api/user/orders", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setOrders([...res.data].sort((a, b) => b.id - a.id)))
      .catch((err) => console.error("Failed to fetch orders:", err));
  };

  useEffect(() => {
    fetchOrders();
  }, [token]);

  // Handle the customer confirming they received the package
  const handleConfirmReceipt = async (orderId) => {
    if (
      window.confirm(
        t("Are you sure you want to confirm receipt of this order?"),
      )
    ) {
      try {
        await axios.put(
          `http://localhost:3001/api/orders/user/orders/${orderId}/complete`,
          {},
          { headers: { Authorization: `Bearer ${token}` } },
        );
        alert(t("Thank you! Order marked as completed."));
        fetchOrders(); // Refresh the list to show the new 'completed' status
      } catch (err) {
        console.error("Error confirming receipt:", err);
        alert(t("Failed to confirm receipt."));
      }
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case "completed":
        return {
          color: "text-green-600",
          bg: "bg-green-100",
          icon: <CheckCircle size={16} />,
        };
      case "delivered":
        return {
          color: "text-teal-600",
          bg: "bg-teal-100",
          icon: <CheckCircle size={16} />,
        };
      case "shipped":
      case "out_for_delivery":
        return {
          color: "text-indigo-600",
          bg: "bg-indigo-100",
          icon: <Truck size={16} />,
        };
      case "cancelled":
        return {
          color: "text-red-600",
          bg: "bg-red-100",
          icon: <XCircle size={16} />,
        };
      default:
        return {
          color: "text-yellow-600",
          bg: "bg-yellow-100",
          icon: <Clock size={16} />,
        };
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f1eb] py-10">
      <div className="max-w-[900px] mx-auto px-4">
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-rose-500 shadow-sm">
            <Package size={24} />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-800">
            {t("My Orders")}
          </h1>
        </div>

        {orders.length === 0 ? (
          <div className="text-center bg-white p-12 rounded-[2rem] shadow-sm border border-gray-100">
            <Package size={64} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">
              {t("You haven't placed any orders yet.")}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order, idx) => {
              const statusCfg = getStatusConfig(order.status);

              // Check if order is in a shipped/delivered state
              const isShipped = [
                "shipped",
                "out_for_delivery",
                "delivered",
                "completed",
              ].includes(order.status);

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-[1.5rem] p-6 md:p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow animate-[fadeSlideUp_0.4s_ease_forwards]"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-dashed border-gray-200 pb-4 mb-4 gap-4">
                    <div>
                      <span className="text-sm text-gray-500 uppercase tracking-wider">
                        {t("Order")}
                      </span>
                      <h3 className="text-xl font-black text-gray-800">
                        #{order.id}
                      </h3>
                    </div>
                    <div
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-bold text-sm ${statusCfg.bg} ${statusCfg.color}`}
                    >
                      {statusCfg.icon}
                      <span className="capitalize">{t(order.status)}</span>
                    </div>
                  </div>

                  {/* Shipping Company Details */}
                  {isShipped && order.delivery_company_name && (
                    <div className="flex items-center gap-2 mb-5 px-4 py-2.5 bg-indigo-50 border border-indigo-100 rounded-xl w-max">
                      <Truck size={18} className="text-indigo-500" />
                      <span className="text-sm text-indigo-900 font-medium">
                        {t("Handled by")}:{" "}
                        <span className="font-bold">
                          {order.delivery_company_name}
                        </span>
                      </span>
                    </div>
                  )}

                  {/* Items List */}
                  <ul className="space-y-3 mb-6">
                    {order.items.map((item, i) => (
                      <li
                        key={i}
                        className="flex justify-between items-center text-gray-600 bg-gray-50 p-3 rounded-xl"
                      >
                        <span className="font-medium">
                          <span className="text-rose-500 font-bold me-2">
                            {item.quantity}x
                          </span>{" "}
                          {item.name}
                        </span>
                        <span className="font-bold text-gray-800">
                          ${Number(item.price || 0).toFixed(2)}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Live Tracking Timeline */}
                  {order.tracking && order.tracking.length > 0 && (
                    <div className="bg-gray-50 rounded-xl p-5 mb-6 border border-gray-100">
                      <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <MapPin size={16} /> {t("Live Tracking")}
                      </h4>
                      <div className="space-y-4 pl-3 border-l-2 border-indigo-200">
                        {order.tracking.map((track, i) => (
                          <div key={i} className="relative pl-6">
                            <div
                              className={`absolute -left-[23px] top-1 w-4 h-4 rounded-full border-4 border-gray-50 ${i === order.tracking.length - 1 ? "bg-indigo-500" : "bg-gray-300"}`}
                            ></div>

                            <p
                              className={`text-sm font-bold ${i === order.tracking.length - 1 ? "text-indigo-700" : "text-gray-600"}`}
                            >
                              {track.update_text}
                            </p>

                            <p className="text-xs font-medium text-gray-400 mt-0.5">
                              {new Date(track.created_at).toLocaleString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Order Total & Confirm Receipt Button */}
                  <div className="flex justify-between items-end pt-4 border-t border-gray-100 mt-auto">
                    <div className="flex flex-col">
                      <span className="text-gray-500 font-medium">
                        {t("Order Total")}
                      </span>
                      <span className="text-2xl font-black text-rose-600">
                        ${Number(order.total).toFixed(2)}
                      </span>
                    </div>

                    {/* Show Confirm Receipt only if Delivered */}
                    {order.status === "delivered" && (
                      <button
                        onClick={() => handleConfirmReceipt(order.id)}
                        className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95"
                      >
                        <CheckCircle size={18} /> {t("Confirm Receipt")}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
