import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  ShoppingCart,
  BarChart2,
  Package,
  AlertTriangle,
  Download,
} from "lucide-react";
import jsPDF from "jspdf";
import { useTranslation } from "react-i18next";

// Flat, Vibrant KPI Card
function KPI({ title, value, delta, icon: Icon, colorClass }) {
  return (
    <div className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClass}`}
        >
          <Icon size={24} />
        </div>
        {delta !== undefined && (
          <div
            className={`px-3 py-1 rounded-full text-sm font-bold ${
              delta >= 0
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {delta >= 0 ? "▲" : "▼"} {Math.abs(delta)}%
          </div>
        )}
      </div>
      <div className="text-gray-500 font-bold text-sm mb-1 uppercase tracking-wider">
        {title}
      </div>
      <div className="text-3xl font-black text-gray-900">{value}</div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="h-36 bg-white border border-gray-100 shadow-sm animate-pulse rounded-[1.5rem]" />
  );
}

// Charts
function SalesLineChart({ data }) {
  const { t } = useTranslation();
  return (
    <div className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-gray-100 h-[400px]">
      <h4 className="font-bold text-gray-800 mb-6 text-lg">
        {t("Revenue (Last 30 days)")}
      </h4>
      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={data}>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#f3f4f6"
          />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#9ca3af" }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#9ca3af" }}
            dx={-10}
          />
          <Tooltip
            contentStyle={{
              borderRadius: "1rem",
              border: "none",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#a22f29"
            strokeWidth={4}
            dot={false}
            activeDot={{ r: 8, fill: "#a22f29" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function DailyBarChart({ data }) {
  const { t } = useTranslation();
  return (
    <div className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-gray-100 h-[400px]">
      <h4 className="font-bold text-gray-800 mb-6 text-lg">
        {t("Daily Sales (Last 7 days)")}
      </h4>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={data}>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#f3f4f6"
          />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#9ca3af" }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#9ca3af" }}
            dx={-10}
          />
          <Tooltip
            cursor={{ fill: "#f3f4f6" }}
            contentStyle={{
              borderRadius: "1rem",
              border: "none",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
          />
          <Bar dataKey="total" fill="#d97706" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function BestSellingPie({ data }) {
  const { t } = useTranslation();
  const COLORS = ["#a22f29", "#d97706", "#f59e0b", "#10b981", "#6366f1"];
  const numericData = (data || []).map((item) => ({
    ...item,
    sold: Number(item.sold) || 0,
  }));

  return (
    <div className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-gray-100 h-[400px]">
      <h4 className="font-bold text-gray-800 mb-2 text-lg">
        {t("Best Selling Products")}
      </h4>
      <ResponsiveContainer width="100%" height="90%">
        <PieChart>
          <Pie
            data={numericData}
            dataKey="sold"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={5}
          >
            {numericData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              borderRadius: "1rem",
              border: "none",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
          />
          <Legend verticalAlign="bottom" height={36} iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function SellerDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const reportRef = useRef();
  const { t } = useTranslation();

  // ==========================================
  // UPDATED SECURE PDF GENERATOR
  // ==========================================
  const handleDownloadPDF = () => {
    if (!data) return;
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();

    // 1. BRANDED HEADER
    pdf.setFillColor(162, 47, 41); // #a22f29
    pdf.rect(0, 0, pageWidth, 45, "F");

    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(24);
    pdf.text("SOUQ YEMEN", pageWidth / 2, 22, { align: "center" });

    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    pdf.text("Official Seller Performance Report", pageWidth / 2, 32, {
      align: "center",
    });

    // 2. METADATA
    let y = 60;
    pdf.setTextColor(100, 100, 100);
    pdf.setFontSize(10);
    pdf.text(`Date Generated: ${new Date().toLocaleDateString()}`, 14, y);
    pdf.text(`Generated By: Seller Dashboard`, 14, y + 6);

    y += 12;
    pdf.setDrawColor(220, 220, 220);
    pdf.line(14, y, pageWidth - 14, y);

    // 3. PERFORMANCE SUMMARY
    y += 15;
    pdf.setTextColor(30, 30, 30);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(16);
    pdf.text("Performance Summary", 14, y);

    y += 12;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(12);

    // Left Column
    pdf.text(`Total Sales:`, 14, y);
    pdf.text(`$${Number(data.totalSales || 0).toFixed(2)}`, 60, y);

    pdf.text(`Total Orders:`, 14, y + 10);
    pdf.text(`${data.totalOrders || 0}`, 60, y + 10);

    // Right Column
    pdf.text(`Avg Order Value:`, 100, y);
    pdf.text(`$${Number(data.avgOrderValue || 0).toFixed(2)}`, 145, y);

    pdf.text(`Low Stock Items:`, 100, y + 10);
    pdf.setTextColor(220, 38, 38); // Red highlight for stock
    pdf.text(`${(data.lowStock || []).length}`, 145, y + 10);
    pdf.setTextColor(30, 30, 30);

    y += 25;
    pdf.setDrawColor(220, 220, 220);
    pdf.line(14, y, pageWidth - 14, y);

    // 4. BEST SELLING PRODUCTS
    y += 15;
    pdf.setTextColor(30, 30, 30);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(16);
    pdf.text("Best-Selling Products", 14, y);

    y += 12;
    pdf.setFontSize(11);

    (data.bestSelling || []).forEach((item, index) => {
      // Zebra striping
      if (index % 2 === 0) {
        pdf.setFillColor(245, 245, 245);
        pdf.rect(14, y - 5, pageWidth - 28, 10, "F");
      }

      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(100, 100, 100);
      pdf.text(`#${index + 1}`, 18, y);

      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(30, 30, 30);
      // Clean Arabic chars out to prevent jsPDF from crashing
      const cleanName = item.name.replace(/[^\x00-\x7F]/g, "");
      pdf.text(`${cleanName || "Product Item"}`, 30, y);

      pdf.setFont("helvetica", "bold");
      pdf.text(`${item.sold} Sold`, pageWidth - 40, y);

      y += 10;
    });

    // 5. FOOTER
    pdf.setTextColor(150, 150, 150);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.text("End of Report - Souq Yemen Seller Document", pageWidth / 2, 280, {
      align: "center",
    });

    pdf.save("SouqYemen_Seller_Report.pdf");
  };

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "http://localhost:3001/api/seller/dashboard",
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setAnalytics(res.data);
      } catch (err) {
        setError(err.message || t("Failed to load analytics"));
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [t]);

  const mock = {
    totalSales: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    productsCount: 0,
    revenueLast30: [],
    dailySales: [],
    bestSelling: [],
    recentOrders: [],
    lowStock: [],
  };
  const data = analytics || mock;

  if (loading)
    return (
      <div className="p-8 max-w-[1600px] mx-auto mt-8 bg-gradient-to-br from-rose-50/40 via-orange-50/30 to-white pb-20 min-h-screen animate-[fadeSlideUp_0.4s_ease_forwards]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );

  if (error)
    return (
      <div className="p-8 max-w-[1200px] mx-auto mt-8 text-center text-red-600 bg-red-50 border border-red-200 rounded-xl font-bold">
        {error}
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50/40 via-orange-50/30 to-white pb-20 animate-[fadeSlideUp_0.4s_ease_forwards]">
      <div
        ref={reportRef}
        className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-8"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">
              {t("Command Center")}
            </h2>
            <p className="text-gray-600 font-medium mt-1">
              {t("Here is what's happening with your store today.")}
            </p>
          </div>
          <button
            onClick={handleDownloadPDF}
            className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-800 font-bold px-6 py-3 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all active:scale-95"
          >
            <Download size={18} /> {t("Download Report")}
          </button>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KPI
            title={t("Total Sales")}
            value={`$${Number(data.totalSales || 0).toFixed(2)}`}
            delta={data.salesDelta}
            icon={ShoppingCart}
            colorClass="bg-[#f9eaea] text-[#a22f29]"
          />
          <KPI
            title={t("Total Orders")}
            value={data.totalOrders || 0}
            delta={data.ordersDelta}
            icon={BarChart2}
            colorClass="bg-green-100 text-green-700"
          />
          <KPI
            title={t("Avg Order Value")}
            value={`$${Number(data.avgOrderValue || 0).toFixed(2)}`}
            icon={Package}
            colorClass="bg-amber-100 text-amber-700"
          />
          <KPI
            title={t("Low Stock")}
            value={(data.lowStock || []).length}
            icon={AlertTriangle}
            colorClass="bg-red-100 text-red-700"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <SalesLineChart data={data.revenueLast30 || []} />
          <DailyBarChart data={data.dailySales || []} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <BestSellingPie data={data.bestSelling || []} />
          </div>
        </div>
      </div>
    </div>
  );
}
