import React, { useEffect, useState } from "react";
import BackButton from "../../components/BackButton";
import { useTranslation } from "react-i18next";
import {
  PackageOpen,
  Filter,
  Truck,
  MapPin,
  User,
  CreditCard,
  Banknote,
  PackageCheck,
  ArrowUpDown, // <-- Added sort icon
} from "lucide-react";
import logo from "../../assets/Logo.jpeg";

export default function SellerOrders() {
  const [orders, setOrders] = useState([]);
  const [deliveryCompanies, setDeliveryCompanies] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");

  // NEW: State for tracking sort order (descending by default)
  const [sortOrder, setSortOrder] = useState("desc");

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState("");

  const [trackingModalOpen, setTrackingModalOpen] = useState(false);
  const [activeTrackingUpdates, setActiveTrackingUpdates] = useState([]);

  const { t, i18n } = useTranslation();

  useEffect(() => {
    document.dir = i18n.language === "ar" ? "rtl" : "ltr";
  }, [i18n.language]);

  const fetchOrders = () => {
    fetch("http://localhost:3001/api/seller/orders", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => setOrders(data.orders || data))
      .catch((err) => console.error("Error fetching orders", err));
  };

  useEffect(() => {
    fetchOrders();
    fetch("http://localhost:3001/api/seller/delivery-companies", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => setDeliveryCompanies(data))
      .catch((err) => console.error("Error fetching delivery companies", err));
  }, []);

  const getStatusStyle = (status) => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-700 border border-amber-200";
      case "processing":
        return "bg-blue-100 text-blue-700 border border-blue-200";
      case "shipped":
      case "out_for_delivery":
        return "bg-indigo-100 text-indigo-700 border border-indigo-200";
      case "delivered":
        return "bg-teal-100 text-teal-700 border border-teal-200";
      case "completed":
        return "bg-green-100 text-green-700 border border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-700 border border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border border-gray-200";
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    if (newStatus === "shipped") {
      setSelectedOrderId(orderId);
      setModalOpen(true);
      return;
    }
    updateStatusInBackend(orderId, newStatus);
  };

  const updateStatusInBackend = async (
    orderId,
    newStatus,
    companyId = null,
  ) => {
    try {
      const res = await fetch(
        `http://localhost:3001/api/seller/orders/${orderId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            status: newStatus,
            delivery_company_id: companyId,
          }),
        },
      );
      if (res.ok) {
        fetchOrders();
        setModalOpen(false);
        setSelectedCompanyId("");
      }
    } catch (err) {
      console.error("Error updating status", err);
    }
  };

  const confirmShipping = () => {
    if (!selectedCompanyId) return alert(t("Please select a delivery company"));
    updateStatusInBackend(selectedOrderId, "shipped", selectedCompanyId);
  };

  const viewTracking = async (orderId) => {
    try {
      const res = await fetch(
        `http://localhost:3001/api/seller/orders/${orderId}/tracking`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      const data = await res.json();
      setActiveTrackingUpdates(data);
      setTrackingModalOpen(true);
    } catch (error) {
      console.error("Error fetching tracking", error);
    }
  };

  // NEW: Filter AND Sort the orders
  const sortedAndFilteredOrders = orders
    .filter((order) =>
      statusFilter === "all" ? true : order.status === statusFilter,
    )
    .sort((a, b) => {
      // Sorting by order_id is the safest way to guarantee exact chronological order
      return sortOrder === "desc"
        ? b.order_id - a.order_id
        : a.order_id - b.order_id;
    });

  return (
    <div className="min-h-screen bg-[#fdfbf7] pb-20 py-8">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <BackButton />

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 mt-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white shadow-sm border border-gray-100 rounded-2xl flex items-center justify-center text-[#a22f29]">
              <PackageOpen size={28} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                {t("My Orders")}
              </h2>
              <p className="text-gray-500 font-medium mt-1">
                {t("Manage and fulfill customer purchases.")}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* SORT BUTTON */}
            <button
              onClick={() =>
                setSortOrder(sortOrder === "desc" ? "asc" : "desc")
              }
              className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl shadow-sm border border-gray-100 text-gray-700 font-bold hover:bg-gray-50 transition-colors active:scale-95"
            >
              <ArrowUpDown size={18} className="text-gray-400" />
              {sortOrder === "desc" ? t("Newest First") : t("Oldest First")}
            </button>

            {/* FILTER DROPDOWN */}
            <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl shadow-sm border border-gray-100">
              <div className="pl-2 text-gray-400">
                <Filter size={18} />
              </div>
              <select
                className="bg-transparent font-bold text-gray-700 outline-none pr-4 appearance-none cursor-pointer"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">{t("All Orders")}</option>
                <option value="pending">{t("Pending")}</option>
                <option value="processing">{t("Processing")}</option>
                <option value="shipped">{t("Shipped")}</option>
                <option value="completed">{t("Completed")}</option>
                <option value="cancelled">{t("Cancelled")}</option>
              </select>
            </div>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-[1.5rem] p-16 text-center shadow-sm border border-gray-100">
            <p className="text-xl font-bold text-gray-500">
              {t("No orders found.")}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedAndFilteredOrders.map((order) => {
              const isLocked = [
                "shipped",
                "out_for_delivery",
                "delivered",
                "completed",
              ].includes(order.status);

              return (
                <div
                  key={order.order_id}
                  className="bg-white rounded-[1.5rem] shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Top Row: General Order Info */}
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 bg-gray-50/50 border-b border-gray-100 gap-4">
                    <div className="flex items-center gap-6">
                      <div>
                        <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-1">
                          {t("Order ID")}
                        </p>
                        <p className="text-lg font-black text-gray-900">
                          #{order.order_id}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-1">
                          {t("Payment")}
                        </p>
                        <div
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold w-fit ${
                            order.payment_method === "Cash"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {order.payment_method === "Cash" ? (
                            <Banknote size={14} />
                          ) : (
                            <CreditCard size={14} />
                          )}
                          {t(order.payment_method || "Card")}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-1">
                          {t("Total")}
                        </p>
                        <p className="text-lg font-black text-green-600">
                          ${Number(order.total).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                      <div className="flex-1 md:flex-none text-end">
                        <span
                          className={`px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-wider inline-block ${getStatusStyle(order.status)}`}
                        >
                          {t(order.status)}
                        </span>
                      </div>

                      <div className="flex-1 md:flex-none">
                        {isLocked ? (
                          <button
                            onClick={() => viewTracking(order.order_id)}
                            className="w-full flex items-center justify-center gap-1.5 px-6 py-2.5 bg-indigo-50 text-indigo-700 font-bold text-sm rounded-xl hover:bg-indigo-100 border border-indigo-200 transition-colors"
                          >
                            <MapPin size={16} /> {t("View Tracking")}
                          </button>
                        ) : (
                          <select
                            className="w-full bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-xl px-4 py-2.5 outline-none focus:border-[#a22f29] focus:ring-2 focus:ring-[#a22f29]/20 transition-all cursor-pointer"
                            value={order.status}
                            onChange={(e) =>
                              handleStatusChange(order.order_id, e.target.value)
                            }
                          >
                            <option value="pending">{t("Pending")}</option>
                            <option value="processing">
                              {t("Processing")}
                            </option>
                            <option value="shipped">
                              {t("Ship (Assign Logistics)")}
                            </option>
                            <option value="cancelled">{t("Cancelled")}</option>
                          </select>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Row: Customer & Items */}
                  <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-gray-100">
                    {/* Customer Info Column */}
                    <div className="p-6 md:w-1/3 bg-white">
                      <h4 className="text-xs font-black text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <User size={14} /> {t("Customer Details")}
                      </h4>
                      <p className="text-lg font-bold text-gray-900 mb-1">
                        {order.customer?.name || "Unknown"}
                      </p>
                      <p className="flex items-start gap-1.5 text-sm font-medium text-gray-500 mt-2">
                        <MapPin
                          size={16}
                          className="text-[#a22f29] shrink-0 mt-0.5"
                        />
                        {order.customer?.location ||
                          t("No address provided by customer")}
                      </p>
                    </div>

                    {/* Items List Column */}
                    <div className="p-6 md:w-2/3 bg-gray-50/30">
                      <h4 className="text-xs font-black text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <PackageCheck size={16} /> {t("Items to Pack")}
                      </h4>
                      {order.items && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {order.items.map((item, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-4 bg-white p-3 rounded-xl border border-gray-100 shadow-sm"
                            >
                              <div className="w-16 h-16 rounded-lg bg-gray-50 overflow-hidden shrink-0 border border-gray-100 p-1">
                                <img
                                  src={
                                    item.image
                                      ? `http://localhost:3001${item.image}`
                                      : logo
                                  }
                                  alt={item.name}
                                  className="w-full h-full object-cover rounded-md"
                                  onError={(e) => {
                                    e.target.src = logo;
                                  }}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-gray-900 truncate">
                                  {item.name}
                                </p>
                                <div className="flex items-center gap-3 mt-1.5">
                                  <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                                    {t("Qty")}: {item.quantity}
                                  </span>
                                  <span className="text-xs font-black text-rose-600">
                                    ${Number(item.price).toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Assign Delivery Company */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl animate-[fadeSlideUp_0.3s_ease]">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Truck size={32} />
            </div>
            <h3 className="text-2xl font-black text-gray-900 text-center mb-2">
              {t("Assign Delivery Company")}
            </h3>
            <p className="text-sm text-gray-500 mb-6 text-center">
              {t("Please select a shipping company to handle order #")}
              {selectedOrderId}
            </p>

            <select
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 mb-6 font-bold text-gray-700 outline-none focus:border-[#a22f29]"
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
            >
              <option value="">{t("-- Select Company --")}</option>
              {deliveryCompanies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setModalOpen(false);
                  setSelectedCompanyId("");
                }}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
              >
                {t("Cancel")}
              </button>
              <button
                onClick={confirmShipping}
                disabled={!selectedCompanyId}
                className="flex-1 py-3 bg-[#a22f29] text-white rounded-xl font-bold hover:bg-[#76201b] transition-colors disabled:opacity-50"
              >
                {t("Confirm Shipment")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: View Live Tracking Timeline */}
      {trackingModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl animate-[fadeSlideUp_0.3s_ease]">
            <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
              <MapPin size={24} className="text-indigo-600" />{" "}
              {t("Live Tracking")}
            </h3>
            <div className="max-h-[300px] overflow-y-auto pr-2">
              {activeTrackingUpdates.length === 0 ? (
                <p className="text-gray-500 font-bold text-center py-6">
                  {t("No tracking updates yet.")}
                </p>
              ) : (
                <div className="space-y-5 pl-3 border-l-2 border-indigo-200">
                  {activeTrackingUpdates.map((track, i) => (
                    <div key={i} className="relative pl-6">
                      <div
                        className={`absolute -left-[25px] top-1 w-4 h-4 rounded-full border-4 border-white ${
                          i === activeTrackingUpdates.length - 1
                            ? "bg-indigo-600"
                            : "bg-gray-400"
                        }`}
                      ></div>
                      <p
                        className={`text-sm font-bold ${i === activeTrackingUpdates.length - 1 ? "text-indigo-800" : "text-gray-700"}`}
                      >
                        {t(track.update_text)}
                      </p>
                      <p className="text-xs text-gray-400 font-medium">
                        {new Date(track.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => setTrackingModalOpen(false)}
              className="w-full mt-8 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
            >
              {t("Close")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
