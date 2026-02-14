import React, { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";

export default function AdminReportsTab() {
  const [report, setReport] = useState(null);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:3001/api/admin/report", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReport(res.data);
    } catch (err) {
      console.error("Report error:", err);
    }
  };

  const handleDownloadPDF = () => {
    if (!report) return;

    const pdf = new jsPDF();
    let y = 20;

    pdf.setFontSize(18);
    pdf.text("Platform Analytics Report", 105, y, { align: "center" });

    y += 10;
    pdf.setFontSize(10);
    pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, y, {
      align: "center",
    });

    y += 20;

    pdf.setFontSize(14);
    pdf.text("Platform Overview", 14, y);

    y += 10;
    pdf.setFontSize(12);

    pdf.text(`Total Users: ${report.totalUsers}`, 14, y);
    y += 8;
    pdf.text(`Total Sellers: ${report.totalSellers}`, 14, y);
    y += 8;
    pdf.text(`Total Products: ${report.totalProducts}`, 14, y);
    y += 8;
    pdf.text(`Total Orders: ${report.totalOrders}`, 14, y);
    y += 8;
    pdf.text(
      `Total Revenue: $${Number(report.totalRevenue).toFixed(2)}`,
      14,
      y
    );

    y += 15;

    pdf.setFontSize(14);
    pdf.text("Top 5 Sellers", 14, y);

    y += 10;
    pdf.setFontSize(12);

    // report.topSellers.forEach((seller, index) => {
    //   pdf.text(
    //     `${index + 1}. ${seller.store_name} - $${Number(seller.revenue).toFixed(
    //       2
    //     )}`,
    //     14,
    //     y
    //   );
    //   y += 8;
    // });

    y += 10;

    pdf.setFontSize(14);
    pdf.text("Top 5 Products", 14, y);

    y += 10;
    pdf.setFontSize(12);

    report.topProducts.forEach((product, index) => {
      pdf.text(
        `${index + 1}. ${product.name} - Sold: ${product.totalSold}`,
        14,
        y
      );
      y += 8;
    });

    pdf.save("Platform_Report.pdf");
  };

  if (!report) return <p className="text-center">Loading report...</p>;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <button
          onClick={handleDownloadPDF}
          className="bg-[#a22f29] text-white px-5 py-2 rounded-lg font-bold hover:bg-[#76201b]"
        >
          Download Platform Report
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="font-semibold mb-3">Platform Overview</h3>
        <p>Total Users: {report.totalUsers}</p>
        <p>Total Sellers: {report.totalSellers}</p>
        <p>Total Products: {report.totalProducts}</p>
        <p>Total Orders: {report.totalOrders}</p>
        <p>Total Revenue: ${Number(report.totalRevenue).toFixed(2)}</p>
      </div>
    </div>
  );
}
