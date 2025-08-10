import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import "./ProductDetail.css";
import logo from "../assets/Logo.jpeg";
import NavBar from "../components/NavBar";
import { useCart } from "../context/cartContext";
import Icons from "../components/Icons";

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

  if (!product) return <p>Loading product...</p>;

  return (
    <>
      <NavBar>
        <Icons />
      </NavBar>
      <div className="product-detail-container">
        <div className="product-main">
          <div className="product-detail-image">
            <img
              src={product.image}
              alt={product.name}
              onError={(e) => {
                e.target.onerror = null; // prevent infinite loop
                e.target.src = logo;
              }}
            />
          </div>

          <div className="product-detail-info">
            <h2 className="product-detail-name">{product.name}</h2>
            <p className="product-detail-price">
              <strong>Price:</strong> ${product.price}
            </p>
            <p className="product-detail-description">{product.description}</p>
            <p className="product-detail-description">
              <strong>Category:</strong> {product.category}
            </p>

            <div className="quantity-section">
              <label htmlFor="quantity">Quantity:</label>
              <input
                type="number"
                id="quantity"
                value={quantity}
                min={1}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>

            <button className="product-detail-button" onClick={handleAdd}>
              Add to cart
            </button>
            <Link
              to={`/seller/public/${product.seller_id}`}
              className="product-detail-button"
            >
              <button className="contact-btn">Visit Seller</button>
            </Link>
            <Link to={`/chat/${product.seller_id}`}>
              <button className="product-detail-button">
                Chat with Seller
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div className="related-products">
        <h3>Related products</h3>
        <div className="related-grid">
          {relatedProducts.length === 0 ? (
            <p>No related products found</p>
          ) : (
            relatedProducts.map((item) => (
              <div key={item.id} className="related-card">
                <Link to={`/product/${item.id}`} className="product-link">
                  <img
                    src={product.image}
                    alt={product.name}
                    onError={(e) => {
                      e.target.onerror = null; // prevent infinite loop
                      e.target.src = logo;
                    }}
                  />
                  <p>{item.name}</p>
                  <p>${item.price}</p>
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
