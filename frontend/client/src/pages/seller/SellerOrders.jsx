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

  return (
    <>
      <SellerNavBar />
      <div className="p-6 bg-[#f4f1eb] max-w-[1000px] mx-auto mt-8">
        <BackButton />
        <h2 className="text-xl font-bold mb-4">My Orders</h2>

        {orders.length === 0 ? (
          <p>No orders found.</p>
        ) : (
          <>
            <div className="mb-5">
              <label className="mr-2 font-medium">Filter by Status:</label>
              <select
                className="border rounded px-2 py-1 bg-white"
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

            <table className="w-full border bg-white border-gray-300 border-collapse">
              <thead>
                <tr>
                  <th className="border border-gray-300 p-2 bg-gray-100 text-left">
                    Order ID
                  </th>
                  <th className="border border-gray-300 p-2 bg-gray-100 text-left">
                    Total
                  </th>
                  <th className="border border-gray-300 p-2 bg-gray-100 text-left">
                    Status
                  </th>
                  <th className="border border-gray-300 p-2 bg-gray-100 text-left">
                    Created At
                  </th>
                  <th className="border border-gray-300 p-2 bg-gray-100 text-left">
                    Update Status
                  </th>
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
                      <td className="border border-gray-300 p-2">
                        {order.order_id}
                      </td>
                      <td className="border border-gray-300 p-2">
                        ${order.total}
                      </td>
                      <td className="border border-gray-300 p-2">
                        {order.status}
                      </td>
                      <td className="border border-gray-300 p-2">
                        {new Date(order.created_at).toLocaleString()}
                      </td>
                      <td className="border border-gray-300 p-2">
                        <select
                          className="border rounded px-2 py-1"
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
          </>
        )}
      </div>
    </>
  );
}
