import React, { useEffect, useState } from "react";
import SellerNavBar from "../../components/SellerNavBar";
import BackButton from "../../components/BackButton";

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

  useEffect(() => {
    fetch("http://localhost:3001/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((err) => console.error("Error loading categories:", err));
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm({ ...form, [name]: name === "image" ? files[0] : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      formData.append(key, value);
    });

    try {
      const res = await fetch("http://localhost:3001/api/seller/products", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        alert("Product added successfully");
        setForm({
          name: "",
          description: "",
          price: "",
          stock: "",
          image: null,
          category: "",
        });
      } else {
        alert(data.error || "Failed to add product");
      }
    } catch (err) {
      console.error("Error adding product:", err);
    }
  };

  return (
    <>
      <div className="max-w-[1000px] mx-auto my-8 pr-5 py-5 bg-[#f4f1eb] rounded-xl">
        <BackButton />
        <h1 className="text-3xl font-bold mb-6 text-center">Add New Product</h1>
        <form
          onSubmit={handleSubmit}
          encType="multipart/form-data"
          className="flex flex-col gap-4 bg-white p-6 ml-5 rounded-lg border border-gray-300"
        >
          <input
            name="name"
            placeholder="Product Name"
            value={form.name}
            onChange={handleChange}
            required
            className="p-3 border border-gray-300 rounded-md text-lg"
          />
          <input
            name="stock"
            placeholder="Quantity"
            type="number"
            value={form.stock}
            onChange={handleChange}
            required
            className="p-3 border border-gray-300 rounded-md text-lg"
          />
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={handleChange}
            required
            className="p-2 border border-gray-300 rounded-md"
          />
          <textarea
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            required
            className="p-3 border border-gray-300 rounded-md text-lg resize-none"
            rows={4}
          />
          <input
            name="price"
            placeholder="Price"
            type="number"
            value={form.price}
            onChange={handleChange}
            required
            className="p-3 border border-gray-300 rounded-md text-lg"
          />
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            required
            className="p-3 border border-gray-300 rounded-md text-lg"
          >
            <option value="">-- Select Category --</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="bg-[#a22f29] text-white py-2 px-4 rounded-md text-lg cursor-pointer transition-colors duration-200 hover:bg-[#76201b]"
          >
            Add Product
          </button>
        </form>
      </div>
    </>
  );
}
