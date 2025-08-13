import React from "react";
import { useCart } from "../../context/cartContext";
import NavBar from "../../components/NavBar";
import Icons from "../../components/Icons";
import { useNavigate } from "react-router-dom";
import BackButton from "../../components/BackButton";

export default function Cart() {
  const { cartItems, updateQuantity, removeFromCart } = useCart();
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
    navigate("/checkout");
  };

  return (
    <>
      <NavBar>
        <Icons />
      </NavBar>
      <div className="flex justify-center items-start mt-8 px-24 py-10 gap-10 mx-auto max-w-[1000px] box-border  bg-[#f4f1eb]">
        <div className="flex-1 max-w-[700px]">
          <BackButton />
          <h2 className="text-2xl mb-5 text-gray-800">Your Cart</h2>

          {cartItems.length === 0 ? (
            <p>Your cart is empty</p>
          ) : (
            <>
              <table className="w-full border border-gray-300 rounded-lg border-collapse mb-5 bg-white overflow-hidden">
                <thead>
                  <tr>
                    <th className="px-4 py-3 border-b border-gray-200 bg-gray-100 font-semibold text-sm text-center text-gray-800">
                      Product
                    </th>
                    <th className="px-4 py-3 border-b border-gray-200 bg-gray-100 font-semibold text-sm text-center text-gray-800">
                      Qty
                    </th>
                    <th className="px-4 py-3 border-b border-gray-200 bg-gray-100 font-semibold text-sm text-center text-gray-800">
                      Price
                    </th>
                    <th className="px-4 py-3 border-b border-gray-200 bg-gray-100 font-semibold text-sm text-center text-gray-800">
                      Subtotal
                    </th>
                    <th className="px-4 py-3 border-b border-gray-200 bg-gray-100 font-semibold text-sm text-center text-gray-800">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item) => (
                    <tr
                      key={item.id}
                      className="text-center text-gray-700 text-sm border-b border-gray-200"
                    >
                      <td className="px-4 py-3">{item.name}</td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(e, item.id)}
                          className="w-16 p-1 text-center text-sm border border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-4 py-3">${item.price}</td>
                      <td className="px-4 py-3">
                        ${(item.price * item.quantity).toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="mt-6 px-6 py-3 bg-red-800 text-white rounded-md text-base cursor-pointer transition-colors hover:bg-red-900"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <h3 className="text-right text-lg mb-5">
                Total: ${total.toFixed(2)}
              </h3>

              <button
                onClick={handleCheckout}
                className="w-full max-w-xs bg-red-900 text-white py-3 px-6 rounded-md text-lg cursor-pointer hover:bg-red-800 transition"
              >
                Proceed to Checkout
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
