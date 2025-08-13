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
    <div className="max-w-3xl mx-auto my-10 p-6 bg-white rounded-lg border border-gray-200 shadow-sm font-sans">
      <h3 className="text-xl text-center text-gray-800 mb-6">All Orders</h3>

      <input
        type="text"
        placeholder="Search by order number..."
        className="w-full max-w-xs mb-4 px-4 py-2 border border-gray-300 rounded-md text-base"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {filteredOrders.length === 0 ? (
        <p className="text-center text-gray-600">No matching orders.</p>
      ) : (
        filteredOrders.map((order) => (
          <div
            key={order.id}
            className="bg-white border border-gray-300 rounded-md p-4 shadow-sm mb-4"
          >
            <p className="text-gray-700 text-sm my-1">Order #{order.id}</p>
            <p className="text-gray-700 text-sm my-1">
              Customer ID: {order.customer_id}
            </p>
            <p className="text-gray-700 text-sm my-1">Status: {order.status}</p>
          </div>
        ))
      )}
    </div>
  );
}
