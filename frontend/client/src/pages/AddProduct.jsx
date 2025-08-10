import React, { useEffect, useState } from "react";
import SellerNavBar from "../components/SellerNavBar";
import "./AddProduct.css";

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
      <SellerNavBar />
      <div className="add-product-page">
        <h1 className="page-title">Add New Product</h1>
        <form
          className="add-product-form"
          onSubmit={handleSubmit}
          encType="multipart/form-data"
        >
          <input
            name="name"
            placeholder="Product Name"
            value={form.name}
            onChange={handleChange}
            required
          />
          <input
            name="stock"
            placeholder="Quantity"
            type="number"
            value={form.stock}
            onChange={handleChange}
            required
          />
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={handleChange}
            required
          />
          <textarea
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            required
          />
          <input
            name="price"
            placeholder="Price"
            type="number"
            value={form.price}
            onChange={handleChange}
            required
          />
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            required
          >
            <option value="">-- Select Category --</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <button type="submit">Add Product</button>
        </form>
      </div>
    </>
  );
}
