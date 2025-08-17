import React from "react";

export default function Search({ setSearchQuery }) {
  return (
    <div
      className="
        w-[90%] md:w-[30rem]
        mb-4 md:mb-0
        mx-auto
        md:absolute md:left-1/2 md:-translate-x-1/2
      "
    >
      <input
        type="text"
        placeholder="Search..."
        className="w-full px-4 py-2 border border-gray-300 rounded-md text-base outline-none 
                   focus:border-[#a22f29] focus:ring-2 focus:ring-blue-200"
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>
  );
}
