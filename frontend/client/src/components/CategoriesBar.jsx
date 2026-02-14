import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export default function CategoriesBar({ onCategorySelect }) {
  const [categories, setCategories] = useState([]);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    fetch("http://localhost:3001/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((err) => console.error("Error loading categories:", err));
  }, []);

  const isArabic = i18n.language === "ar";

  return (
    <div className="bg-white border-t border-b border-gray-200 px-2 py-2">
      {/* Wrapper scrolls on small screens */}
      <div
        className="
          flex gap-2 md:gap-3 
          overflow-x-auto md:overflow-visible
          whitespace-nowrap
          scrollbar-hide
          justify-start md:justify-center
        "
      >
        <button
          className="px-3 md:px-4 py-1 bg-gray-100 rounded-full text-xs md:text-sm font-medium transition-colors duration-200 hover:bg-gray-200"
          onClick={() => onCategorySelect(null)}
        >
          {t("All")}
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            className="px-3 md:px-4 py-1 bg-gray-100 rounded-full text-xs md:text-sm font-medium transition-colors duration-200 hover:bg-gray-200"
            onClick={() => onCategorySelect(cat.id)}
          >
            {isArabic ? cat.name_ar || cat.name : cat.name}
          </button>
        ))}
      </div>
    </div>
  );
}
