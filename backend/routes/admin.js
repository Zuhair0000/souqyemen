const express = require("express");
const router = express.Router();

const {
  getPendingPartners,
  updatePartnerStatus,
  getAllUsers,
  banUser,
  unbanUser,
  getAllProducts,
  deleteProduct,
  getAllOrders,
  generateReport,
} = require("../controller/admin/authController");

const {
  authenticate,
  authorizeRoles,
} = require("../middleware/authMiddleware");

// ==========================================
//           PARTNERS (Sellers & Delivery)
// ==========================================
router.get(
  "/pending-partners", // <-- Updated endpoint
  authenticate,
  authorizeRoles("admin"),
  getPendingPartners,
);

router.put(
  "/partner/:id/status", // <-- Updated endpoint
  authenticate,
  authorizeRoles("admin"),
  updatePartnerStatus,
);

// ==========================================
//                 USERS
// ==========================================
router.get("/users", authenticate, authorizeRoles("admin"), getAllUsers);

router.put("/users/:id/ban", authenticate, authorizeRoles("admin"), banUser);
router.put(
  "/users/:id/unban",
  authenticate,
  authorizeRoles("admin"),
  unbanUser,
);

// ==========================================
//                PRODUCTS
// ==========================================
router.get("/products", authenticate, authorizeRoles("admin"), getAllProducts);

router.delete(
  "/products/:id",
  authenticate,
  authorizeRoles("admin"),
  deleteProduct,
);

// ==========================================
//                 ORDERS
// ==========================================
router.get("/orders", authenticate, authorizeRoles("admin"), getAllOrders);

// ==========================================
//                REPORTS
// ==========================================
router.get("/report", authenticate, authorizeRoles("admin"), generateReport);

module.exports = router;
