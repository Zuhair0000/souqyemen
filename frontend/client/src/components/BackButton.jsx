// components/BackButton.jsx
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react"; // optional icon
import { useTranslation } from "react-i18next";

export default function BackButton({ label = "Back" }) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <button
      onClick={() => navigate(-1)}
      className="flex items-center gap-2 text-red-900 hover:text-red-600 font-medium transition mb-5"
    >
      <ArrowLeft size={18} />
      {t(label)}
    </button>
  );
}
