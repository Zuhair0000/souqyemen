// pages/customer/MyOrdersPage.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import NavBar from "../../components/NavBar";
import Icons from "../../components/Icons";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    axios
      .get("http://localhost:3001/api/user/orders", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const sorted = [...res.data].sort((a, b) => b.id - a.id);
        setOrders(sorted);
      })
      .catch((err) => console.error("Failed to fetch orders:", err));
  }, [token]);

  return (
    <>
      <NavBar>
        <Icons />
      </NavBar>

      <div className="p-4 max-w-[1000px] mx-auto font-sans px-10 bg-[#f4f1eb] mt-8">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
          My Orders
        </h1>

        {orders.length === 0 ? (
          <p className="text-center text-gray-500 text-base mt-8">
            You haven't placed any orders yet.
          </p>
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              className="border border-gray-300 rounded-lg mb-6 bg-yellow-50 bg-opacity-10 shadow-sm p-5"
            >
              <div className="flex justify-between mb-3">
                <span className="font-bold text-gray-700">#{order.id}</span>
                <span
                  className={`px-2 py-0.5 rounded-md text-sm capitalize ${
                    order.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : order.status === "completed"
                      ? "bg-green-100 text-green-800"
                      : order.status === "cancelled"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {order.status}
                </span>
              </div>

              <div>
                <p className="font-semibold text-gray-900 mb-2">
                  Total: ${Number(order.total).toFixed(2)}
                </p>
                <ul className="list-none p-0">
                  {order.items.map((item, i) => (
                    <li
                      key={i}
                      className="flex justify-between py-1 border-b border-dashed border-gray-200 text-gray-600"
                    >
                      <span>
                        {item.name} × {item.quantity}
                      </span>
                      <p className="font-medium text-gray-800">
                        ${Number(item.price || 0).toFixed(2)}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
