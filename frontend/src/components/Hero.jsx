import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export default function Hero({ promotions }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { t } = useTranslation();

  useEffect(() => {
    if (!promotions || promotions.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) =>
        prev === promotions.length - 1 ? 0 : prev + 1,
      );
    }, 5000);
    return () => clearInterval(interval);
  }, [promotions]);

  const prevSlide = () =>
    setCurrentIndex((prev) => (prev === 0 ? promotions.length - 1 : prev - 1));
  const nextSlide = () =>
    setCurrentIndex((prev) => (prev === promotions.length - 1 ? 0 : prev + 1));

  if (!promotions || promotions.length === 0) return null;

  const post = promotions[currentIndex];

  return (
    <div className="max-w-[1600px] mx-auto my-10 px-4">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 tracking-tight">
          {t("Current Promotions")}
          <span className="block h-1.5 w-24 bg-gradient-to-r from-rose-500 to-orange-400 mt-3 rounded-full"></span>
        </h2>
      </div>

      <div className="relative group">
        {/* Glowing background effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-rose-500 via-purple-500 to-orange-500 rounded-[2rem] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>

        <div className="relative overflow-hidden rounded-[2rem] bg-white shadow-xl ring-1 ring-gray-900/5">
          <Link to={`/promotions/${post.id}`} className="block">
            {post.image ? (
              <img
                src={
                  post.image.startsWith("http")
                    ? post.image.replace(
                        "https://souqyemen.store",
                        "https://souqyemen.store",
                      )
                    : `https://souqyemen.store${post.image.startsWith("/") ? "" : "/"}${post.image}`
                }
                alt={post.title}
                className="h-72 md:h-[450px] w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              />
            ) : (
              <div className="h-72 md:h-[450px] w-full bg-gradient-to-br from-rose-50 to-orange-50 flex items-center justify-center">
                <span className="text-gray-400 font-medium text-lg">
                  {t("No Image")}
                </span>
              </div>
            )}

            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-gray-900/90 via-gray-900/50 to-transparent p-6 md:p-10 text-white">
              <h3 className="text-2xl md:text-4xl font-black drop-shadow-lg transform transition-transform duration-500 group-hover:-translate-y-2">
                {post.title}
              </h3>
            </div>
          </Link>

          {promotions.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute top-1/2 start-6 transform -translate-y-1/2 bg-white/80 backdrop-blur-md text-rose-600 rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:bg-rose-500 hover:text-white hover:scale-110 transition-all duration-300"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 19l-7-7 7-7"
                  ></path>
                </svg>
              </button>
              <button
                onClick={nextSlide}
                className="absolute top-1/2 end-6 transform -translate-y-1/2 bg-white/80 backdrop-blur-md text-rose-600 rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:bg-rose-500 hover:text-white hover:scale-110 transition-all duration-300"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  ></path>
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
