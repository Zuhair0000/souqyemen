import HomePage from "./pages/HomePage";
import "./index.css";
import { Route, Routes } from "react-router-dom";
import ProductDetail from "./pages/ProductDetail";
import { useState } from "react";
import ScrollToTop from "./components/ScrollToTop";
import SignUpCustomer from "./pages/SignUpCustomer";
import Login from "./pages/Login";
import SignUpSeller from "./pages/SignUpSeller";
import Profile from "./pages/Profile";
import MyOrders from "./pages/MyOrders";
import { Settings } from "lucide-react";
import Cart from "./pages/Cart";
import SellerDashboard from "./pages/SellerDashboard";
import MyProducts from "./pages/MyProducts";
import AddProduct from "./pages/AddProduct";
import EditProduct from "./pages/EditProduct";
import SellerOrders from "./pages/SellerOrders";
import SellerProfile from "./pages/SellerProfile";
import ChatBox from "./components/ChatBox";
import SellerInbox from "./components/SellerInbox";
import AdminDashboard from "./pages/admin/AdminDashboard";
import SellerPosts from "./pages/SellerPosts";
import PromotionsFeed from "./pages/PromotionsFeed";

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
        <Route path="/settings" element={<Settings />} />
        <Route path="/cart" element={<Cart />} />
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
      </Routes>
    </>
  );
}

export default App;
