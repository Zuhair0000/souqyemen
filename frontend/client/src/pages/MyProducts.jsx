import React, { useEffect, useState } from "react";
import "./MyProducts.css";
import SellerNavBar from "../components/SellerNavBar";
import { useNavigate } from "react-router-dom";

const MyProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:3001/api/seller/my-products", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error("Unauthorized");
      }

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
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:3001/api/seller/products/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to delete");

      setProducts((prev) => prev.filter((product) => product.id !== id));
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete the product.");
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <SellerNavBar />
      <div className="my-products-container">
        <h2 className="my-products-heading">My Products</h2>

        <div className="search-container">
          <input
            type="text"
            placeholder="Search products..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : filteredProducts.length === 0 ? (
          <p>No products found.</p>
        ) : (
          <ul className="product-list">
            {filteredProducts.map((product) => (
              <li key={product.id} className="product-card">
                <img
                  src={`http://localhost:3001${product.image}`}
                  alt={product.name}
                />
                <h3 className="product-title">{product.name}</h3>
                <p>Price: ${product.price}</p>
                <p>{product.description}</p>
                <div className="product-actions">
                  <button
                    className="edit-button"
                    onClick={() =>
                      navigate(`/seller/edit-product/${product.id}`)
                    }
                  >
                    Edit
                  </button>
                  <button
                    className="delete-button"
                    onClick={() => handleDelete(product.id)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
};

export default MyProducts;
