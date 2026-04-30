import { useEffect, useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  MapPin,
  Star,
} from "lucide-react";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [activeRatingInfo, setActiveRatingInfo] = useState({
    orderId: null,
    productId: null,
  });
  const [ratingValue, setRatingValue] = useState(5);

  // NEW: State to remember which items we just rated
  const [ratedItems, setRatedItems] = useState({});

  const token = localStorage.getItem("token");
  const { t } = useTranslation();

  const fetchOrders = () => {
    axios
      .get("https://souqyemen.store/api/user/orders", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setOrders([...res.data].sort((a, b) => b.id - a.id)))
      .catch((err) => console.error("Failed to fetch orders:", err));
  };

  useEffect(() => {
    fetchOrders();
  }, [token]);

  const handleConfirmReceipt = async (orderId) => {
    if (
      window.confirm(
        t("Are you sure you want to confirm receipt of this order?"),
      )
    ) {
      try {
        await axios.put(
          `https://souqyemen.store/api/orders/user/orders/${orderId}/complete`,
          {},
          { headers: { Authorization: `Bearer ${token}` } },
        );
        alert(t("Thank you! Order marked as completed."));
        fetchOrders();
      } catch (err) {
        console.error("Error confirming receipt:", err);
        alert(t("Failed to confirm receipt."));
      }
    }
  };

  const submitRating = async (orderId, productId) => {
    try {
      await axios.post(
        "https://souqyemen.store/api/products/review",
        {
          order_id: orderId,
          product_id: productId,
          rating: ratingValue,
          comment: "",
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      alert(t("Thank you! Rating submitted."));

      // NEW: Save the rating instantly in our local state so the UI updates
      setRatedItems((prev) => ({
        ...prev,
        [`${orderId}_${productId}`]: ratingValue,
      }));

      setActiveRatingInfo({ orderId: null, productId: null });
    } catch (err) {
      console.error("Error submitting rating:", err);
      if (err.response && err.response.data.message) {
        alert(err.response.data.message);
      } else {
        alert(t("Failed to submit rating."));
      }
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case "completed":
        return {
          color: "text-green-600",
          bg: "bg-green-100",
          icon: <CheckCircle size={16} />,
        };
      case "delivered":
        return {
          color: "text-teal-600",
          bg: "bg-teal-100",
          icon: <CheckCircle size={16} />,
        };
      case "shipped":
      case "out_for_delivery":
        return {
          color: "text-indigo-600",
          bg: "bg-indigo-100",
          icon: <Truck size={16} />,
        };
      case "cancelled":
        return {
          color: "text-red-600",
          bg: "bg-red-100",
          icon: <XCircle size={16} />,
        };
      default:
        return {
          color: "text-yellow-600",
          bg: "bg-yellow-100",
          icon: <Clock size={16} />,
        };
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f1eb] py-10">
      <div className="max-w-[900px] mx-auto px-4">
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-rose-500 shadow-sm">
            <Package size={24} />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-800">
            {t("My Orders")}
          </h1>
        </div>

        {orders.length === 0 ? (
          <div className="text-center bg-white p-12 rounded-[2rem] shadow-sm border border-gray-100">
            <Package size={64} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">
              {t("You haven't placed any orders yet.")}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order, idx) => {
              const statusCfg = getStatusConfig(order.status);
              const isShipped = [
                "shipped",
                "out_for_delivery",
                "delivered",
                "completed",
              ].includes(order.status);

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-[1.5rem] p-6 md:p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow animate-[fadeSlideUp_0.4s_ease_forwards]"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-dashed border-gray-200 pb-4 mb-4 gap-4">
                    <div>
                      <span className="text-sm text-gray-500 uppercase tracking-wider">
                        {t("Order")}
                      </span>
                      <h3 className="text-xl font-black text-gray-800">
                        #{order.id}
                      </h3>
                    </div>
                    <div
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-bold text-sm ${statusCfg.bg} ${statusCfg.color}`}
                    >
                      {statusCfg.icon}
                      <span className="capitalize">{t(order.status)}</span>
                    </div>
                  </div>

                  {isShipped && order.delivery_company_name && (
                    <div className="flex items-center gap-2 mb-5 px-4 py-2.5 bg-indigo-50 border border-indigo-100 rounded-xl w-max">
                      <Truck size={18} className="text-indigo-500" />
                      <span className="text-sm text-indigo-900 font-medium">
                        {t("Handled by")}:{" "}
                        <span className="font-bold">
                          {order.delivery_company_name}
                        </span>
                      </span>
                    </div>
                  )}

                  <ul className="space-y-3 mb-6">
                    {order.items.map((item, i) => {
                      const targetProductId = item.product_id || item.id;

                      // NEW: Check if rated in this session OR previously rated in the database
                      const currentRating =
                        item.user_rating ||
                        ratedItems[`${order.id}_${targetProductId}`];

                      const isRatingActive =
                        activeRatingInfo.orderId === order.id &&
                        activeRatingInfo.productId === targetProductId;

                      return (
                        <li
                          key={i}
                          className="flex flex-col text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100"
                        >
                          <div className="flex justify-between items-center w-full">
                            <span className="font-medium">
                              <span className="text-rose-500 font-bold me-2">
                                {item.quantity}x
                              </span>{" "}
                              {item.name}
                            </span>

                            <div className="flex items-center gap-4">
                              <span className="font-bold text-gray-800">
                                ${Number(item.price || 0).toFixed(2)}
                              </span>

                              {/* NEW LOGIC: Show Rated badge OR Rate Button */}
                              {order.status === "completed" &&
                                (currentRating ? (
                                  <div className="flex items-center gap-1.5 bg-gray-100 border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg font-bold text-xs shadow-inner cursor-not-allowed">
                                    <Star
                                      size={14}
                                      className="fill-yellow-400 text-yellow-400"
                                    />
                                    <span>
                                      {currentRating} / 5 {t("Rated")}
                                    </span>
                                  </div>
                                ) : (
                                  !isRatingActive && (
                                    <button
                                      onClick={() => {
                                        setActiveRatingInfo({
                                          orderId: order.id,
                                          productId: targetProductId,
                                        });
                                        setRatingValue(5);
                                      }}
                                      className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 hover:bg-yellow-200 transition-colors"
                                    >
                                      <Star
                                        size={12}
                                        className="fill-yellow-600"
                                      />{" "}
                                      {t("Rate")}
                                    </button>
                                  )
                                ))}
                            </div>
                          </div>

                          {/* Inline Rating UI */}
                          {isRatingActive && (
                            <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between bg-white p-3 rounded-lg shadow-sm">
                              <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    size={20}
                                    onClick={() => setRatingValue(star)}
                                    className={`cursor-pointer transition-colors ${ratingValue >= star ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                                  />
                                ))}
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() =>
                                    setActiveRatingInfo({
                                      orderId: null,
                                      productId: null,
                                    })
                                  }
                                  className="text-xs text-gray-500 hover:text-gray-700 font-bold px-3 py-1.5"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() =>
                                    submitRating(order.id, targetProductId)
                                  }
                                  className="text-xs bg-gray-900 text-white px-4 py-1.5 rounded-lg font-bold hover:bg-gray-800 transition-colors"
                                >
                                  Submit
                                </button>
                              </div>
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>

                  {order.tracking && order.tracking.length > 0 && (
                    <div className="bg-gray-50 rounded-xl p-5 mb-6 border border-gray-100">
                      <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <MapPin size={16} /> {t("Live Tracking")}
                      </h4>
                      <div className="space-y-4 pl-3 border-l-2 border-indigo-200">
                        {order.tracking.map((track, i) => (
                          <div key={i} className="relative pl-6">
                            <div
                              className={`absolute -left-[23px] top-1 w-4 h-4 rounded-full border-4 border-gray-50 ${i === order.tracking.length - 1 ? "bg-indigo-500" : "bg-gray-300"}`}
                            ></div>
                            <p
                              className={`text-sm font-bold ${i === order.tracking.length - 1 ? "text-indigo-700" : "text-gray-600"}`}
                            >
                              {track.update_text}
                            </p>
                            <p className="text-xs font-medium text-gray-400 mt-0.5">
                              {new Date(track.created_at).toLocaleString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-end pt-4 border-t border-gray-100 mt-auto">
                    <div className="flex flex-col">
                      <span className="text-gray-500 font-medium">
                        {t("Order Total")}
                      </span>
                      <span className="text-2xl font-black text-rose-600">
                        ${Number(order.total).toFixed(2)}
                      </span>
                    </div>

                    {order.status === "delivered" && (
                      <button
                        onClick={() => handleConfirmReceipt(order.id)}
                        className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95"
                      >
                        <CheckCircle size={18} /> {t("Confirm Receipt")}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
