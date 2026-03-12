import React, { useEffect, useState } from "react";
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
  FiShoppingCart,
  FiBarChart2,
  FiPackage,
  FiAlertTriangle,
} from "react-icons/fi";
import SellerNavBar from "../../components/SellerNavBar";
import jsPDF from "jspdf";
import { useRef } from "react";
import { useTranslation } from "react-i18next"; // Added import

// ---------- Helper mini components ----------
function KPI({ title, value, delta, icon: Icon, bg = "bg-white" }) {
  return (
    <div className={`p-5 rounded-lg shadow ${bg}`}>
      <div className="flex items-start gap-4">
        <div className="p-3 bg-white/70 rounded-md border">
          <Icon size={22} />
        </div>
        <div>
          <div className="text-sm text-gray-500">{title}</div>
          <div className="text-2xl font-bold mt-1">{value}</div>
          {delta !== undefined && (
            <div
              className={`text-sm mt-1 ${
                delta >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {delta >= 0 ? `▲ ${Math.abs(delta)}%` : `▼ ${Math.abs(delta)}%`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return <div className="h-28 bg-gray-200 animate-pulse rounded-lg" />;
}

// ---------- Charts ----------
function SalesLineChart({ data }) {
  const { t } = useTranslation();
  return (
    <div className="bg-white rounded-lg p-4 shadow h-96">
      <h4 className="font-semibold mb-2">{t("Revenue (Last 30 days)")}</h4>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#2563eb"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function DailyBarChart({ data }) {
  const { t } = useTranslation();
  return (
    <div className="bg-white rounded-lg p-4 shadow h-96">
      <h4 className="font-semibold mb-2">{t("Daily Sales (Last 7 days)")}</h4>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="total" fill="#0ea5a4" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function BestSellingPie({ data }) {
  const { t } = useTranslation();
  const COLORS = ["#6366f1", "#06b6d4", "#f97316", "#f43f5e", "#34d399"];

  const numericData = (data || []).map((item) => ({
    ...item,
    sold: Number(item.sold) || 0,
  }));

  return (
    <div className="bg-white rounded-lg p-4 shadow h-96">
      <h4 className="font-semibold mb-2">{t("Best Selling Products")}</h4>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={numericData}
            dataKey="sold"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            fill="#8884d8"
            label
          >
            {numericData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// ---------- Main Dashboard Page ----------
export default function SellerDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const reportRef = useRef();
  const { t } = useTranslation(); // Translation hook for main component

  const handleDownloadPDF = () => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    let y = 20;

    pdf.setFontSize(18);
    pdf.text(t("Seller Performance Report"), pageWidth / 2, y, {
      align: "center",
    });

    y += 10;
    pdf.setFontSize(10);
    pdf.text(
      `${t("Generated on")}: ${new Date().toLocaleDateString()}`,
      pageWidth / 2,
      y,
      { align: "center" },
    );

    y += 20;
    pdf.setFontSize(14);
    pdf.text(t("Summary"), 14, y);

    y += 10;
    pdf.setFontSize(12);
    pdf.text(
      `${t("Total Sales")}: $${Number(data.totalSales || 0).toFixed(2)}`,
      14,
      y,
    );
    y += 8;
    pdf.text(`${t("Total Orders")}: ${data.totalOrders || 0}`, 14, y);
    y += 8;
    pdf.text(
      `${t("Avg Order Value")}: $${Number(data.avgOrderValue || 0).toFixed(2)}`,
      14,
      y,
    );
    y += 8;
    pdf.text(`${t("Low Stock")}: ${(data.lowStock || []).length}`, 14, y);

    y += 15;
    pdf.setFontSize(14);
    pdf.text(t("Best Selling Products"), 14, y);

    y += 10;
    pdf.setFontSize(11);

    (data.bestSelling || []).forEach((item, index) => {
      pdf.text(
        `${index + 1}. ${item.name} - ${t("Sold")}: ${item.sold}`,
        14,
        y,
      );
      y += 8;
    });

    pdf.save("Seller_Report.pdf");
  };

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "http://localhost:3001/api/seller/dashboard",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setAnalytics(res.data);
      } catch (err) {
        console.error("Analytics Error:", err);
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

  if (loading) {
    return (
      <div className="p-8 max-w-[1200px] mx-auto mt-8 ">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-[1200px] mx-auto mt-8 text-center text-red-600">
        {error}
      </div>
    );
  }

  return (
    <>
      <div
        ref={reportRef}
        className="p-8 bg-[#f4f1eb] rounded-2xl max-w-[1200px] mx-auto mt-8"
      >
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-3xl mb-6 text-gray-800 font-bold">
            {t("Seller Dashboard")}
          </h2>

          <button
            onClick={handleDownloadPDF}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow mb-6"
          >
            {t("Download PDF Report")}
          </button>

          {/* KPI Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <KPI
              title={t("Total Sales")}
              value={`$${Number(data.totalSales || 0).toFixed(2)}`}
              delta={data.salesDelta}
              icon={FiShoppingCart}
              bg="bg-white"
            />
            <KPI
              title={t("Total Orders")}
              value={data.totalOrders || 0}
              delta={data.ordersDelta}
              icon={FiBarChart2}
              bg="bg-white"
            />
            <KPI
              title={t("Avg Order Value")}
              value={`$${Number(data.avgOrderValue || 0).toFixed(2)}`}
              icon={FiPackage}
              bg="bg-white"
            />
            <KPI
              title={t("Low Stock")}
              value={(data.lowStock || []).length}
              icon={FiAlertTriangle}
              bg="bg-white"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <BestSellingPie data={data.bestSelling || []} />
            <DailyBarChart data={data.dailySales || []} />
          </div>
          <SalesLineChart data={data.revenueLast30 || []} />
        </div>
      </div>
    </>
  );
}
