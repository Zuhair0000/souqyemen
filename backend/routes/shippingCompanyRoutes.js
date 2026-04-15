// backend/routes/shippingCompanyRoutes.js
const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/authMiddleware");
const deliveryController = require("../controller/delivery/deliveryController");
const upload = require("../middleware/upload");

// AUTHENTICATION
router.post(
  "/register",
  upload.fields([
    { name: "idPhoto", maxCount: 1 },
    { name: "selfieWithId", maxCount: 1 },
  ]),
  deliveryController.registerCompany,
);
// Get all active assigned orders
router.get("/orders", authenticate, deliveryController.getActiveOrders);

// Add a tracking update to an order
router.post(
  "/orders/:id/tracking",
  authenticate,
  deliveryController.addTrackingUpdate,
);

// Mark an order as delivered
router.put(
  "/orders/:id/deliver",
  authenticate,
  deliveryController.markAsDelivered,
);

// Get order history (completed/past orders)
router.get("/history", authenticate, deliveryController.getOrderHistory);

module.exports = router;
