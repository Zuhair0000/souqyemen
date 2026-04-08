import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import logo from "../../assets/Logo.jpeg";
import { useCart } from "../../context/cartContext";
import BackButton from "../../components/BackButton";
import { useTranslation } from "react-i18next";
import { ShoppingCart, Store, MessageCircle, Star } from "lucide-react";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);

  const { addToCart } = useCart();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(
          `http://localhost:3001/api/products/${id}`,
        );
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const { product, related } = await response.json();
        setProduct(product);
        setRelatedProducts(related);
      } catch (error) {
        console.error("Failed to fetch product:", error.message);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAdd = (e) => {
    e.preventDefault();
    if (product) addToCart({ ...product, quantity: parseInt(quantity) });
  };

  if (!product)
    return (
      <div className="min-h-screen flex items-center justify-center text-2xl animate-pulse text-rose-500 font-bold">
        {t("Loading product...")}
      </div>
    );

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-8">
        <BackButton />

        <div className="flex flex-col lg:flex-row gap-12 mt-6 mb-16">
          <div className="w-full lg:w-1/2 flex justify-center">
            <div className="relative w-full max-w-[500px] aspect-square rounded-[2.5rem] bg-gradient-to-br from-rose-50 to-orange-50 flex items-center justify-center p-8 shadow-inner border border-rose-100/50 group">
              <img
                src={product.image || logo}
                alt={product.name}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = logo;
                }}
                className="w-full h-full object-cover mix-blend-multiply rounded-2xl transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          </div>

          <div className="w-full lg:w-1/2 flex flex-col justify-center text-start">
            {/* Category and Rating Section */}
            <div className="flex items-center gap-4 mb-4">
              <span className="inline-block px-4 py-1.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold w-max">
                {product.category}
              </span>
              <div className="flex items-center gap-1.5">
                <Star size={20} className="fill-yellow-400 text-yellow-400" />
                <span className="font-black text-lg text-gray-700">
                  {product.avg_rating
                    ? parseFloat(product.avg_rating).toFixed(1)
                    : "5.0"}
                </span>
                <span className="text-gray-400 text-sm font-medium">
                  ({product.total_reviews || 0} {t("reviews")})
                </span>
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight mb-4">
              {product.name}
            </h1>
            <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-500 mb-6">
              ${product.price}
            </p>
            <p className="text-lg text-gray-600 leading-relaxed mb-8">
              {product.description}
            </p>

            <div className="flex items-center gap-4 mb-8 bg-gray-50 p-2 rounded-2xl w-max border border-gray-200">
              <span className="font-bold text-gray-500 px-3">
                {t("Quantity")}
              </span>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-16 h-12 text-center text-xl font-bold bg-white rounded-xl shadow-sm outline-none border border-gray-200 focus:border-rose-500"
              />
            </div>

            <button
              onClick={handleAdd}
              className="w-full md:w-auto flex items-center justify-center gap-3 bg-gradient-to-r from-gray-900 to-gray-800 text-white px-10 py-5 rounded-2xl text-xl font-bold shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95 mb-10"
            >
              <ShoppingCart size={24} /> {t("Add to cart")}
            </button>

            <div className="bg-rose-50/50 border border-rose-100 rounded-[1.5rem] p-6 flex flex-col sm:flex-row items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3 text-rose-900">
                <Store size={24} className="text-rose-500" />
                <span className="font-bold text-lg">
                  {t("Seller Information")}
                </span>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <Link
                  to={`/seller/public/${product.seller_id}`}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-rose-200 text-rose-600 rounded-xl font-bold hover:bg-rose-50 transition-colors shadow-sm"
                >
                  <Store size={18} /> {t("Visit Seller")}
                </Link>
                <Link
                  to={`/chat/${product.seller_id}`}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-rose-500 to-orange-500 text-white rounded-xl font-bold hover:shadow-md transition-all"
                >
                  <MessageCircle size={18} /> {t("Chat with Seller")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-rose-50/50 py-16">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8">
          <h3 className="text-3xl font-extrabold text-gray-800 mb-10">
            {t("Related products")}
          </h3>
          <div className="grid gap-6 grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
            {relatedProducts.length === 0 ? (
              <p className="text-gray-500">{t("No related products found")}</p>
            ) : (
              relatedProducts.map((item) => (
                <Link
                  key={item.id}
                  to={`/product/${item.id}`}
                  className="bg-white rounded-2xl p-4 border border-gray-100 hover:border-rose-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 block"
                >
                  <div className="w-full aspect-square bg-gray-50 rounded-xl mb-4 p-2 overflow-hidden flex items-center justify-center">
                    <img
                      src={item.image || logo}
                      alt={item.name}
                      className="w-full h-full object-cover mix-blend-multiply rounded-lg"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = logo;
                      }}
                    />
                  </div>

                  {/* Related Product Rating added here too */}
                  <div className="flex items-center gap-1 mb-1">
                    <Star
                      size={12}
                      className="fill-yellow-400 text-yellow-400"
                    />
                    <span className="text-xs font-bold text-gray-500">
                      {item.avg_rating
                        ? parseFloat(item.avg_rating).toFixed(1)
                        : "5.0"}
                    </span>
                  </div>

                  <h4 className="font-bold text-gray-800 line-clamp-1 mb-1">
                    {item.name}
                  </h4>
                  <p className="text-rose-600 font-black">${item.price}</p>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
