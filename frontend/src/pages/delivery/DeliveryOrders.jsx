import React, { useState, useEffect } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import {
  Truck,
  MapPin,
  CheckCircle,
  Package,
  FileText,
  Download,
  Search,
  Filter,
  User,
  Banknote,
  CreditCard,
} from "lucide-react";
import jsPDF from "jspdf";
import DeliveryNavBar from "../../components/DeliveryNavBar";

export default function DeliveryOrders() {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState("active");

  const [activeOrders, setActiveOrders] = useState([]);
  const [updateText, setUpdateText] = useState("");
  const [editingOrder, setEditingOrder] = useState(null);
  const [activeSearchQuery, setActiveSearchQuery] = useState("");
  const [activeStatusFilter, setActiveStatusFilter] = useState("all");

  const [historyOrders, setHistoryOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [historyStatusFilter, setHistoryStatusFilter] = useState("all");

  useEffect(() => {
    document.dir = i18n.language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = i18n.language || "en";
  }, [i18n.language]);

  const fetchActiveOrders = async () => {
    try {
      const res = await axios.get(
        "https://souqyemen.store/api/delivery/orders",
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      setActiveOrders(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchHistoryOrders = async () => {
    try {
      const res = await axios.get(
        "https://souqyemen.store/api/delivery/history",
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      setHistoryOrders(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeTab === "active") fetchActiveOrders();
    else fetchHistoryOrders();
  }, [activeTab]);

  const handleAddUpdate = async (orderId) => {
    if (!updateText.trim()) return;
    try {
      await axios.post(
        `https://souqyemen.store/api/delivery/orders/${orderId}/tracking`,
        { update_text: updateText },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      setUpdateText("");
      setEditingOrder(null);
      fetchActiveOrders();
    } catch (error) {
      alert(t("Failed to update tracking"));
    }
  };

  const handleMarkDelivered = async (orderId) => {
    if (window.confirm(t("Confirm package has been delivered?"))) {
      try {
        await axios.put(
          `https://souqyemen.store/api/delivery/orders/${orderId}/deliver`,
          {},
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );
        fetchActiveOrders();
        fetchHistoryOrders();
      } catch (error) {
        alert(t("Failed to mark as delivered"));
      }
    }
  };

  // ==========================================
  // UPDATED PDF GENERATOR (With Payment & Location)
  // ==========================================
  const generatePDFReport = () => {
    if (historyOrders.length === 0)
      return alert(t("No data to generate report."));

    const pdf = new jsPDF("l", "mm", "a4"); // Use landscape for more columns
    const pageWidth = pdf.internal.pageSize.getWidth();

    pdf.setFillColor(162, 47, 41);
    pdf.rect(0, 0, pageWidth, 45, "F");

    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(24);
    pdf.text("SOUQ YEMEN", pageWidth / 2, 22, { align: "center" });

    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    pdf.text("Official Logistics & COD Settlement Report", pageWidth / 2, 32, {
      align: "center",
    });

    let y = 60;
    pdf.setTextColor(100, 100, 100);
    pdf.setFontSize(10);
    pdf.text(`Date Generated: ${new Date().toLocaleString()}`, 14, y);

    // Calculate COD Totals
    const codOrders = historyOrders.filter(
      (o) =>
        o.payment_method === "Cash" &&
        (o.status === "delivered" || o.status === "completed"),
    );
    const totalCodAmount = codOrders.reduce(
      (sum, o) => sum + Number(o.total),
      0,
    );

    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(162, 47, 41);
    pdf.text(
      `TOTAL COD TO REMIT: $${totalCodAmount.toFixed(2)}`,
      pageWidth - 80,
      y,
    );

    y += 15;
    pdf.setDrawColor(220, 220, 220);
    pdf.line(14, y, pageWidth - 14, y);

    y += 10;
    pdf.setFontSize(10);
    pdf.setTextColor(150, 150, 150);
    pdf.text("ID", 14, y);
    pdf.text("Date", 30, y);
    pdf.text("Customer & Phone", 60, y);
    pdf.text("Location", 110, y);
    pdf.text("Method", 180, y);
    pdf.text("Total", 210, y);
    pdf.text("Status", 245, y);

    y += 5;
    pdf.line(14, y, pageWidth - 14, y);
    y += 8;

    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(50, 50, 50);

    historyOrders.forEach((order, index) => {
      if (y > 180) {
        pdf.addPage("l");
        y = 20;
      }
      if (index % 2 === 0) {
        pdf.setFillColor(245, 245, 245);
        pdf.rect(14, y - 5, pageWidth - 28, 8, "F");
      }

      pdf.text(`#${order.id}`, 14, y);
      pdf.text(`${new Date(order.created_at).toLocaleDateString()}`, 30, y);
      pdf.text(`${order.customer_name} (${order.customer_phone})`, 60, y);

      // Handle long addresses
      const addr = order.customer_location || "N/A";
      pdf.text(addr.length > 35 ? addr.substring(0, 32) + "..." : addr, 110, y);

      pdf.text(order.payment_method || "N/A", 180, y);
      pdf.text(`$${Number(order.total).toFixed(2)}`, 210, y);

      pdf.setFont("helvetica", "bold");
      if (order.status === "delivered" || order.status === "completed")
        pdf.setTextColor(22, 163, 74);
      else if (order.status === "cancelled") pdf.setTextColor(220, 38, 38);
      else pdf.setTextColor(79, 70, 229);

      pdf.text(order.status.toUpperCase(), 245, y);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(50, 50, 50);
      y += 8;
    });

    pdf.save("SouqYemen_Logistics_Report.pdf");
  };

  const filteredHistory = historyOrders.filter((order) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      order.id.toString().includes(searchLower) ||
      (order.customer_name &&
        order.customer_name.toLowerCase().includes(searchLower)) ||
      (order.customer_phone && order.customer_phone.includes(searchLower));
    const matchesStatus =
      historyStatusFilter === "all" || order.status === historyStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredActiveOrders = activeOrders.filter((order) => {
    if (order.status === "delivered" || order.status === "completed")
      return false;
    const searchLower = activeSearchQuery.toLowerCase();
    const matchesSearch =
      order.id.toString().includes(searchLower) ||
      (order.customer_name &&
        order.customer_name.toLowerCase().includes(searchLower)) ||
      (order.customer_phone && order.customer_phone.includes(searchLower));
    const matchesStatus =
      activeStatusFilter === "all" || order.status === activeStatusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#fdfbf7] flex flex-col">
      <DeliveryNavBar />

      <div className="flex-1 max-w-[1200px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 mt-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-indigo-600 text-white shadow-lg rounded-2xl flex items-center justify-center">
              <Truck size={28} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-gray-900">
                {t("Logistics Portal")}
              </h2>
              <p className="text-gray-500 font-medium mt-1">
                {t("Manage shipments and performance.")}
              </p>
            </div>
          </div>

          <div className="flex bg-white p-1.5 rounded-xl shadow-sm border border-gray-200 w-full md:w-auto">
            <button
              onClick={() => setActiveTab("active")}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${activeTab === "active" ? "bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100" : "text-gray-500 hover:bg-gray-50"}`}
            >
              <Truck size={18} /> {t("Active Shipments")}
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${activeTab === "history" ? "bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100" : "text-gray-500 hover:bg-gray-50"}`}
            >
              <FileText size={18} /> {t("History & Reports")}
            </button>
          </div>
        </div>

        {/* ACTIVE TAB (Previous Logic) */}
        {activeTab === "active" && (
          <div className="animate-[fadeSlideUp_0.3s_ease]">
            {/* ... Filter and Active mapping from previous version ... */}
            {activeOrders.length > 0 && (
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 start-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <Search size={18} />
                  </div>
                  <input
                    type="text"
                    placeholder={t("Search by Order ID, Name, or Phone...")}
                    className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none text-sm font-medium shadow-sm transition-all"
                    value={activeSearchQuery}
                    onChange={(e) => setActiveSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-xl shadow-sm border border-gray-200">
                  <Filter size={18} className="text-indigo-500" />
                  <select
                    className="bg-transparent font-bold text-gray-700 outline-none appearance-none cursor-pointer text-sm pr-2"
                    value={activeStatusFilter}
                    onChange={(e) => setActiveStatusFilter(e.target.value)}
                  >
                    <option value="all">{t("All Statuses")}</option>
                    <option value="shipped">{t("Shipped")}</option>
                    <option value="out_for_delivery">
                      {t("Out for Delivery")}
                    </option>
                  </select>
                </div>
              </div>
            )}

            {filteredActiveOrders.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-[2rem] border border-gray-100 shadow-sm flex flex-col items-center">
                <Package size={64} className="text-gray-300 mb-4" />
                <p className="text-2xl font-bold text-gray-600">
                  {t("No active shipments right now.")}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredActiveOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-gray-200 flex flex-col hover:border-indigo-200 hover:shadow-md transition-all"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start border-b border-gray-100 pb-4 mb-4 gap-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-black text-gray-900">
                          {t("Order")} #{order.id}
                        </h3>
                        <div className="mt-2 space-y-1">
                          <p className="text-gray-600 font-medium text-sm flex items-center gap-2">
                            <User size={14} className="text-gray-400" />{" "}
                            {order.customer_name} | {order.customer_phone}
                          </p>
                          <p className="text-indigo-600 font-bold text-sm flex items-center gap-2">
                            <MapPin size={14} />{" "}
                            {order.customer_location ||
                              t("Address not provided")}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
                        <span
                          className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${order.status === "out_for_delivery" ? "bg-amber-100 text-amber-700" : "bg-indigo-100 text-indigo-700"}`}
                        >
                          {t(order.status)}
                        </span>
                        {order.payment_method === "Cash" && (
                          <div className="bg-red-600 text-white px-3 py-1 rounded-md text-[10px] font-black animate-pulse flex items-center gap-1">
                            <Banknote size={12} /> {t("COLLECT CASH")}: $
                            {Number(order.total).toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>
                    {/* ... Tracking and Action buttons ... */}
                    {order.tracking && order.tracking.length > 0 && (
                      <div className="mb-6 space-y-3 pl-2 border-l-2 border-indigo-100 flex-1">
                        {order.tracking.map((track, i) => (
                          <div key={i} className="relative pl-6">
                            <div
                              className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full border-4 border-white ${i === order.tracking.length - 1 ? "bg-indigo-600" : "bg-gray-400"}`}
                            ></div>
                            <p className="text-sm font-bold text-gray-800">
                              {t(track.update_text)}
                            </p>
                            <p className="text-xs text-gray-400 font-medium">
                              {new Date(track.created_at).toLocaleString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100 mt-auto">
                      {editingOrder === order.id ? (
                        <div className="flex-1 flex gap-2">
                          <input
                            type="text"
                            placeholder={t("e.g. Arrived at Hub...")}
                            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 outline-none focus:border-indigo-500 font-medium text-sm text-gray-700"
                            value={updateText}
                            onChange={(e) => setUpdateText(e.target.value)}
                          />
                          <button
                            onClick={() => handleAddUpdate(order.id)}
                            className="bg-indigo-600 text-white px-5 py-2 rounded-xl font-bold text-sm hover:bg-indigo-700 shadow-sm"
                          >
                            {t("Save")}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setEditingOrder(order.id)}
                          className="flex-1 flex items-center justify-center gap-2 bg-gray-50 text-gray-700 py-3 rounded-xl text-sm font-bold hover:bg-gray-100 border border-gray-200 transition-colors"
                        >
                          <MapPin size={16} /> {t("Add Tracking Update")}
                        </button>
                      )}
                      <button
                        onClick={() => handleMarkDelivered(order.id)}
                        className="flex-1 flex items-center justify-center gap-2 bg-teal-50 text-teal-700 py-3 rounded-xl text-sm font-bold hover:bg-teal-600 hover:text-white transition-colors border border-teal-200"
                      >
                        <CheckCircle size={16} /> {t("Mark Delivered")}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* HISTORY TAB (Updated Table Columns) */}
        {activeTab === "history" && (
          <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-gray-200 shadow-sm animate-[fadeSlideUp_0.3s_ease]">
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 start-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <Search size={18} />
                </div>
                <input
                  type="text"
                  placeholder={t("Search by Order ID, Name, or Phone...")}
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none text-sm font-medium transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-3 bg-gray-50 px-4 py-3 rounded-xl border border-gray-200">
                <Filter size={18} className="text-indigo-500" />
                <select
                  className="bg-transparent font-bold text-gray-700 outline-none appearance-none cursor-pointer text-sm pr-2"
                  value={historyStatusFilter}
                  onChange={(e) => setHistoryStatusFilter(e.target.value)}
                >
                  <option value="all">{t("All Statuses")}</option>
                  <option value="completed">{t("Completed")}</option>
                  <option value="out_for_delivery">
                    {t("Out for Delivery")}
                  </option>
                </select>
              </div>

              <button
                onClick={generatePDFReport}
                className="flex items-center justify-center gap-2 bg-[#a22f29] text-white px-6 py-3 rounded-xl font-bold text-sm shadow-md hover:bg-[#832520] transition-colors md:w-auto w-full"
              >
                <Download size={18} /> {t("Download PDF Report")}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-start">
                <thead>
                  <tr className="bg-gray-50/50 border-y border-gray-100">
                    <th className="px-4 py-4 text-xs font-black text-gray-500 uppercase text-start">
                      {t("ID")}
                    </th>
                    <th className="px-4 py-4 text-xs font-black text-gray-500 uppercase text-start">
                      {t("Customer")}
                    </th>
                    <th className="px-4 py-4 text-xs font-black text-gray-500 uppercase text-start">
                      {t("Location")}
                    </th>
                    <th className="px-4 py-4 text-xs font-black text-gray-500 uppercase text-start">
                      {t("Method")}
                    </th>
                    <th className="px-4 py-4 text-xs font-black text-gray-500 uppercase text-start">
                      {t("Total")}
                    </th>
                    <th className="px-4 py-4 text-xs font-black text-gray-500 uppercase text-start">
                      {t("Status")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredHistory.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="text-center py-10 font-bold text-gray-400"
                      >
                        {t("No orders found in history.")}
                      </td>
                    </tr>
                  ) : (
                    filteredHistory.map((order) => (
                      <tr
                        key={order.id}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-4 py-5 font-black text-gray-900">
                          #{order.id}
                        </td>
                        <td className="px-4 py-5">
                          <div className="font-bold text-gray-800 text-sm">
                            {order.customer_name}
                          </div>
                          <div className="text-xs font-medium text-gray-500">
                            {order.customer_phone}
                          </div>
                        </td>
                        <td className="px-4 py-5">
                          <div className="text-xs text-gray-600 font-medium max-w-[150px] truncate">
                            {order.customer_location || t("N/A")}
                          </div>
                        </td>
                        <td className="px-4 py-5">
                          <div className="flex items-center gap-1 text-xs font-bold text-gray-700">
                            {order.payment_method === "Cash" ? (
                              <Banknote size={14} className="text-orange-500" />
                            ) : (
                              <CreditCard size={14} className="text-blue-500" />
                            )}
                            {t(order.payment_method)}
                          </div>
                        </td>
                        <td className="px-4 py-5 font-black text-sm text-gray-900">
                          ${Number(order.total).toFixed(2)}
                        </td>
                        <td className="px-4 py-5">
                          <span
                            className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider inline-block ${order.status === "completed" || order.status === "delivered" ? "bg-teal-100 text-teal-700" : "bg-indigo-100 text-indigo-700"}`}
                          >
                            {t(order.status)}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
