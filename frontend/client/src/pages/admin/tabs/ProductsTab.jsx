import React, { useEffect, useState } from "react";
import axios from "axios";

export default function ProductsTab() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");

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
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:3001/api/admin/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Error deleting product", err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = products.filter((product) =>
    product.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-3xl mx-auto my-10 p-6 bg-white rounded-lg border border-gray-300 shadow-sm font-sans">
      <h3 className="text-2xl text-center text-gray-800 mb-6">All Products</h3>

      <input
        type="text"
        placeholder="Search by product name..."
        className="w-full max-w-xs mb-4 px-4 py-2 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-red-600"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {filteredProducts.map((product) => (
        <div
          key={product.id}
          className="bg-white border border-gray-300 rounded-lg p-4 shadow-sm mb-4"
        >
          <p className="text-gray-700 text-sm mb-1 font-semibold">
            {product.name}
          </p>
          <p className="text-gray-600 text-sm mb-3">
            Seller ID: {product.seller_id}
          </p>
          <button
            onClick={() => deleteProduct(product.id)}
            className="bg-red-600 text-white px-4 py-2 rounded-md font-bold text-sm hover:bg-red-700 transition-colors"
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  );
}
