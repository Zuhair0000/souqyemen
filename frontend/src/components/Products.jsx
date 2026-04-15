import React, { useState, useEffect } from "react";
import logo from "../assets/Logo.jpeg";
import { Link } from "react-router-dom";
import { useCart } from "../context/cartContext";
import { useTranslation } from "react-i18next";
import { ShoppingCart, Star, ChevronDown, AlertCircle } from "lucide-react";

export default function Products({ products }) {
  const { addToCart } = useCart();
  const { t } = useTranslation();

  const [visibleCount, setVisibleCount] = useState(20);

  useEffect(() => {
    setVisibleCount(20);
  }, [products]);

  const handleAdd = (e, product) => {
    e.preventDefault();
    addToCart(product);
  };

  const handleSeeMore = () => {
    setVisibleCount((prevCount) => prevCount + 20);
  };

  // 1. FILTER: Completely remove out-of-stock items before displaying
  const availableProducts = products.filter((p) => p.stock > 0);

  // 2. SLICE: Only render the portion of the available array up to the visibleCount
  const displayedProducts = availableProducts.slice(0, visibleCount);

  return (
    <div className="p-4 max-w-[1600px] mx-auto my-12">
      <div className="flex items-center justify-between mb-10">
        <h2 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 tracking-tight">
          {t("Products")}
          <span className="block h-1.5 w-16 bg-gradient-to-r from-rose-500 to-orange-400 mt-3 rounded-full"></span>
        </h2>
      </div>

      <div className="grid gap-6 md:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {availableProducts.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white rounded-3xl border-2 border-dashed border-gray-200">
            <p className="text-gray-500 text-xl font-medium">
              {t("No products found")}
            </p>
          </div>
        ) : (
          displayedProducts.map((product) => (
            <Link
              key={product.id}
              to={`/product/${product.id}`}
              className="group no-underline outline-none"
            >
              <div className="relative bg-white rounded-[2rem] p-5 flex flex-col h-[420px] border border-gray-100 hover:border-rose-200 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(244,63,94,0.15)]">
                <div className="w-full h-52 mb-5 overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 relative flex items-center justify-center p-2">
                  <img
                    src={
                      product.image
                        ? `http://localhost:3001${product.image}`
                        : logo
                    }
                    alt={product.name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = logo;
                    }}
                    className="w-full h-full object-cover rounded-xl transition-transform duration-500 group-hover:scale-110"
                  />
                </div>

                <div className="flex flex-col flex-grow text-start">
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-1">
                      <Star
                        size={14}
                        className="fill-yellow-400 text-yellow-400"
                      />
                      <span className="text-sm font-bold text-gray-600">
                        {product.avg_rating
                          ? parseFloat(product.avg_rating).toFixed(1)
                          : "0.0"}
                      </span>
                    </div>

                    {/* LOW STOCK BADGE */}
                    {product.stock <= 10 && (
                      <span className="flex items-center gap-1 bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md border border-rose-100">
                        <AlertCircle size={12} /> {t("Only")} {product.stock}{" "}
                        {t("left!")}
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-gray-800 line-clamp-2 leading-tight group-hover:text-rose-600 transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-500 mt-auto pt-3">
                    ${parseFloat(product.price).toFixed(2)}
                  </p>
                </div>

                <button
                  onClick={(e) => handleAdd(e, product)}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-orange-500 text-white px-4 py-3.5 rounded-xl mt-5 font-bold shadow-md transition-all duration-300 hover:shadow-lg hover:from-rose-600 hover:to-orange-600 active:scale-95"
                >
                  <ShoppingCart size={20} />
                  {t("Add to cart")}
                </button>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* SEE MORE BUTTON */}
      {visibleCount < availableProducts.length && (
        <div className="mt-16 flex justify-center">
          <button
            onClick={handleSeeMore}
            className="group flex items-center gap-2 bg-white border-2 border-gray-200 text-gray-700 px-8 py-4 rounded-full font-bold text-lg hover:border-rose-400 hover:text-rose-600 shadow-sm hover:shadow-md transition-all duration-300 active:scale-95"
          >
            {t("See More")}
            <ChevronDown
              size={22}
              className="text-gray-400 group-hover:text-rose-500 transition-colors"
            />
          </button>
        </div>
      )}
    </div>
  );
}
