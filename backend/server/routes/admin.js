const express = require("express");
const router = express.Router();

const {
  getPendingSellers,
  updateSellerStatus,
  getAllUsers,
  banUser,
  getAllProducts,
  deleteProduct,
  getAllOrders,
} = require("../controller/admin/authController");

const {
  authenticate,
  authorizeRoles,
} = require("../middleware/authMiddleware");

// Sellers
router.get(
  "/pending-sellers",
  authenticate,
  authorizeRoles("admin"),
  getPendingSellers
);
router.put(
  "/seller/:id/status",
  authenticate,
  authorizeRoles("admin"),
  updateSellerStatus
);

// Users
router.get("/users", authenticate, authorizeRoles("admin"), getAllUsers);
router.put("/users/:id/ban", authenticate, authorizeRoles("admin"), banUser);

// Products
router.get("/products", authenticate, authorizeRoles("admin"), getAllProducts);
router.delete(
  "/products/:id",
  authenticate,
  authorizeRoles("admin"),
  deleteProduct
);

// Orders
router.get("/orders", authenticate, authorizeRoles("admin"), getAllOrders);

module.exports = router;
