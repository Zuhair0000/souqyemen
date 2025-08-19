import React from "react";
import { useState } from "react";
import { Outlet } from "react-router-dom";
import NavBar from "../../components/NavBar";
import Search from "../../components/Search";
import Icons from "../../components/Icons";

export default function CustomerLayout() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);

  return (
    <div>
      <NavBar setSelectedCategory={setSelectedCategory}>
        <Search setSearchQuery={setSearchQuery} />
        <Icons />
      </NavBar>
      <Outlet
        context={{ searchQuery, selectedCategory, setSelectedCategory }}
      />
    </div>
  );
}
