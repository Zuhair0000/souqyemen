import React from "react";

export default function Search({ setSearchQuery }) {
  return (
    <div className="absolute left-1/2 -translate-x-1/2 w-[30rem]">
      <input
        type="text"
        placeholder="Search..."
        className="w-full px-4 py-2 border border-gray-300 rounded-md text-base outline-none focus:border-[#a22f29] focus:ring-2 focus:ring-blue-200"
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>
  );
}
