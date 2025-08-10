import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "./SellerProfile.css";
import SellerNavBar from "../components/SellerNavBar";
import logo from "../assets/Logo.jpeg";

export default function SellerProfile() {
  const { id } = useParams();
  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);

  const user = JSON.parse(localStorage.getItem("user")); // ✅ get user object
  const role = localStorage.getItem("role"); // ✅ get role
  const loggedInUserId = user?.id;

  useEffect(() => {
    const fetchSeller = async () => {
      const res = await fetch(`http://localhost:3001/api/seller/public/${id}`);
      const data = await res.json();
      console.log("Seller data:", data);
      setSeller(data.seller);
      setProducts(data.products);
    };
    fetchSeller();
  }, [id]);

  const isSameSeller = role === "seller" && loggedInUserId === parseInt(id);

  return (
    <>
      <SellerNavBar />
      <div className="seller-profile">
        {seller && (
          <div className="seller-info">
            <img src={logo} alt="Seller" />
            <h2>{seller.business_name}</h2>
            <p>{seller.description}</p>

            {/* ✅ Only show "Contact seller" if current user is NOT the seller */}
            {role === "customer" && (
              <Link to={`/chat/${seller.id}`}>
                <button className="contact-btn">Contact seller</button>
              </Link>
            )}
          </div>
        )}

        <h3 className="section-title">Products</h3>
        <div className="product-grid">
          {Array.isArray(products) &&
            products.map((product) => (
              <div className="product-card" key={product.id}>
                <img
                  src={`http://localhost:3001${product.image}`}
                  alt={product.name}
                />
                <h4>{product.name}</h4>
                <p>${parseFloat(product.price).toFixed(2)}</p>
              </div>
            ))}
        </div>
      </div>
    </>
  );
}
