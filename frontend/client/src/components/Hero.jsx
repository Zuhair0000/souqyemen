import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function Hero({ promotions }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? promotions.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === promotions.length - 1 ? 0 : prev + 1));
  };

  if (!promotions || promotions.length === 0) {
    return (
      <div className="max-w-[900px] mx-auto my-6 px-4">
        <h2 className="text-xl font-semibold mb-4">Current Promotions</h2>
        <p>No promotions available.</p>
      </div>
    );
  }

  const post = promotions[currentIndex];

  return (
    <div className="max-w-[1500px] mx-auto my-6 px-4 py-5 relative bg-[#f4f1eb]">
      <h2 className="mb-8 text-2xl font-bold">Current Promotions</h2>

      <div className="relative">
        <Link
          to={`/promotions/${post.id}`}
          className="block cursor-pointer select-none"
        >
          {post.image ? (
            <img
              src={`http://localhost:3001/${post.image.replace(
                /^\/?uploads/,
                "uploads"
              )}`}
              alt={post.title}
              className="h-120 w-full max-w-[1000px] object-cover rounded-lg shadow-md mx-auto"
            />
          ) : (
            <div className="h-56 w-full max-w-[800px] bg-gray-300 flex items-center justify-center rounded-lg mx-auto">
              No Image
            </div>
          )}
          <h3 className="text-center mt-2 font-semibold">{post.title}</h3>
        </Link>

        {/* Left Arrow */}
        <button
          onClick={prevSlide}
          className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-white bg-opacity-75 rounded-full p-3 shadow hover:bg-opacity-100 transition"
          aria-label="Previous slide"
        >
          &#8592;
        </button>

        {/* Right Arrow */}
        <button
          onClick={nextSlide}
          className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-white bg-opacity-75 rounded-full p-3 shadow hover:bg-opacity-100 transition"
          aria-label="Next slide"
        >
          &#8594;
        </button>
      </div>
    </div>
  );
}
