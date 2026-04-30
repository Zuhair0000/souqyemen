import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Store, Star, Package } from "lucide-react";
import logo from "../assets/Logo.jpeg"; // Fallback image

export default function Sellers({ searchQuery }) {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchSellers = async () => {
      try {
        // Point this to the new Node.js endpoint you just created
        const res = await fetch("https://souqyemen.store/api/seller/sellers");
        const data = await res.json();
        setSellers(data);
      } catch (err) {
        console.error("Error fetching sellers:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSellers();
  }, []);

  // Filter sellers based on the search bar in the Hero section
  const filteredSellers = sellers.filter((seller) =>
    seller.business_name
      ?.toLowerCase()
      .includes((searchQuery || "").toLowerCase()),
  );

  if (loading) {
    return (
      <div className="text-center py-20 text-gray-500">Loading Sellers...</div>
    );
  }

  return (
    <div className="p-4 max-w-[1600px] mx-auto my-12">
      <div className="flex items-center justify-between mb-10">
        <h2 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 tracking-tight">
          {t("Our Sellers")}
          <span className="block h-1.5 w-16 bg-gradient-to-r from-rose-500 to-orange-400 mt-3 rounded-full"></span>
        </h2>
      </div>

      <div className="grid gap-6 md:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredSellers.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white rounded-3xl border-2 border-dashed border-gray-200">
            <p className="text-gray-500 text-xl font-medium">
              {t("No sellers found")}
            </p>
          </div>
        ) : (
          filteredSellers.map((seller) => (
            <Link
              key={seller.id}
              to={`/seller/public/${seller.id}`}
              className="group no-underline outline-none"
            >
              <div className="relative bg-white rounded-[2rem] p-6 flex flex-col items-center text-center border border-gray-100 hover:border-orange-200 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(249,115,22,0.15)]">
                {/* Seller Avatar/Logo */}
                <div className="w-24 h-24 mb-4 rounded-full bg-gradient-to-br from-orange-50 to-rose-50 border-4 border-white shadow-md overflow-hidden flex items-center justify-center p-1">
                  <img
                    src={
                      seller.image
                        ? `https://souqyemen.store${seller.image}`
                        : logo
                    }
                    alt={seller.business_name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = logo;
                    }}
                    className="w-full h-full object-cover rounded-full transition-transform duration-500 group-hover:scale-110"
                  />
                </div>

                {/* Seller Info */}
                <h3 className="text-xl font-bold text-gray-800 line-clamp-1 group-hover:text-orange-500 transition-colors">
                  {seller.store_name}
                </h3>
                <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                  <Store size={14} /> {seller.owner_name}
                </p>

                {/* Stats Row */}
                {/* <div className="flex items-center gap-4 mt-5 pt-5 border-t border-gray-100 w-full justify-center">
                  <div className="flex items-center gap-1 text-sm font-bold text-gray-700">
                    <Star
                      size={16}
                      className="text-yellow-400 fill-yellow-400"
                    />
                    {seller.rating || "New"}
                  </div>
                  <div className="w-1 h-1 rounded-full bg-gray-300"></div>
                  <div className="flex items-center gap-1 text-sm font-medium text-gray-500">
                    <Package size={16} />
                    {seller.total_products || 0} items
                  </div>
                </div> */}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
