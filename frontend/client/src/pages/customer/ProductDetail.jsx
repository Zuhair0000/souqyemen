import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import logo from "../../assets/Logo.jpeg";
import NavBar from "../../components/NavBar";
import { useCart } from "../../context/cartContext";
import Icons from "../../components/Icons";
import BackButton from "../../components/BackButton";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(
          `http://localhost:3001/api/products/${id}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const { product, related } = await response.json();
        setProduct(product);
        setRelatedProducts(related);
      } catch (error) {
        console.error("Failed to fetch product:", error.message);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAdd = (e) => {
    e.preventDefault();
    if (product) {
      addToCart({ ...product, quantity: parseInt(quantity) });
    }
  };

  if (!product) return <p className="text-center mt-8">Loading product...</p>;

  return (
    <>
      <div className="max-w-[1200px] mx-auto px-8 py-8">
        <BackButton />
        <div className="flex flex-wrap gap-8 mb-12 items-start">
          <div className="w-full md:w-auto">
            <img
              src={product.image}
              alt={product.name}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = logo;
              }}
              className="w-[400px] max-w-full h-auto rounded-xl shadow-md"
            />
          </div>

          <div className="flex-1">
            <h2 className="text-3xl mb-2 font-semibold">{product.name}</h2>
            <p className="text-xl text-red-700 mb-4">
              <strong>Price:</strong> ${product.price}
            </p>
            <p className="text-gray-700 mb-2">{product.description}</p>
            <p className="text-gray-700 mb-4">
              <strong>Category:</strong> {product.category}
            </p>

            <div className="mb-4 flex items-center gap-2">
              <label htmlFor="quantity">Quantity:</label>
              <input
                type="number"
                id="quantity"
                value={quantity}
                min={1}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-16 p-1 border rounded"
              />
            </div>

            <button
              className="mt-6 px-6 py-3 bg-red-700 text-white rounded-md text-lg hover:bg-red-900 transition"
              onClick={handleAdd}
            >
              Add to cart
            </button>

            <Link to={`/seller/public/${product.seller_id}`}>
              <button className="mt-4 ml-4 px-6 py-3 border border-red-700 text-red-700 rounded-md hover:bg-red-100 transition">
                Visit Seller
              </button>
            </Link>

            <Link to={`/chat/${product.seller_id}`}>
              <button className="mt-4 ml-4 px-6 py-3 bg-red-700 text-white rounded-md text-lg hover:bg-red-900 transition">
                Chat with Seller
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 border-t border-gray-200 py-8 px-8">
        <h3 className="text-2xl mb-6 font-semibold text-gray-900">
          Related products
        </h3>
        <div className="flex flex-wrap gap-6">
          {relatedProducts.length === 0 ? (
            <p>No related products found</p>
          ) : (
            relatedProducts.map((item) => (
              <div
                key={item.id}
                className="w-[180px] p-4 bg-white border border-gray-300 rounded-lg text-center shadow-sm hover:shadow-md transition"
              >
                <Link to={`/product/${item.id}`} className="block">
                  <img
                    src={item.image || product.image}
                    alt={item.name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = logo;
                    }}
                    className="w-full h-auto rounded-md mb-2"
                  />
                  <p className="text-sm font-medium mb-1">{item.name}</p>
                  <p className="text-sm text-gray-700">${item.price}</p>
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
