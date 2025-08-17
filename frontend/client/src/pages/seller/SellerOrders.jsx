import React, { useEffect, useState } from "react";
import SellerNavBar from "../../components/SellerNavBar";
import BackButton from "../../components/BackButton";

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

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    processing: "bg-blue-100 text-blue-800",
    shipped: "bg-purple-100 text-purple-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  return (
    <>
      <SellerNavBar />
      <div className="p-6 bg-[#f4f1eb] max-w-[1200px] mx-auto mt-8 rounded-xl shadow">
        <BackButton />
        <h2 className="text-2xl font-bold mb-6 text-gray-800">📦 My Orders</h2>

        {orders.length === 0 ? (
          <p className="text-gray-600">No orders found.</p>
        ) : (
          <>
            {/* Filter */}
            <div className="mb-5 flex items-center gap-3">
              <label className="font-medium text-gray-700">Filter:</label>
              <select
                className="border rounded-lg px-3 py-2 bg-white shadow-sm focus:ring-2 focus:ring-red-400"
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

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full bg-white border border-gray-200 rounded-xl shadow-sm">
                <thead>
                  <tr className="bg-gray-100 text-gray-700 text-left">
                    <th className="p-3">Order ID</th>
                    <th className="p-3">Total</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Created At</th>
                    <th className="p-3">Update Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders
                    .filter((order) =>
                      statusFilter === "all"
                        ? true
                        : order.status === statusFilter
                    )
                    .map((order, i) => (
                      <tr
                        key={order.order_id}
                        className={`border-t hover:bg-gray-50 transition ${
                          i % 2 === 0 ? "bg-white" : "bg-gray-50"
                        }`}
                      >
                        <td className="p-3 font-medium text-gray-800">
                          #{order.order_id}
                        </td>
                        <td className="p-3 text-gray-700">${order.total}</td>
                        <td className="p-3">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              statusColors[order.status]
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="p-3 text-gray-600">
                          {new Date(order.created_at).toLocaleString()}
                        </td>
                        <td className="p-3">
                          <select
                            className="border rounded-lg px-2 py-1 shadow-sm focus:ring-2 focus:ring-red-400"
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
            </div>
          </>
        )}
      </div>
    </>
  );
}
