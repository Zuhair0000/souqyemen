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

export default function CategoriesBar({ onCategorySelect, activeCategory }) {
  const [categories, setCategories] = useState([]);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    fetch("http://localhost:3001/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((err) => console.error("Error loading categories:", err));
  }, []);

  const isArabic = i18n.language === "ar";

  // Smart Icon Mapper: Matches keywords in the category name to an icon
  const getCategoryIcon = (catName) => {
    if (!catName) return <Tag size={32} />;

    const name = catName.toLowerCase();

    if (
      name.includes("electronic") ||
      name.includes("إلكترونيات") ||
      name.includes("tech") ||
      name.includes("mobile")
    )
      return <Smartphone size={32} />;

    if (
      name.includes("cloth") ||
      name.includes("ملابس") ||
      name.includes("fashion") ||
      name.includes("men") ||
      name.includes("women")
    )
      return <Shirt size={32} />;

    if (
      name.includes("home") ||
      name.includes("المنزل") ||
      name.includes("furniture") ||
      name.includes("kitchen")
    )
      return <Home size={32} />;

    if (
      name.includes("beauty") ||
      name.includes("الجمال") ||
      name.includes("health") ||
      name.includes("الصحة")
    )
      return <Sparkles size={32} />;

    if (
      name.includes("toy") ||
      name.includes("أطفال") ||
      name.includes("kid") ||
      name.includes("game")
    )
      return <Gamepad2 size={32} />;

    if (name.includes("sport") || name.includes("رياضة"))
      return <Dumbbell size={32} />;

    if (name.includes("book") || name.includes("كتب"))
      return <BookOpen size={32} />;

    if (
      name.includes("food") ||
      name.includes("طعام") ||
      name.includes("grocery")
    )
      return <Utensils size={32} />;

    // Fallback icon if no keywords match
    return <Tag size={32} />;
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 my-2">
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-4 md:p-6">
        <h3 className="text-lg md:text-xl font-extrabold text-gray-800 mb-4 px-">
          {t("Categories")}
        </h3>

        <div className="flex overflow-x-auto scrollbar-hide gap-4 pt-4 md:gap-8 pb-2 snap-x">
          {/* ALL CATEGORIES BUTTON */}
          <button
            onClick={() => onCategorySelect(null)}
            className="snap-start shrink-0 flex flex-col items-center gap-3 group outline-none w-[72px] md:w-[88px]"
          >
            <div
              className={`w-16 h-16 md:w-20 md:h-20 rounded-[1.25rem] flex items-center justify-center transition-all duration-300 ${
                activeCategory === null
                  ? "bg-gradient-to-br from-rose-500 to-orange-500 text-white shadow-lg scale-105"
                  : "bg-gray-50 text-gray-400 group-hover:bg-rose-50 group-hover:text-rose-500"
              }`}
            >
              <LayoutGrid size={32} />
            </div>
            <span
              className={`text-xs md:text-sm font-bold text-center ${
                activeCategory === null ? "text-rose-600" : "text-gray-600"
              }`}
            >
              {t("All")}
            </span>
          </button>

          {/* DYNAMIC CATEGORY ITEMS WITH LUCIDE ICONS */}
          {categories.map((cat) => {
            const displayName = isArabic ? cat.name_ar || cat.name : cat.name;

            return (
              <button
                key={cat.id}
                onClick={() => onCategorySelect(cat.id)}
                className="snap-start shrink-0 flex flex-col items-center gap-3 group outline-none w-[72px] md:w-[88px]"
              >
                {/* Icon Frame */}
                <div
                  className={`w-16 h-16 md:w-20 md:h-20 rounded-[1.25rem] flex items-center justify-center transition-all duration-300 relative ${
                    activeCategory === cat.id
                      ? "ring-4 ring-rose-500/30 scale-105 shadow-lg bg-gradient-to-br from-rose-500 to-orange-500 text-white"
                      : "bg-gray-50 text-gray-500 group-hover:bg-rose-50 group-hover:text-rose-500"
                  }`}
                >
                  {/* Call the helper function to render the correct icon */}
                  {getCategoryIcon(cat.name)}
                </div>

                {/* Category Name */}
                <span
                  className={`text-xs md:text-sm font-medium text-center line-clamp-2 leading-tight ${
                    activeCategory === cat.id
                      ? "text-rose-600 font-bold"
                      : "text-gray-600 group-hover:text-rose-500"
                  }`}
                >
                  {displayName}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
