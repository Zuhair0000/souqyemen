import React, { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import { useTranslation } from "react-i18next";

export default function AdminReportsTab() {
  const [report, setReport] = useState(null);
  const { t } = useTranslation();

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
    pdf.text(t("Platform Analytics Report"), 105, y, { align: "center" });

    y += 10;
    pdf.setFontSize(10);
    pdf.text(
      `${t("Generated on")}: ${new Date().toLocaleDateString()}`,
      105,
      y,
      {
        align: "center",
      },
    );

    y += 20;

    pdf.setFontSize(14);
    pdf.text(t("Platform Overview"), 14, y);

    y += 10;
    pdf.setFontSize(12);

    pdf.text(`${t("Total Users")}: ${report.totalUsers}`, 14, y);
    y += 8;
    pdf.text(`${t("Total Sellers")}: ${report.totalSellers}`, 14, y);
    y += 8;
    pdf.text(`${t("Total Products")}: ${report.totalProducts}`, 14, y);
    y += 8;
    pdf.text(`${t("Total Orders")}: ${report.totalOrders}`, 14, y);
    y += 8;
    pdf.text(
      `${t("Total Revenue")}: $${Number(report.totalRevenue).toFixed(2)}`,
      14,
      y,
    );

    y += 15;

    pdf.setFontSize(14);
    pdf.text(t("Top 5 Sellers"), 14, y);

    y += 10;
    pdf.setFontSize(12);

    y += 10;

    pdf.setFontSize(14);
    pdf.text(t("Top 5 Products"), 14, y);

    y += 10;
    pdf.setFontSize(12);

    report.topProducts.forEach((product, index) => {
      pdf.text(
        `${index + 1}. ${product.name} - ${t("Sold")}: ${product.totalSold}`,
        14,
        y,
      );
      y += 8;
    });

    pdf.save("Platform_Report.pdf");
  };

  if (!report) return <p className="text-center">{t("Loading report...")}</p>;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <button
          onClick={handleDownloadPDF}
          className="bg-[#a22f29] text-white px-5 py-2 rounded-lg font-bold hover:bg-[#76201b]"
        >
          {t("Download Platform Report")}
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="font-semibold mb-3">{t("Platform Overview")}</h3>
        <p>
          {t("Total Users")}: {report.totalUsers}
        </p>
        <p>
          {t("Total Sellers")}: {report.totalSellers}
        </p>
        <p>
          {t("Total Products")}: {report.totalProducts}
        </p>
        <p>
          {t("Total Orders")}: {report.totalOrders}
        </p>
        <p>
          {t("Total Revenue")}: ${Number(report.totalRevenue).toFixed(2)}
        </p>
      </div>
    </div>
  );
}
