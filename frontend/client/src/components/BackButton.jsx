import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function BackButton({ label = "Back" }) {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  // Check if Arabic to flip the arrow icon direction
  const isArabic = i18n.language === "ar";

  return (
    <button
      onClick={() => navigate(-1)}
      className="group flex w-max items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-600 hover:text-[#a22f29] hover:bg-rose-50 hover:border-rose-200 rounded-xl font-bold transition-all duration-200 shadow-sm hover:shadow mb-6 outline-none"
    >
      <ArrowLeft
        size={18}
        className={`transition-transform duration-200 ${isArabic ? "rotate-180" : ""}`}
      />
      {t(label)}
    </button>
  );
}
