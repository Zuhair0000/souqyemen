import React, { useEffect, useState } from "react";
import BackButton from "../../components/BackButton";
import { useTranslation } from "react-i18next";
import {
  UploadCloud,
  Tag,
  DollarSign,
  Layers,
  Archive,
  Type,
} from "lucide-react";

export default function AddProduct() {
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    image: null,
    category: "",
  });
  const [categories, setCategories] = useState([]);
  const [preview, setPreview] = useState(null);
  const { t } = useTranslation();

  useEffect(() => {
    fetch("https://souqyemen.store/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((err) => console.error("Error loading categories:", err));
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image" && files[0]) {
      setForm({ ...form, image: files[0] });
      setPreview(URL.createObjectURL(files[0])); // Show image preview
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => formData.append(key, value));

    try {
      const res = await fetch("https://souqyemen.store/api/seller/products", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        alert(t("Product added successfully"));
        setForm({
          name: "",
          description: "",
          price: "",
          stock: "",
          image: null,
          category: "",
        });
        setPreview(null);
      } else {
        alert(data.error || t("Failed to add product"));
      }
    } catch (err) {
      console.error("Error adding product:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50/40 via-orange-50/30 to-white pb-20 py-8">
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8">
        <BackButton />

        <div className="mb-8 mt-4">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            {t("Add New Product")}
          </h1>
          <p className="text-gray-500 font-medium mt-1">
            {t("Fill in the details to publish your item to the catalog.")}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          encType="multipart/form-data"
          className="flex flex-col lg:flex-row gap-8"
        >
          {/* Left Column: Image Upload & Basics */}
          <div className="flex-1 space-y-6 text-start">
            <div className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                {t("Product Image")}
              </h3>
              <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-rose-200 rounded-2xl bg-rose-50/30 hover:bg-rose-50 cursor-pointer transition-colors relative overflow-hidden group">
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-full object-contain p-2"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6 text-rose-500 group-hover:scale-110 transition-transform">
                    <UploadCloud size={48} className="mb-3" />
                    <p className="text-sm font-bold">
                      {t("Click to upload image")}
                    </p>
                    <p className="text-xs text-rose-400 mt-1">
                      PNG, JPG up to 5MB
                    </p>
                  </div>
                )}
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleChange}
                  required
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
                  {t("Product Name")}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 start-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <Tag size={18} />
                  </div>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-400 focus:bg-white outline-none transition-all"
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
                    value={form.description}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-400 focus:bg-white outline-none transition-all resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Pricing & Category */}
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
                    value={form.price}
                    onChange={handleChange}
                    required
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-400 focus:bg-white outline-none transition-all font-bold text-rose-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">
                  {t("Stock Quantity")}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 start-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <Archive size={18} />
                  </div>
                  <input
                    name="stock"
                    type="number"
                    value={form.stock}
                    onChange={handleChange}
                    required
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-400 focus:bg-white outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">
                  {t("Category")}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 start-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <Layers size={18} />
                  </div>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    required
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-400 focus:bg-white outline-none transition-all appearance-none"
                  >
                    <option value="">{t("-- Select Category --")}</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {t(cat.name)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-rose-500 to-orange-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all active:scale-95"
            >
              {t("Publish Product")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
