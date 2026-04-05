import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BackButton from "../../components/BackButton";
import { useTranslation } from "react-i18next";
import { Search, Edit3, Trash2, PackageSearch } from "lucide-react";

export default function MyProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { t } = useTranslation();

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3001/api/seller/my-products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Unauthorized");
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("Error fetching products:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm(t("Are you sure you want to delete this product?")))
      return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:3001/api/seller/products/${id}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } },
      );
      if (!res.ok) throw new Error("Failed to delete");
      setProducts((prev) => prev.filter((product) => product.id !== id));
    } catch (err) {
      alert(t("Failed to delete the product."));
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50/40 via-orange-50/30 to-white pb-20 py-8">
      <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8">
        <BackButton />

        <div className="flex flex-col items-center justify-center mb-10 mt-4 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-6">
            {t("Inventory Management")}
          </h2>

          {/* Large Floating Search Bar */}
          <div className="relative w-full max-w-[600px] shadow-lg rounded-2xl">
            <div className="absolute inset-y-0 start-0 pl-5 pr-2 flex items-center pointer-events-none text-gray-400">
              <Search size={24} />
            </div>
            <input
              type="text"
              placeholder={t("Search by product name...")}
              className="w-full pl-14 pr-10 py-4 bg-white border border-gray-100 rounded-2xl focus:ring-2 focus:ring-rose-400 focus:outline-none transition-all text-lg font-medium text-gray-700"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-500 animate-pulse text-xl font-bold">
            {t("Loading")}...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[2rem] border border-gray-100 shadow-sm flex flex-col items-center">
            <PackageSearch size={64} className="text-gray-300 mb-4" />
            <p className="text-2xl font-bold text-gray-600">
              {t("No products found")}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white border border-gray-100 rounded-[1.5rem] p-5 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col h-[400px]"
              >
                {/* Image Area */}
                <div className="w-full h-44 bg-gray-50 rounded-xl mb-4 overflow-hidden flex items-center justify-center p-2 relative">
                  <img
                    src={`http://localhost:3001${product.image}`}
                    alt={product.name}
                    className="w-full h-full object-cover mix-blend-multiply rounded-lg"
                  />
                  <div className="absolute top-2 start-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold text-gray-600 shadow-sm border border-gray-100">
                    Stock: {product.stock}
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1 text-start">
                  <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2 leading-tight">
                    {product.name}
                  </h3>
                  <p className="text-xl font-black text-rose-600 mb-2">
                    ${product.price}
                  </p>
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {product.description}
                  </p>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={() =>
                      navigate(`/seller/edit-product/${product.id}`)
                    }
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-50 text-blue-600 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-600 hover:text-white transition-colors"
                  >
                    <Edit3 size={16} /> {t("Edit")}
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-600 py-2.5 rounded-xl text-sm font-bold hover:bg-red-600 hover:text-white transition-colors"
                  >
                    <Trash2 size={16} /> {t("Delete")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
