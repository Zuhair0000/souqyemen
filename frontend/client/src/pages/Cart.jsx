import React from "react";
import { useCart } from "../context/cartContext";
import "./Cart.css"; // optional styling
import NavBar from "../components/NavBar";
import Icons from "../components/Icons";
import { useNavigate } from "react-router-dom";

export default function Cart() {
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  const handleQuantityChange = (e, id) => {
    const quantity = parseInt(e.target.value);
    if (!isNaN(quantity) && quantity > 0) {
      updateQuantity(id, quantity);
    }
  };

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleCheckout = async () => {
    try {
      const response = await fetch(
        "http://localhost:3001/api/orders/checkout",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`, // assuming you store JWT
          },
          body: JSON.stringify({
            cartItems: cartItems,
            total: total,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert("Order placed successfully!");
        clearCart([]); // Clear cart
        navigate("/"); // Redirect if needed
      } else {
        alert(data.message || "Checkout failed.");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    }
  };

  return (
    <>
      <NavBar>
        <Icons />
      </NavBar>
      <div className="cart-page">
        <div className="cart-wrapper">
          <h2>Your Cart</h2>
          {cartItems.length === 0 ? (
            <p>Your cart is empty</p>
          ) : (
            <>
              <table className="cart-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Subtotal</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item) => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(e, item.id)}
                        />
                      </td>
                      <td>${item.price}</td>
                      <td>${(item.price * item.quantity).toFixed(2)}</td>
                      <td>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="remove-btn"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <h3>Total: ${total.toFixed(2)}</h3>
              <button className="checkout-btn" onClick={handleCheckout}>
                Proceed to Checkout
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
