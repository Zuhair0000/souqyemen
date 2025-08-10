import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ProductsTab.css";

export default function ProductsTab() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState(""); // ✅ search input

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
    <div className="products-tab-container">
      <h3>All Products</h3>
      <input
        type="text"
        placeholder="Search by product name..."
        className="search-input"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {filteredProducts.map((product) => (
        <div key={product.id} className="admin-product-card">
          <p>{product.name}</p>
          <p>Seller ID: {product.seller_id}</p>
          <button
            onClick={() => deleteProduct(product.id)}
            className="remove-btn"
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  );
}
