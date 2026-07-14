import React, { useState, useEffect } from "react";
import CategoriesBar from "../../components/CategoriesBar";
import Products from "../../components/Products";
import Hero from "../../components/Hero";
import { useOutletContext } from "react-router-dom";
import { Store, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import Sellers from "../../components/Sellers";
import RecommendedForYou from "../../components/RecommendedForYou";
import { API_URL } from "../../config";

export default function HomePage() {
  const { selectedCategory, setSelectedCategory, searchQuery } =
    useOutletContext();
  const [products, setProducts] = useState([]);
  const [promotions, setPromotions] = useState([]);

  // Tracks which view the user is currently on
  const [viewMode, setViewMode] = useState("products");
  const [currentUser, setCurrentUser] = useState(null);
  const { t } = useTranslation();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  const fetchProductsByCategory = async (categoryId) => {
    try {
      const url = categoryId
        ? `${API_URL}/api/products/category/${categoryId}`
        : `${API_URL}/api/products`;
      const res = await fetch(url);
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  useEffect(() => {
    fetchProductsByCategory(selectedCategory);
  }, [selectedCategory]);

  useEffect(() => {
    fetch(`${API_URL}/api/posts`)
      .then((res) => res.json())
      .then((data) => setPromotions(data))
      .catch((err) => console.error("Error fetching promotions:", err));
  }, []);

  const filterProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50/40 via-orange-50/30 to-white pb-20">
      <Hero promotions={promotions} />

      {/* THE UI TOGGLE SWITCH */}
      <div className="max-w-[1800px] mx-auto px-4 xl:px-8 mt-8 mb-6 flex justify-center">
        <div className="bg-gray-200/50 backdrop-blur-md p-1.5 rounded-full inline-flex shadow-inner">
          <button
            onClick={() => setViewMode("products")}
            className={`flex items-center gap-2 px-8 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
              viewMode === "products"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Store size={18} />
            {t("Browse Products")}
          </button>

          <button
            onClick={() => setViewMode("sellers")}
            className={`flex items-center gap-2 px-8 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
              viewMode === "sellers"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Users size={18} />
            {t("Browse Sellers")}
          </button>
        </div>
      </div>

      {/* CONDITIONAL RENDERING */}
      {viewMode === "products" ? (
        // Flex Container for Sidebar Layout on Desktop
        <div className="max-w-[1800px] mx-auto px-4 xl:px-8 flex flex-col lg:flex-row gap-6 lg:gap-10 items-start">
          {/* Categories Sidebar (Sticky) */}
          <div className="w-full lg:w-[260px] xl:w-[280px] shrink-0 sticky top-[75px] lg:top-[90px] z-40">
            <CategoriesBar
              onCategorySelect={setSelectedCategory}
              activeCategory={selectedCategory}
            />
          </div>

          {/* Main Products Area */}
          <div className="flex-1 min-w-0 flex flex-col gap-8">
            {currentUser && currentUser.id && (
              <RecommendedForYou userId={currentUser.id} />
            )}
            <Products products={filterProducts} />
          </div>
        </div>
      ) : (
        <div className="max-w-[1800px] mx-auto px-4 xl:px-8 text-center">
          <Sellers />
        </div>
      )}
    </div>
  );
}
