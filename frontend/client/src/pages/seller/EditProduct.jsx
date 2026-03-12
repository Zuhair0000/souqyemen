import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SellerNavBar from "../../components/SellerNavBar";
import { useTranslation } from "react-i18next"; // Added import

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation(); // Initialize translation hook

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
        setProduct(data.product);
      } catch (err) {
        console.error("Fetch error:", err);
        alert(t("Failed to load product.")); // Translated alert
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, t]);

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
        },
      );

      if (!res.ok) throw new Error("Update failed");

      alert(t("Product updated!")); // Translated alert
      navigate("/seller/my-products");
    } catch (err) {
      console.error("Update error:", err);
      alert(t("Failed to update product.")); // Translated alert
    }
  };

  if (loading) return <p>{t("Loading product...")}</p>;

  return (
    <>
      <div className="max-w-2xl mx-auto p-8">
        <h2 className="text-2xl font-semibold mb-6">{t("Edit Product")}</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <label className="block">
            {t("Name")}:
            <input
              name="name"
              value={product.name}
              onChange={handleChange}
              required
              className="w-full mt-1 p-2 border border-gray-300 rounded"
            />
          </label>

          <label className="block">
            {t("Description")}:
            <textarea
              name="description"
              value={product.description}
              onChange={handleChange}
              required
              className="w-full mt-1 p-2 border border-gray-300 rounded"
            />
          </label>

          <label className="block">
            {t("Price")}:
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
            {t("Stock")}:
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
            {t("Image")}:
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
              className="w-full mt-1 p-2 border border-gray-300 rounded"
            />
          </label>

          <button
            type="submit"
            className="mt-4 px-4 py-2 bg-red-900 text-white rounded hover:bg-red-800 transition"
          >
            {t("Update Product")}
          </button>
        </form>
      </div>
    </>
  );
}
