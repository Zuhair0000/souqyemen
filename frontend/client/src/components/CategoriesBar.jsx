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
    <div className="bg-white border-t border-b border-gray-200 px-4 py-2 overflow-x-auto">
      <div className="flex justify-center gap-3 whitespace-nowrap">
        <button
          className="px-4 py-1 bg-gray-100 rounded-full text-sm font-medium transition-colors duration-200 hover:bg-gray-200"
          onClick={() => onCategorySelect(null)}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            className="px-4 py-1 bg-gray-100 rounded-full text-sm font-medium transition-colors duration-200 hover:bg-gray-200"
            onClick={() => onCategorySelect(cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  );
}
