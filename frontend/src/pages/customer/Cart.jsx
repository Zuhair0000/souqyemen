import React from "react";
import { useCart } from "../../context/cartContext";
import { useNavigate } from "react-router-dom";
import BackButton from "../../components/BackButton";
import { useTranslation } from "react-i18next";
import { Trash2, ShoppingBag, ArrowRight } from "lucide-react";

export default function Cart() {
  const { cartItems, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";

  const handleQuantityChange = (e, id) => {
    const quantity = parseInt(e.target.value);
    if (!isNaN(quantity) && quantity > 0) {
      updateQuantity(id, quantity);
    }
  };

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50/30 to-orange-50/20 py-10">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8">
        <BackButton />

        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center text-white shadow-lg">
            <ShoppingBag size={28} />
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800 tracking-tight">
            {t("Your Cart")}
          </h2>
        </div>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-[2rem] p-16 text-center shadow-sm border border-gray-100 flex flex-col items-center">
            <div className="w-32 h-32 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-6">
              <ShoppingBag size={64} />
            </div>
            <p className="text-2xl font-semibold text-gray-600 mb-4">
              {t("Your cart is empty")}
            </p>
            <button
              onClick={() => navigate("/")}
              className="text-rose-600 font-bold hover:underline"
            >
              {t("Continue Shopping")}
            </button>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left: Items List */}
            <div className="flex-1 space-y-4">
              {cartItems.map((item, index) => (
                <div
                  key={item.id}
                  className="bg-white rounded-[1.5rem] p-4 md:p-6 flex flex-col sm:flex-row items-center gap-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow animate-[fadeSlideUp_0.4s_ease_forwards]"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex-1 text-start w-full">
                    <h3 className="text-xl font-bold text-gray-800">
                      {item.name}
                    </h3>
                    <p className="text-rose-600 font-bold mt-1">
                      ${item.price}
                    </p>
                  </div>

                  <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="flex items-center gap-3 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200">
                      <span className="text-sm font-medium text-gray-500">
                        {t("Qty")}
                      </span>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(e, item.id)}
                        className="w-12 text-center bg-transparent font-bold text-gray-800 outline-none"
                      />
                    </div>
                    <p className="font-black text-lg w-20 text-end">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-3 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Right: Order Summary */}
            <div className="w-full lg:w-[380px]">
              <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-gray-100 sticky top-[100px]">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b border-gray-100 pb-4">
                  {t("Order Summary")}
                </h3>

                <div className="flex justify-between items-center mb-6">
                  <span className="text-gray-500 font-medium">
                    {t("Subtotal")}
                  </span>
                  <span className="text-xl font-black">
                    ${total.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between items-center mb-8">
                  <span className="text-gray-500 font-medium">
                    {t("Shipping")}
                  </span>
                  <span className="text-green-500 font-bold">
                    {t("Calculated at checkout")}
                  </span>
                </div>

                <div className="flex justify-between items-center mb-8 pt-4 border-t border-gray-100">
                  <span className="text-lg font-bold">{t("Total")}</span>
                  <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-500">
                    ${total.toFixed(2)}
                  </span>
                </div>

                <button
                  onClick={() => navigate("/checkout")}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-gray-900 to-gray-800 text-white py-4 px-6 rounded-2xl text-lg font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all active:scale-95"
                >
                  {t("Proceed to Checkout")}
                  <ArrowRight
                    size={20}
                    className={isArabic ? "rotate-180" : ""}
                  />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
