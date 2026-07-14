import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  LayoutGrid,
  Smartphone,
  Shirt,
  Home,
  Sparkles,
  Gamepad2,
  Dumbbell,
  BookOpen,
  Utensils,
  Tag,
} from "lucide-react";
import { API_URL } from "../config";

export default function CategoriesBar({ onCategorySelect, activeCategory }) {
  const [categories, setCategories] = useState([]);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    fetch(`${API_URL}/api/products/categories`)
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((err) => console.error("Error loading categories:", err));
  }, []);

  const isArabic = i18n.language === "ar";

  const getCategoryIcon = (catName) => {
    if (!catName) return <Tag size={24} />;
    const name = catName.toLowerCase();
    if (
      name.includes("electronic") ||
      name.includes("إلكترونيات") ||
      name.includes("tech") ||
      name.includes("mobile")
    )
      return <Smartphone size={24} />;
    if (
      name.includes("cloth") ||
      name.includes("ملابس") ||
      name.includes("fashion") ||
      name.includes("men") ||
      name.includes("women")
    )
      return <Shirt size={24} />;
    if (
      name.includes("home") ||
      name.includes("المنزل") ||
      name.includes("furniture") ||
      name.includes("kitchen")
    )
      return <Home size={24} />;
    if (
      name.includes("beauty") ||
      name.includes("الجمال") ||
      name.includes("health") ||
      name.includes("الصحة")
    )
      return <Sparkles size={24} />;
    if (
      name.includes("toy") ||
      name.includes("أطفال") ||
      name.includes("kid") ||
      name.includes("game")
    )
      return <Gamepad2 size={24} />;
    if (name.includes("sport") || name.includes("رياضة"))
      return <Dumbbell size={24} />;
    if (name.includes("book") || name.includes("كتب"))
      return <BookOpen size={24} />;
    if (
      name.includes("food") ||
      name.includes("طعام") ||
      name.includes("grocery")
    )
      return <Utensils size={24} />;
    return <Tag size={24} />;
  };

  return (
    <div className="bg-white/80 backdrop-blur-2xl lg:bg-transparent lg:backdrop-blur-none rounded-[1.5rem] shadow-sm lg:shadow-none border border-white/60 lg:border-none p-3 lg:p-0 transition-all duration-300">
      {/* Desktop Only Title */}
      <h3 className="text-xs uppercase tracking-widest font-black text-gray-400 mb-3 px-2 hidden lg:block">
        {t("Categories")}
      </h3>

      {/* Mobile: flex-row (horizontal scroll)
        Desktop: flex-col (vertical list) 
      */}
      <div className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible scrollbar-hide gap-3 lg:gap-1 snap-x pb-1 lg:pb-0">
        {/* ALL CATEGORIES BUTTON */}
        <button
          onClick={() => onCategorySelect(null)}
          className={`snap-start shrink-0 flex flex-col lg:flex-row items-center gap-2 lg:gap-4 group outline-none w-[72px] md:w-[80px] lg:w-full lg:p-2 lg:rounded-xl transition-all duration-300 ${
            activeCategory === null
              ? "lg:bg-rose-50"
              : "lg:hover:bg-gray-100/50"
          }`}
        >
          <div
            className={`w-14 h-14 md:w-16 md:h-16 lg:w-12 lg:h-12 shrink-0 rounded-[1rem] lg:rounded-xl flex items-center justify-center transition-all duration-300 relative ${
              activeCategory === null
                ? "shadow-md bg-gradient-to-br from-rose-500 to-orange-500 text-white scale-105 lg:scale-100"
                : "bg-gray-100/80 text-gray-500 group-hover:bg-rose-100 group-hover:text-rose-600"
            }`}
          >
            <LayoutGrid size={24} />
          </div>
          <span
            className={`text-[11px] md:text-xs lg:text-sm font-medium text-center lg:text-start leading-tight ${
              activeCategory === null
                ? "text-rose-600 font-bold"
                : "text-gray-600 group-hover:text-rose-600"
            }`}
          >
            {t("All")}
          </span>
        </button>

        {/* DYNAMIC CATEGORY ITEMS */}
        {categories.map((cat) => {
          const displayName = isArabic ? cat.name_ar || cat.name : cat.name;

          return (
            <button
              key={cat.id}
              onClick={() => onCategorySelect(cat.id)}
              className={`snap-start shrink-0 flex flex-col lg:flex-row items-center gap-2 lg:gap-4 group outline-none w-[72px] md:w-[80px] lg:w-full lg:p-2 lg:rounded-xl transition-all duration-300 ${
                activeCategory === cat.id
                  ? "lg:bg-rose-50"
                  : "lg:hover:bg-gray-100/50"
              }`}
            >
              {/* Icon Frame */}
              <div
                className={`w-14 h-14 md:w-16 md:h-16 lg:w-12 lg:h-12 shrink-0 rounded-[1rem] lg:rounded-xl flex items-center justify-center transition-all duration-300 relative ${
                  activeCategory === cat.id
                    ? "shadow-md bg-gradient-to-br from-rose-500 to-orange-500 text-white scale-105 lg:scale-100"
                    : "bg-gray-100/80 text-gray-500 group-hover:bg-rose-100 group-hover:text-rose-600"
                }`}
              >
                {getCategoryIcon(cat.name)}
              </div>

              {/* Category Name */}
              <span
                className={`text-[11px] md:text-xs lg:text-sm font-medium text-center lg:text-start line-clamp-2 leading-tight ${
                  activeCategory === cat.id
                    ? "text-rose-600 font-bold"
                    : "text-gray-600 group-hover:text-rose-600"
                }`}
              >
                {displayName}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
