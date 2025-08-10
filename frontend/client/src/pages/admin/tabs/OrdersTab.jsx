import React, { useEffect, useState } from "react";
import axios from "axios";
import "./OrdersTab.css";

export default function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState(""); // ✅ for filtering

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:3001/api/admin/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data);
    } catch (err) {
      console.error("Error fetching orders", err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((order) =>
    order.id.toString().includes(search)
  );

  return (
    <div className="orders-tab-container">
      <h3>All Orders</h3>

      <input
        type="text"
        placeholder="Search by order number..."
        className="order-search-input"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {filteredOrders.length === 0 ? (
        <p>No matching orders.</p>
      ) : (
        filteredOrders.map((order) => (
          <div key={order.id} className="admin-order-card">
            <p>Order #{order.id}</p>
            <p>Customer ID: {order.customer_id}</p>
            <p>Status: {order.status}</p>
          </div>
        ))
      )}
    </div>
  );
}
