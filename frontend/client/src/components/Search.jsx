import React from "react";
import "./Search.css";

export default function Search({ setSearchQuery }) {
  return (
    <div className="navbar__search">
      <input
        type="text"
        placeholder="Search..."
        className="navbar__input"
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>
  );
}
