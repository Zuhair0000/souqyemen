import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import SellerNavBar from "../../components/SellerNavBar";
import logo from "../../assets/Logo.jpeg";
import NavBar from "../../components/NavBar";
import Icons from "../../components/Icons";
import BackButton from "../../components/BackButton";
import { useTranslation } from "react-i18next";
import { MessageCircle, Store, PackageSearch } from "lucide-react";

export default function SellerProfile() {
  const { id } = useParams();
  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const { t } = useTranslation();

  const user = JSON.parse(localStorage.getItem("user"));
  const role = localStorage.getItem("role");
  const loggedInUserId = user?.id;

  useEffect(() => {
    const fetchSeller = async () => {
      const res = await fetch(`http://localhost:3001/api/seller/public/${id}`);
      const data = await res.json();
      setSeller(data.seller);
      setProducts(data.products);
    };
    fetchSeller();
  }, [id]);

  const isSameSeller = role === "seller" && loggedInUserId === parseInt(id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50/40 via-orange-50/30 to-white pb-20 flex flex-col">
      {isSameSeller ? (
        <SellerNavBar />
      ) : (
        <NavBar>
          <Icons />
        </NavBar>
      )}

      <div className="flex-1 max-w-[1300px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BackButton />

        {seller && (
          <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden mb-12 mt-4">
            {/* Store Banner (Solid Vibrant Color) */}
            <div className="h-32 md:h-48 bg-[#a22f29] w-full relative"></div>

            {/* Store Info Container */}
            <div className="px-6 md:px-12 pb-8 md:pb-12 relative flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start text-center md:text-start">
              {/* Floating Avatar */}
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-white p-2 shadow-lg -mt-16 md:-mt-20 z-10 shrink-0">
                <div className="w-full h-full rounded-full bg-gray-50 flex items-center justify-center overflow-hidden">
                  <img
                    src={logo}
                    alt="Seller"
                    className="w-full h-full object-cover mix-blend-multiply"
                  />
                </div>
              </div>

              <div className="flex-1 mt-2 md:mt-4">
                <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">
                  {seller.business_name}
                </h2>
                <p className="text-gray-600 text-lg leading-relaxed max-w-2xl">
                  {seller.description || t("Welcome to our store!")}
                </p>
              </div>

              {/* Action Button */}
              {role === "customer" && (
                <div className="mt-4 md:mt-8 w-full md:w-auto">
                  <Link to={`/chat/${seller.id}`}>
                    <button className="w-full md:w-auto flex items-center justify-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-gray-800 shadow-md transition-all active:scale-95">
                      <MessageCircle size={20} />
                      {t("Contact seller")}
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Products Section */}
        <div className="mb-6 flex items-center gap-3">
          <Store size={28} className="text-[#a22f29]" />
          <h3 className="text-3xl font-black text-gray-900">{t("Products")}</h3>
        </div>

        {!products || products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[2rem] border border-gray-100 shadow-sm flex flex-col items-center">
            <PackageSearch size={64} className="text-gray-300 mb-4" />
            <p className="text-2xl font-bold text-gray-600">
              {t("No products found")}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {products.map((product) => (
              <Link
                to={`/product/${product.id}`}
                key={product.id}
                className="bg-white border border-gray-100 rounded-[1.5rem] p-4 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 outline-none block text-start group"
              >
                <div className="w-full aspect-square bg-gray-50 rounded-xl mb-4 overflow-hidden flex items-center justify-center p-2">
                  <img
                    src={`http://localhost:3001${product.image}`}
                    alt={product.name}
                    className="w-full h-full object-cover mix-blend-multiply rounded-lg group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <h4 className="text-lg font-bold text-gray-800 line-clamp-1 mb-1 group-hover:text-[#a22f29] transition-colors">
                  {product.name}
                </h4>
                <p className="text-xl font-black text-[#a22f29]">
                  ${parseFloat(product.price).toFixed(2)}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
