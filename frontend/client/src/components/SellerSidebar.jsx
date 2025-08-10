import React from "react";
import { Link } from "react-router-dom";
// import "./SellerSidebar.css";

export default function SellerSidebar() {
  return (
    <div className="seller-sidebar">
      <h2>Seller Panel</h2>
      <ul>
        <li>
          <Link to="/seller/dashboard">Dashboard</Link>
        </li>
        <li>
          <Link to="/seller/my-products">My Products</Link>
        </li>
        <li>
          <Link to="/seller/orders">Orders</Link>
        </li>
        <li>
          <Link to="/seller/settings">Settings</Link>
        </li>
        <li>
          <Link to="/logout">Logout</Link>
        </li>
      </ul>
    </div>
  );
}
