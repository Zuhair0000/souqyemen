const express = require("express");
const router = express.Router();
const multer = require("multer");

const {
  registerCustomer,
  login,
  getProfile,
  updateProfile,
  changePassword,
} = require("../controller/customer/authController");

const { registerSeller } = require("../controller/seller/authController");

const {
  authenticate,
  authorizeRoles,
} = require("../middleware/authMiddleware");

// Multer setup for seller registration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// Customer and Seller registration
router.post("/register/customer", registerCustomer);
router.post(
  "/register/seller",
  upload.fields([
    { name: "idPhoto", maxCount: 1 },
    { name: "selfieWithId", maxCount: 1 },
  ]),
  registerSeller
);

router.post("/login", login);

// Profile management
router.get("/profile", authenticate, getProfile);
router.put("/profile", authenticate, updateProfile);
router.put("/change-password", authenticate, changePassword);

// Role-protected routes for testing
router.get("/protected", authenticate, (req, res) => {
  res.json({ message: `Hello ${req.user.role}, access granted!` });
});

router.get("/admin-only", authenticate, authorizeRoles("admin"), (req, res) => {
  res.json({ message: "Welcome Admin! 🔐" });
});

router.get(
  "/seller-only",
  authenticate,
  authorizeRoles("seller"),
  (req, res) => {
    res.json({ message: "Welcome Seller! 🛍️" });
  }
);

module.exports = router;
