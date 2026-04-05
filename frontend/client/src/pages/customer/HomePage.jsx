import React, { useState, useEffect } from "react";
import CategoriesBar from "../../components/CategoriesBar";
import Products from "../../components/Products";
import Hero from "../../components/Hero";
import { useOutletContext } from "react-router-dom";
import { Truck, ShieldCheck, Store } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function HomePage() {
  const { selectedCategory, setSelectedCategory, searchQuery } =
    useOutletContext();
  const [products, setProducts] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const { t } = useTranslation();

  const fetchProductsByCategory = async (categoryId) => {
    try {
      const url = categoryId
        ? `http://localhost:3001/api/products/category/${categoryId}`
        : "http://localhost:3001/api/products";
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
    fetch("http://localhost:3001/api/posts")
      .then((res) => res.json())
      .then((data) => setPromotions(data))
      .catch((err) => console.error("Error fetching promotions:", err));
  }, []);

  const filterProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50/40 via-orange-50/30 to-white pb-20">
      {/* 1. HERO GOES FIRST */}
      <Hero promotions={promotions} />

      {/* 2. CATEGORIES GO SECOND (Shopee Style) */}
      <CategoriesBar
        onCategorySelect={setSelectedCategory}
        activeCategory={selectedCategory}
      />

      {/* 3. FEATURES SECTION */}
      {/* <div className="max-w-[1300px] mx-auto px-4 my-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/60 backdrop-blur-md border border-rose-100 rounded-[2rem] p-6 flex items-center gap-5 transition-transform hover:-translate-y-1 hover:shadow-lg">
            <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center text-rose-500 shrink-0">
              <Store size={32} />
            </div>
            <div className="text-start">
              <h4 className="text-xl font-bold text-gray-800">
                {t("Local Sellers") || "Local Sellers"}
              </h4>
              <p className="text-gray-500 text-sm mt-1">
                {t("Support Yemeni businesses directly") ||
                  "Support Yemeni businesses directly"}
              </p>
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-md border border-orange-100 rounded-[2rem] p-6 flex items-center gap-5 transition-transform hover:-translate-y-1 hover:shadow-lg">
            <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 shrink-0">
              <ShieldCheck size={32} />
            </div>
            <div className="text-start">
              <h4 className="text-xl font-bold text-gray-800">
                {t("Secure Payments") || "Secure Payments"}
              </h4>
              <p className="text-gray-500 text-sm mt-1">
                {t("100% safe & trusted checkout") ||
                  "100% safe & trusted checkout"}
              </p>
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-md border border-red-100 rounded-[2rem] p-6 flex items-center gap-5 transition-transform hover:-translate-y-1 hover:shadow-lg">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-red-500 shrink-0">
              <Truck size={32} />
            </div>
            <div className="text-start">
              <h4 className="text-xl font-bold text-gray-800">
                {t("Fast Delivery") || "Fast Delivery"}
              </h4>
              <p className="text-gray-500 text-sm mt-1">
                {t("Get your items delivered quickly") ||
                  "Get your items delivered quickly"}
              </p>
            </div>
          </div>
        </div>
      </div> */}

      {/* 4. PRODUCTS */}
      <Products products={filterProducts} />
    </div>
  );
}
