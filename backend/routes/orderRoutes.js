// routes/orderRoutes.js
const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { authenticate } = require("../middleware/authMiddleware");
const {
  checkout,
  completeOrder,
} = require("../controller/customer/orderController");

// Checkout route
router.post("/checkout", authenticate, checkout);
router.put("/user/orders/:id/complete", authenticate, completeOrder);

module.exports = router;
