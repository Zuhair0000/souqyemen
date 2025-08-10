import React from "react";
import "./Products.css";
import logo from "../assets/Logo.jpeg";
import { Link } from "react-router-dom";
import { useCart } from "../context/cartContext";

export default function Products({ products }) {
  const { addToCart } = useCart();

  const handleAdd = (e, product) => {
    e.preventDefault();
    addToCart(product);
  };
  return (
    <div className="product-page">
      <h2 className="page-title">Products</h2>
      <div className="product-grid">
        {products.length === 0 ? (
          <p>No products found</p>
        ) : (
          products.map((product, index) => (
            <Link
              key={product.name}
              to={`/product/${product.id}`}
              className="product-link"
            >
              <div
                className="product-card"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <img
                  src={
                    product.image
                      ? `http://localhost:3001${product.image}`
                      : logo
                  }
                  alt={product.name}
                  onError={(e) => {
                    e.target.onerror = null; // prevent infinite loop
                    e.target.src = logo;
                  }}
                />
                <h3>{product.name}</h3>
                <p>{product.price}</p>
                <button onClick={(e) => handleAdd(e, product)}>
                  Add to cart
                </button>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
