import HomePage from "./pages/customer/HomePage";
import "./index.css";
import { Route, Routes } from "react-router-dom";
import ProductDetail from "./pages/customer/ProductDetail";
import { useState } from "react";
import ScrollToTop from "./components/ScrollToTop";
import SignUpCustomer from "./pages/SignUpCustomer";
import Login from "./pages/Login";
import SignUpSeller from "./pages/SignUpSeller";
import Profile from "./pages/customer/Profile";
import MyOrders from "./pages/customer/MyOrders";
import Cart from "./pages/customer/Cart";
import SellerDashboard from "./pages/seller/SellerDashboard";
import MyProducts from "./pages/seller/MyProducts";
import AddProduct from "./pages/seller/AddProduct";
import EditProduct from "./pages/seller/EditProduct";
import SellerOrders from "./pages/seller/SellerOrders";
import SellerProfile from "./pages/seller/SellerProfile";
import ChatBox from "./components/ChatBox";
import SellerInbox from "./pages/seller/SellerInbox";
import AdminDashboard from "./pages/admin/AdminDashboard";
import SellerPosts from "./pages/seller/SellerPosts";
import PromotionsFeed from "./pages/customer/PromotionsFeed";
import PromotionDetails from "./pages/customer/PromotioDetail";
import SettingsPage from "./pages/Settings";
import Checkout from "./pages/customer/Checkout";

function App() {
  const [selectedCategory, setSelectedCategory] = useState(null);

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
            />
          }
        />
        <Route
          path="/product/:id"
          element={<ProductDetail setSelectedCategory={setSelectedCategory} />}
        />

        <Route path="/signup" element={<SignUpCustomer />} />
        <Route path="/signup-seller" element={<SignUpSeller />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/orders" element={<MyOrders />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/seller/dashboard" element={<SellerDashboard />} />
        <Route path="/seller/add-product" element={<AddProduct />} />
        <Route path="/seller/my-products" element={<MyProducts />} />
        {/* <Route path="/seller/orders" element={<Orders />} /> */}
        <Route path="/seller/edit-product/:id" element={<EditProduct />} />
        <Route path="/seller/orders/:id/status" element={<SellerOrders />} />
        <Route path="/seller/public/:id" element={<SellerProfile />} />
        <Route path="/chat/:id" element={<ChatBox />} />
        <Route path="/seller/inbox" element={<SellerInbox />} />
        <Route path="/seller/chat/:id" element={<ChatBox />} />
        <Route path="/admin/pending-sellers" element={<AdminDashboard />} />
        <Route path="/seller/posts" element={<SellerPosts />} />
        <Route path="/promotions" element={<PromotionsFeed />} />
        <Route path="/promotions/:id" element={<PromotionDetails />} />
      </Routes>
    </>
  );
}

export default App;
