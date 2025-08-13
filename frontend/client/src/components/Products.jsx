import React from "react";
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
    <div className="p-5 max-w-[1500px] mx-auto my-8 bg-[#f4f1eb]">
      <h2 className="mb-8 text-2xl font-bold">Products</h2>
      <div className="grid gap-6 grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
        {products.length === 0 ? (
          <p>No products found</p>
        ) : (
          products.map((product, index) => (
            <Link
              key={product.name}
              to={`/product/${product.id}`}
              className="no-underline"
              style={{ color: "inherit" }}
            >
              <div
                className="border border-gray-300 rounded-lg p-4 text-center bg-white transform transition duration-300 hover:scale-105 hover:shadow-lg opacity-0 animate-[fadeSlideUp_0.6s_ease_forwards] flex flex-col h-[350px]"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-full h-48 mb-3 overflow-hidden rounded-md">
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
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
                <h3 className="text-lg font-semibold">{product.name}</h3>
                <p className="text-gray-700">{product.price}</p>
                <button
                  onClick={(e) => handleAdd(e, product)}
                  className="bg-[#a22f29] text-white px-4 py-2 rounded-md mt-auto transition duration-300 hover:bg-[#76201b] active:scale-95"
                >
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
