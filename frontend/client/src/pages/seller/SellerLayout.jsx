import React from "react";
import { Outlet } from "react-router-dom";
import SellerNavBar from "../../components/SellerNavBar";

export default function SellerLayout() {
  return (
    <div>
      <SellerNavBar />
      <Outlet />
    </div>
  );
}
