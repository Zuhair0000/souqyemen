// SellerOrders.jsx
import React, { useEffect, useState } from "react";
import "./SellerOrders.css";
import SellerNavBar from "../components/SellerNavBar";

export default function SellerOrders() {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetch("http://localhost:3001/api/seller/orders", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setOrders(data.orders))
      .catch((err) => console.error("Error fetching orders", err));
  }, []);

  return (
    <>
      <SellerNavBar />
      <div className="orders-container">
        <h2 className="orders-heading">My Orders</h2>
        {orders.length === 0 ? (
          <p>No orders found.</p>
        ) : (
          <>
            <div style={{ marginBottom: "20px" }}>
              <label>Filter by Status: </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Created At</th>
                  <th>Update Status</th>
                </tr>
              </thead>
              <tbody>
                {orders
                  .filter((order) =>
                    statusFilter === "all"
                      ? true
                      : order.status === statusFilter
                  )
                  .map((order) => (
                    <tr key={order.order_id}>
                      <td>{order.order_id}</td>
                      <td>${order.total}</td>
                      <td>{order.status}</td>
                      <td>{new Date(order.created_at).toLocaleString()}</td>
                      <td>
                        <select
                          defaultValue={order.status}
                          onChange={async (e) => {
                            const newStatus = e.target.value;

                            try {
                              const res = await fetch(
                                `http://localhost:3001/api/seller/orders/${order.order_id}/status`,
                                {
                                  method: "PUT",
                                  headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${localStorage.getItem(
                                      "token"
                                    )}`,
                                  },
                                  body: JSON.stringify({ status: newStatus }),
                                }
                              );

                              if (res.ok) {
                                // ✅ After successful update, refetch the orders from backend
                                const updated = await fetch(
                                  "http://localhost:3001/api/seller/orders",
                                  {
                                    headers: {
                                      Authorization: `Bearer ${localStorage.getItem(
                                        "token"
                                      )}`,
                                    },
                                  }
                                );

                                const data = await updated.json();
                                setOrders(data.orders);
                              } else {
                                console.error("Failed to update status");
                              }
                            } catch (err) {
                              console.error("Error updating status", err);
                            }
                          }}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </>
  );
}
