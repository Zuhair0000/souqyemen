import React, { useEffect, useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { Search, Trash2, Tag, Store } from "lucide-react";

export default function ProductsTab() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const { t } = useTranslation();

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:3001/api/admin/products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(res.data);
    } catch (err) {
      console.error("Error fetching products", err);
    }
  };

  const deleteProduct = async (id) => {
    if (window.confirm(t("Are you sure you want to remove this product?"))) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`http://localhost:3001/api/admin/products/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProducts((prev) => prev.filter((p) => p.id !== id));
      } catch (err) {
        console.error("Error deleting product", err);
      }
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = products.filter((product) =>
    product.name?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="relative w-full max-w-md mx-auto shadow-sm">
        <div className="absolute inset-y-0 start-0 pl-4 flex items-center pointer-events-none text-gray-400">
          <Search size={20} />
        </div>
        <input
          type="text"
          placeholder={t("Search by product name...")}
          className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#a22f29] focus:outline-none transition-all text-gray-700 font-medium"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredProducts.length === 0 ? (
          <p className="text-center text-gray-500 py-10 font-bold">
            {t("No products found.")}
          </p>
        ) : (
          filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100 shrink-0">
                  <Tag size={20} />
                </div>
                <div>
                  <h4 className="text-lg font-black text-gray-900 mb-1">
                    {product.name}
                  </h4>
                  <span className="flex items-center gap-1.5 text-sm font-medium text-gray-500">
                    <Store size={14} className="text-[#a22f29]" />{" "}
                    {t("Seller ID")}: {product.seller_id}
                  </span>
                </div>
              </div>

              <button
                onClick={() => deleteProduct(product.id)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-red-50 text-red-600 px-4 py-2.5 rounded-lg font-bold hover:bg-red-600 hover:text-white transition-colors"
              >
                <Trash2 size={16} /> {t("Remove")}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
