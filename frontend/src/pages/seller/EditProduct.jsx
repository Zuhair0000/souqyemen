import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BackButton from "../../components/BackButton";
import { useTranslation } from "react-i18next";
import { UploadCloud, Tag, DollarSign, Archive, Type } from "lucide-react";

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [product, setProduct] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    image: "",
  });
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`https://souqyemen.store/api/products/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch product");
        const data = await res.json();
        setProduct(data.product);
        if (data.product.image)
          setPreview(`https://souqyemen.store${data.product.image}`);
      } catch (err) {
        alert(t("Failed to load product."));
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, t]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    // FIXED: Properly handle image files during edit
    if (name === "image" && files[0]) {
      setProduct({ ...product, image: files[0] });
      setPreview(URL.createObjectURL(files[0]));
    } else {
      setProduct({ ...product, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");

      // Changed to FormData because we are now supporting image file uploads on Edit!
      const formData = new FormData();
      Object.entries(product).forEach(([key, value]) =>
        formData.append(key, value),
      );

      const res = await fetch(
        `https://souqyemen.store/api/seller/edit-product/${id}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` }, // Removed application/json to let browser set multipart/form-data
          body: formData,
        },
      );

      if (!res.ok) throw new Error("Update failed");
      alert(t("Product updated!"));
      navigate("/seller/my-products");
    } catch (err) {
      alert(t("Failed to update product."));
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-xl text-blue-500 font-bold animate-pulse">
        {t("Loading product...")}
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50/40 via-orange-50/30 to-white pb-20 py-8">
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8">
        <BackButton />

        <div className="mb-8 mt-4">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            {t("Edit Product")}
          </h1>
          <p className="text-gray-500 font-medium mt-1">
            {t("Make changes to your catalog item.")}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          encType="multipart/form-data"
          className="flex flex-col lg:flex-row gap-8"
        >
          {/* Left Column: Image & Basics */}
          <div className="flex-1 space-y-6 text-start">
            <div className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                {t("Product Image")}
              </h3>
              <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-blue-200 rounded-2xl bg-blue-50/30 hover:bg-blue-50 cursor-pointer transition-colors relative overflow-hidden group">
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-full object-contain p-2 mix-blend-multiply"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-blue-500">
                    <UploadCloud size={48} className="mb-3" />
                    <p className="text-sm font-bold">{t("Update Image")}</p>
                  </div>
                )}
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleChange}
                  className="hidden"
                />
              </label>
            </div>

            <div className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-gray-100 space-y-5">
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                {t("Basic Info")}
              </h3>
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">
                  {t("Name")}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 start-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <Tag size={18} />
                  </div>
                  <input
                    name="name"
                    value={product.name}
                    onChange={handleChange}
                    required
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:bg-white outline-none transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">
                  {t("Description")}
                </label>
                <div className="relative">
                  <div className="absolute top-3 start-0 pl-4 pointer-events-none text-gray-400">
                    <Type size={18} />
                  </div>
                  <textarea
                    name="description"
                    value={product.description}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:bg-white outline-none transition-all resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Pricing & Stock */}
          <div className="w-full lg:w-[400px] space-y-6 text-start">
            <div className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-gray-100 space-y-5">
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                {t("Pricing & Inventory")}
              </h3>
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">
                  {t("Price")}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 start-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <DollarSign size={18} />
                  </div>
                  <input
                    name="price"
                    type="number"
                    step="0.01"
                    value={product.price}
                    onChange={handleChange}
                    required
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:bg-white outline-none transition-all font-bold text-blue-600"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">
                  {t("Stock")}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 start-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <Archive size={18} />
                  </div>
                  <input
                    name="stock"
                    type="number"
                    value={product.stock}
                    onChange={handleChange}
                    required
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:bg-white outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all active:scale-95"
            >
              {t("Update Product")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
