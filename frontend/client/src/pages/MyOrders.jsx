// pages/customer/MyOrdersPage.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import "./MyOrders.css";
import NavBar from "../components/NavBar";
import Icons from "../components/Icons";

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

      <div className="my-orders-container">
        <h1 className="my-orders-title">My Orders</h1>

        {orders.length === 0 ? (
          <p className="empty-msg">You haven't placed any orders yet.</p>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <span className="order-id">#{order.id}</span>
                <span
                  className={`order-status ${
                    order.status ? order.status.toLowerCase() : "unknown"
                  }`}
                >
                  {order.status}
                </span>
              </div>

              <div className="order-body">
                <p className="order-total">
                  Total: ${Number(order.total).toFixed(2)}
                </p>
                <ul className="order-items">
                  {order.items.map((item, i) => (
                    <li key={i}>
                      {item.name} × {item.quantity}
                      <p>${Number(item.price || 0).toFixed(2)}</p>
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
