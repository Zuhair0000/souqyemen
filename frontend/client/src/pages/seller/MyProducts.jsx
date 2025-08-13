import React, { useEffect, useState } from "react";
import SellerNavBar from "../../components/SellerNavBar";
import { useNavigate } from "react-router-dom";
import BackButton from "../../components/BackButton";

const MyProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3001/api/seller/my-products", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        throw new Error("Unauthorized");
      }
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("Error fetching products:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:3001/api/seller/products/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) throw new Error("Failed to delete");
      setProducts((prev) => prev.filter((product) => product.id !== id));
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete the product.");
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <SellerNavBar />
      <div className="max-w-[1200px] mx-auto px-8 py-8 bg-[#f4f1eb] mt-8">
        <BackButton />
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
          My Products
        </h2>

        <div className="flex justify-center mb-8">
          <input
            type="text"
            placeholder="Search products..."
            className="w-full max-w-md px-4 py-2 border bg-white border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {loading ? (
          <p className="text-center">Loading...</p>
        ) : filteredProducts.length === 0 ? (
          <p className="text-center text-gray-600">No products found.</p>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 list-none">
            {filteredProducts.map((product) => (
              <li
                key={product.id}
                className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm transition transform hover:-translate-y-1 hover:shadow-lg"
              >
                <img
                  src={`http://localhost:3001${product.image}`}
                  alt={product.name}
                  className="w-full max-w-[200px] h-auto rounded-lg mb-4 object-cover"
                />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {product.name}
                </h3>
                <p className="mb-1">Price: ${product.price}</p>
                <p className="mb-4 text-gray-700">{product.description}</p>

                <div className="flex gap-3">
                  <button
                    className="flex-1 bg-blue-600 text-white py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition"
                    onClick={() =>
                      navigate(`/seller/edit-product/${product.id}`)
                    }
                  >
                    Edit
                  </button>
                  <button
                    className="flex-1 bg-red-500 text-white py-2 rounded-md text-sm font-medium hover:bg-red-600 transition"
                    onClick={() => handleDelete(product.id)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
};

export default MyProducts;
