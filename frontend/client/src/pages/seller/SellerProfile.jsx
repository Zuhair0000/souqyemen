import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import SellerNavBar from "../../components/SellerNavBar";
import logo from "../../assets/Logo.jpeg";
import NavBar from "../../components/NavBar";
import Icons from "../../components/Icons";
import BackButton from "../../components/BackButton";

export default function SellerProfile() {
  const { id } = useParams();
  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);

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
    <>
      {isSameSeller ? (
        <SellerNavBar />
      ) : (
        <NavBar>
          <Icons />
        </NavBar>
      )}

      <div className="px-5 py-10 max-w-[1200px] mx-auto mt-8 bg-[#f4f1eb] rounded-2xl shadow-md font-['Segoe_UI']">
        <BackButton />
        {seller && (
          <div className="flex flex-col items-center mb-10">
            <img
              src={logo}
              alt="Seller"
              className="w-[140px] h-[140px] rounded-full object-cover border-4 border-[#a22f29] mb-4"
            />
            <h2 className="text-[32px] font-bold my-2 text-[#333]">
              {seller.business_name}
            </h2>
            <p className="text-[16px] text-[#666] max-w-[600px] text-center mb-3">
              {seller.description}
            </p>

            {role === "customer" && (
              <Link to={`/chat/${seller.id}`}>
                <button className="bg-[#a22f29] text-white px-6 py-2 rounded-full cursor-pointer text-[16px] font-medium transition-colors duration-300 mt-3 hover:bg-[#831e1a]">
                  Contact seller
                </button>
              </Link>
            )}
          </div>
        )}

        <h3 className="text-[26px] font-semibold mb-7 text-[#333] text-center">
          Products
        </h3>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-7">
          {Array.isArray(products) &&
            products.map((product) => (
              <div
                className="border border-[#e5e5e5] rounded-xl overflow-hidden bg-white transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
                key={product.id}
              >
                <img
                  src={`http://localhost:3001${product.image}`}
                  alt={product.name}
                  className="w-full h-[180px] object-cover border-b border-[#eee]"
                />
                <h4 className="m-3 text-[18px] text-[#222] font-semibold">
                  {product.name}
                </h4>
                <p className="mx-3 mb-3 text-[16px] font-bold text-[#a22f29]">
                  ${parseFloat(product.price).toFixed(2)}
                </p>
              </div>
            ))}
        </div>
      </div>
    </>
  );
}
