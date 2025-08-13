import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SellerNavBar from "../../components/SellerNavBar";

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    image: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:3001/api/products/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch product");

        const data = await res.json();
        console.log(data);
        setProduct(data.product);
      } catch (err) {
        console.error("Fetch error:", err);
        alert("Failed to load product.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:3001/api/seller/edit-product/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(product),
        }
      );

      if (!res.ok) throw new Error("Update failed");

      alert("Product updated!");
      navigate("/seller/my-products");
    } catch (err) {
      console.error("Update error:", err);
      alert("Failed to update product.");
    }
  };

  if (loading) return <p>Loading product...</p>;

  return (
    <>
      <SellerNavBar />
      <div className="max-w-2xl mx-auto p-8">
        <h2 className="text-2xl font-semibold mb-6">Edit Product</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <label className="block">
            Name:
            <input
              name="name"
              value={product.name}
              onChange={handleChange}
              required
              className="w-full mt-1 p-2 border border-gray-300 rounded"
            />
          </label>

          <label className="block">
            Description:
            <textarea
              name="description"
              value={product.description}
              onChange={handleChange}
              required
              className="w-full mt-1 p-2 border border-gray-300 rounded"
            />
          </label>

          <label className="block">
            Price:
            <input
              name="price"
              type="number"
              step="0.01"
              value={product.price}
              onChange={handleChange}
              required
              className="w-full mt-1 p-2 border border-gray-300 rounded"
            />
          </label>

          <label className="block">
            Stock:
            <input
              name="stock"
              type="number"
              value={product.stock}
              onChange={handleChange}
              required
              className="w-full mt-1 p-2 border border-gray-300 rounded"
            />
          </label>

          <label className="block">
            Image:
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
              required
              className="w-full mt-1 p-2 border border-gray-300 rounded"
            />
          </label>

          <button
            type="submit"
            className="mt-4 px-4 py-2 bg-red-900 text-white rounded hover:bg-red-800 transition"
          >
            Update Product
          </button>
        </form>
      </div>
    </>
  );
}
