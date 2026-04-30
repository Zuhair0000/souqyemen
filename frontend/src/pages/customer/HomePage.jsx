import React, { useState, useEffect } from "react";
import CategoriesBar from "../../components/CategoriesBar";
import Products from "../../components/Products";
import Hero from "../../components/Hero";
// You will create this component next!
// import Sellers from "../../components/Sellers";
import { useOutletContext } from "react-router-dom";
import { Truck, ShieldCheck, Store, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import Sellers from "../../components/Sellers";
import RecommendedForYou from "../../components/RecommendedForYou";

export default function HomePage() {
  const { selectedCategory, setSelectedCategory, searchQuery } =
    useOutletContext();
  const [products, setProducts] = useState([]);
  const [promotions, setPromotions] = useState([]);

  // 1. ADD THIS STATE: Tracks which view the user is currently on
  const [viewMode, setViewMode] = useState("products");

  const [currentUser, setCurrentUser] = useState(null);

  const { t } = useTranslation();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser)); // Convert the string back to an object
    }
  }, []);

  const fetchProductsByCategory = async (categoryId) => {
    try {
      const url = categoryId
        ? `https://souqyemen.store/api/products/category/${categoryId}`
        : "https://souqyemen.store/api/products";
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
    fetch("https://souqyemen.store/api/posts")
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

      {/* 2. THE UI TOGGLE SWITCH */}
      <div className="max-w-[1600px] mx-auto px-4 mt-8 mb-4 flex justify-center">
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

      {/* 3. CONDITIONAL RENDERING */}
      {viewMode === "products" ? (
        <>
          {currentUser && currentUser.id && (
            <RecommendedForYou userId={currentUser.id} />
          )}
          <CategoriesBar
            onCategorySelect={setSelectedCategory}
            activeCategory={selectedCategory}
          />
          <Products products={filterProducts} />
        </>
      ) : (
        <div className="max-w-[1600px] mx-auto px-4 text-center">
          {/* <Users size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-bold text-gray-800">Sellers Directory</h3> */}
          <Sellers />
        </div>
      )}
    </div>
  );
}
