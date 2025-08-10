import React, { useEffect, useState } from "react";
import "./CategoriesBar.css"; // Assuming the CSS is in a separate file

export default function CategoriesBar({ onCategorySelect }) {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3001/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((err) => console.error("Error loading categories:", err));
  }, []);

  return (
    <div className="categories-bar-container">
      <div className="categories-scroll">
        <button
          className="category-button"
          onClick={() => onCategorySelect(null)}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            className="category-button"
            onClick={() => onCategorySelect(cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  );
}
