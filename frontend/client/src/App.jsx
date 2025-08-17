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
import Inbox from "./pages/Inbox";
import AdminDashboard from "./pages/admin/AdminDashboard";
import SellerPosts from "./pages/seller/SellerPosts";
import PromotionsFeed from "./pages/customer/PromotionsFeed";
import PromotionDetails from "./pages/customer/PromotioDetail";
import SettingsPage from "./pages/Settings";
import Checkout from "./pages/customer/Checkout";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const [selectedCategory, setSelectedCategory] = useState(null);

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/product/:id"
          element={<ProductDetail setSelectedCategory={setSelectedCategory} />}
        />

        <Route path="/signup" element={<SignUpCustomer />} />
        <Route path="/signup-seller" element={<SignUpSeller />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <MyOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          }
        />
        <Route path="/checkout" element={<Checkout />} />
        <Route
          path="/seller/dashboard"
          element={
            <ProtectedRoute>
              <SellerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller/add-product"
          element={
            <ProtectedRoute>
              <AddProduct />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller/my-products"
          element={
            <ProtectedRoute>
              <MyProducts />
            </ProtectedRoute>
          }
        />
        {/* <Route path="/seller/orders" element={<Orders />} /> */}
        <Route
          path="/seller/edit-product/:id"
          element={
            <ProtectedRoute>
              <EditProduct />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller/orders/:id/status"
          element={
            <ProtectedRoute>
              <SellerOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller/public/:id"
          element={
            <ProtectedRoute>
              <SellerProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat/:id"
          element={
            <ProtectedRoute>
              <ChatBox />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller/inbox"
          element={
            <ProtectedRoute>
              <Inbox />
            </ProtectedRoute>
          }
        />
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
