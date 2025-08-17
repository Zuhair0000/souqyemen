import React, { useEffect, useState } from "react";

export default function CategoriesBar({ onCategorySelect }) {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3001/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((err) => console.error("Error loading categories:", err));
  }, []);

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
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            className="px-3 md:px-4 py-1 bg-gray-100 rounded-full text-xs md:text-sm font-medium transition-colors duration-200 hover:bg-gray-200"
            onClick={() => onCategorySelect(cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  );
}
