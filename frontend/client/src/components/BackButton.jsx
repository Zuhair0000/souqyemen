// components/BackButton.jsx
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react"; // optional icon

export default function BackButton({ label = "Back" }) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      className="flex items-center gap-2 text-red-900 hover:text-red-600 font-medium transition mb-5"
    >
      <ArrowLeft size={18} />
      {label}
    </button>
  );
}
