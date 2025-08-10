import React, { useState, useEffect } from "react";
import NavBar from "../components/NavBar";
import CategoriesBar from "../components/CategoriesBar";
import Products from "../components/Products";
import Search from "../components/Search";
import Icons from "../components/Icons";

export default function HomePage({ selectedCategory, setSelectedCategory }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState([]);

  const fetchProductsByCategory = async (categoryId) => {
    try {
      const url = categoryId
        ? `http://localhost:3001/api/products/category/${categoryId}`
        : "http://localhost:3001/api/products";
      console.log("Fetching products from URL:", url); // Log URL
      const res = await fetch(url);
      const data = await res.json();
      console.log("Fetched data:", data); // Log fetched data
      setProducts(data);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  useEffect(() => {
    fetchProductsByCategory(selectedCategory);
  }, [selectedCategory]);

  const filterProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <NavBar setSelectedCategory={setSelectedCategory}>
        <Search setSearchQuery={setSearchQuery} />
        <Icons />
      </NavBar>
      <CategoriesBar onCategorySelect={setSelectedCategory} />
      <Products products={filterProducts} />
    </div>
  );
}
