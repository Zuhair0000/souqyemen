import { useState } from "react";
import { useCart } from "../../context/cartContext";
import { useNavigate } from "react-router-dom";
import NavBar from "../../components/NavBar";
import Icons from "../../components/Icons";
import BackButton from "../../components/BackButton";

export default function Checkout() {
  const [paymentMethod, setPaymentMethod] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [loading, setLoading] = useState(false);

  const { cartItems, clearCart } = useCart();
  const navigate = useNavigate();

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Format card number: XXXX XXXX XXXX XXXX
  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, ""); // remove non-digits
    value = value.substring(0, 16); // max 16 digits
    value = value.replace(/(.{4})/g, "$1 ").trim(); // add space every 4 digits
    setCardNumber(value);
  };

  // Format expiry date: MM/YY
  const handleExpiryDateChange = (e) => {
    let value = e.target.value.replace(/\D/g, ""); // remove non-digits
    if (value.length >= 3) {
      value = value.substring(0, 4); // max 4 digits
      value = value.replace(/(\d{2})(\d{1,2})/, "$1/$2");
    }
    setExpiryDate(value);
  };

  // Limit CVV: max 3 digits
  const handleCvvChange = (e) => {
    let value = e.target.value.replace(/\D/g, ""); // remove non-digits
    value = value.substring(0, 3); // max 3 digits
    setCvv(value);
  };

  const handlePay = async () => {
    if (!paymentMethod) {
      alert("Please select a payment method");
      return;
    }
    if (!cardNumber || !expiryDate || !cvv) {
      alert("Please fill in all card details");
      return;
    }

    setLoading(true);

    const response = await fetch("http://localhost:3001/api/orders/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        cartItems,
        total,
      }),
    });

    if (response.ok) {
      // Mock delay for payment process
      setTimeout(() => {
        alert(`Payment successful via ${paymentMethod}`);
        clearCart([]);
        navigate("/");
        setLoading(false);
      }, 1500);
    }
  };

  return (
    <>
      <div className="p-4 max-w-[1000px] mt-8 mx-auto bg-[#f4f1eb] rounded-lg shadow">
        <BackButton />
        <h2 className="text-xl font-semibold mb-4">Select Payment Method</h2>

        {/* Payment method */}
        <label className="block mb-4">
          <input
            type="radio"
            name="payment"
            value="Visa/MasterCard"
            onChange={(e) => setPaymentMethod(e.target.value)}
          />{" "}
          Visa / MasterCard
        </label>

        {/* Show card form only if Visa/MasterCard is selected */}
        {paymentMethod === "Visa/MasterCard" && (
          <div className="space-y-3 mb-4">
            <input
              type="text"
              placeholder="Card Number"
              value={cardNumber}
              onChange={handleCardNumberChange}
              className="border p-2 rounded w-full bg-white"
            />
            <input
              type="text"
              placeholder="Expiry Date (MM/YY)"
              value={expiryDate}
              onChange={handleExpiryDateChange}
              className="border p-2 rounded w-full bg-white"
            />
            <input
              type="text"
              placeholder="CVV"
              value={cvv}
              onChange={handleCvvChange}
              className="border p-2 rounded w-full bg-white"
            />
          </div>
        )}

        <button
          onClick={handlePay}
          className="bg-red-900 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? "Processing..." : "Pay Now"}
        </button>

        <h3 className="text-right text-lg mt-4">Total: ${total.toFixed(2)}</h3>
      </div>
    </>
  );
}
