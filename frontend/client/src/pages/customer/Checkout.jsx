import { useState } from "react";
import { useCart } from "../../context/cartContext";
import { useNavigate } from "react-router-dom";
import BackButton from "../../components/BackButton";
import { useTranslation } from "react-i18next";
import {
  Lock,
  CreditCard,
  ShieldCheck,
  Wallet,
  Landmark,
  Banknote,
  MapPin,
} from "lucide-react";

export default function Checkout() {
  const [paymentMethod, setPaymentMethod] = useState("Visa/MasterCard");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");

  const [walletProvider, setWalletProvider] = useState("");
  const [walletPhone, setWalletPhone] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankAccount, setBankAccount] = useState("");

  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const { cartItems, clearCart } = useCart();
  const navigate = useNavigate();

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, "").substring(0, 16);
    setCardNumber(value.replace(/(.{4})/g, "$1 ").trim());
  };

  const handleExpiryDateChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length >= 3)
      value = value.substring(0, 4).replace(/(\d{2})(\d{1,2})/, "$1/$2");
    setExpiryDate(value);
  };

  const handleCvvChange = (e) =>
    setCvv(e.target.value.replace(/\D/g, "").substring(0, 3));

  const handlePay = async () => {
    // --- NEW: ADDRESS VALIDATION GATEKEEPER ---
    const userData = JSON.parse(localStorage.getItem("user"));

    if (!userData?.address || userData.address.trim() === "") {
      alert(
        t(
          "Please add your delivery address in your profile before placing an order.",
        ),
      );
      navigate("/profile");
      return;
    }
    // ------------------------------------------

    if (!paymentMethod) return alert(t("Please select a payment method"));

    if (
      paymentMethod === "Visa/MasterCard" &&
      (!cardNumber || !expiryDate || !cvv)
    )
      return alert(t("Please fill in all card details"));
    if (paymentMethod === "E-Wallet" && (!walletProvider || !walletPhone))
      return alert(t("Please fill in your wallet details"));
    if (paymentMethod === "Banking" && (!bankName || !bankAccount))
      return alert(t("Please fill in your banking details"));

    setLoading(true);

    const paymentDetails = {
      method: paymentMethod,
      provider:
        paymentMethod === "E-Wallet"
          ? walletProvider
          : paymentMethod === "Banking"
            ? bankName
            : null,
      accountInfo:
        paymentMethod === "E-Wallet"
          ? walletPhone
          : paymentMethod === "Banking"
            ? bankAccount
            : null,
    };

    try {
      const response = await fetch(
        "http://localhost:3001/api/orders/checkout",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ cartItems, total, paymentDetails }),
        },
      );

      if (response.ok) {
        setTimeout(() => {
          alert(`${t("Payment successful via")} ${t(paymentMethod)}`);
          clearCart([]);
          navigate("/");
          setLoading(false);
        }, 1500);
      } else {
        const errorData = await response.json();
        alert(errorData.message || t("Payment failed. Please try again."));
        setLoading(false);
      }
    } catch (err) {
      alert(t("Something went wrong"));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-10">
      <div className="max-w-[700px] mx-auto px-4">
        <BackButton />

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4 shadow-sm">
            <Lock size={32} />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-800">
            {t("Secure Checkout")}
          </h2>
          <p className="text-gray-500 mt-2 flex items-center justify-center gap-2">
            <ShieldCheck size={16} className="text-green-500" />{" "}
            {t("Your payment is encrypted and secure")}
          </p>
        </div>

        <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-gray-200">
          <div className="flex justify-between items-center mb-8 p-4 bg-gray-50 rounded-2xl border border-gray-200">
            <span className="text-lg text-gray-600 font-medium">
              {t("Amount to Pay")}
            </span>
            <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-500">
              ${total.toFixed(2)}
            </span>
          </div>

          <h3 className="text-xl font-bold mb-4">
            {t("Select Payment Method")}
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <label
              className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === "Visa/MasterCard" ? "border-rose-500 bg-rose-50 text-rose-600" : "border-gray-200 hover:bg-gray-50"}`}
            >
              <input
                type="radio"
                name="payment"
                value="Visa/MasterCard"
                checked={paymentMethod === "Visa/MasterCard"}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="hidden"
              />
              <CreditCard size={24} />{" "}
              <span className="text-sm font-bold text-center">
                {t("Visa / Master")}
              </span>
            </label>
            <label
              className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === "E-Wallet" ? "border-rose-500 bg-rose-50 text-rose-600" : "border-gray-200 hover:bg-gray-50"}`}
            >
              <input
                type="radio"
                name="payment"
                value="E-Wallet"
                checked={paymentMethod === "E-Wallet"}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="hidden"
              />
              <Wallet size={24} />{" "}
              <span className="text-sm font-bold text-center">
                {t("E-Wallet")}
              </span>
            </label>
            <label
              className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === "Banking" ? "border-rose-500 bg-rose-50 text-rose-600" : "border-gray-200 hover:bg-gray-50"}`}
            >
              <input
                type="radio"
                name="payment"
                value="Banking"
                checked={paymentMethod === "Banking"}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="hidden"
              />
              <Landmark size={24} />{" "}
              <span className="text-sm font-bold text-center">
                {t("Banking")}
              </span>
            </label>
            <label
              className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === "Cash" ? "border-rose-500 bg-rose-50 text-rose-600" : "border-gray-200 hover:bg-gray-50"}`}
            >
              <input
                type="radio"
                name="payment"
                value="Cash"
                checked={paymentMethod === "Cash"}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="hidden"
              />
              <Banknote size={24} />{" "}
              <span className="text-sm font-bold text-center">
                {t("Cash (COD)")}
              </span>
            </label>
          </div>

          {paymentMethod === "Visa/MasterCard" && (
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-[1.5rem] p-6 shadow-2xl mb-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
              <div className="relative z-10 space-y-5">
                <div>
                  <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">
                    {t("Card Number")}
                  </label>
                  <input
                    type="text"
                    placeholder="0000 0000 0000 0000"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    className="w-full bg-transparent border-b border-gray-600 text-xl tracking-widest text-white placeholder-gray-500 focus:outline-none focus:border-rose-500 transition-colors pb-1"
                  />
                </div>
                <div className="flex gap-6">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">
                      {t("Expiry")}
                    </label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      value={expiryDate}
                      onChange={handleExpiryDateChange}
                      className="w-full bg-transparent border-b border-gray-600 text-lg tracking-widest text-white placeholder-gray-500 focus:outline-none focus:border-rose-500 transition-colors pb-1"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">
                      {t("CVV")}
                    </label>
                    <input
                      type="password"
                      placeholder="***"
                      value={cvv}
                      onChange={handleCvvChange}
                      className="w-full bg-transparent border-b border-gray-600 text-lg tracking-widest text-white placeholder-gray-500 focus:outline-none focus:border-rose-500 transition-colors pb-1"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {paymentMethod === "E-Wallet" && (
            <div className="space-y-4 mb-8 bg-gray-50 p-6 rounded-[1.5rem] border border-gray-200">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  {t("Select E-Wallet Provider")}
                </label>
                <select
                  value={walletProvider}
                  onChange={(e) => setWalletProvider(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-rose-500"
                >
                  <option value="">{t("-- Select Provider --")}</option>
                  <option value="Jawali">Jawali (جوالي)</option>
                  <option value="Floosak">Floosak (فلوسك)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  {t("Wallet Phone Number")}
                </label>
                <input
                  type="text"
                  placeholder="7X XXX XXXX"
                  value={walletPhone}
                  onChange={(e) => setWalletPhone(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>
          )}

          {paymentMethod === "Banking" && (
            <div className="space-y-4 mb-8 bg-gray-50 p-6 rounded-[1.5rem] border border-gray-200">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  {t("Select Bank")}
                </label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-rose-500"
                >
                  <option value="">{t("-- Select Bank --")}</option>
                  <option value="Kuraimi">Al-Kuraimi Islamic Bank</option>
                  <option value="Tadhamon">Tadhamon Bank</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  {t("Bank Account Number")}
                </label>
                <input
                  type="text"
                  placeholder={t("Account Number")}
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>
          )}

          <button
            onClick={handlePay}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-2xl text-lg font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="animate-pulse">{t("Processing...")}</span>
            ) : (
              <>
                <Lock size={20} /> {t("Pay Now")}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
