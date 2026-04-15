const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const {
  authenticate,
  authorizeRoles,
} = require("../middleware/authMiddleware");

// Import Controllers
const dashboardController = require("../controller/seller/dashboardController");
const orderController = require("../controller/seller/orderController");
const postController = require("../controller/seller/postController");
const productsController = require("../controller/seller/productsController");
const messageController = require("../controller/seller/messageController");

// Public Route (No auth needed)
router.get("/public/:id", dashboardController.getPublicSellerProfile);
router.get("/sellers", dashboardController.getAllSellers);

router.use(authenticate, authorizeRoles("seller"));

// Dashboard & Sellers
router.get("/dashboard", dashboardController.getSellerAnalytics);

// Products (Mainly from Dashboard Controller for now, but editable via Product Controller)
router.post(
  "/products",
  upload.single("image"),
  dashboardController.addProduct,
);
router.get("/my-products", dashboardController.getMyProducts);
router.get("/products/:id", productsController.getProductById);
router.put("/edit-product/:id", productsController.editProduct);
router.delete("/products/:id", productsController.deleteProduct);

// Posts
router.post("/posts", upload.single("image"), postController.createPost);
router.get("/my-posts", postController.getMyPosts);
router.put("/posts/:id", upload.single("image"), postController.updatePost);
router.delete("/posts/:id", postController.deletePost);

// Orders, Tracking & Shipping
router.get("/orders", orderController.getSellerOrders);
router.put("/orders/:id/status", orderController.updateOrderStatus);
router.get("/delivery-companies", orderController.getDeliveryCompanies);
router.get("/orders/:id/tracking", orderController.getOrderTracking);

// Messages & Inbox
router.get("/inbox/:sellerId", messageController.getInbox);
router.get("/messages/:user1/:user2", messageController.getChatHistory);

module.exports = router;
