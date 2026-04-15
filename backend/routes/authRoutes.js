const express = require("express");
const router = express.Router();
const multer = require("multer");
const db = require("../config/db");
const nodemailer = require("nodemailer");

// --- NODEMAILER SETUP ---
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Simple in-memory storage for OTPs
const otpStore = {};

// --- CONTROLLER IMPORTS ---
const {
  registerCustomer,
  login,
  getProfile,
  updateProfile,
  changePassword,
  googleLogin,
} = require("../controller/customer/authController");

const { registerSeller } = require("../controller/seller/authController");

// ⚠️ Make sure this path points to wherever you saved the delivery controller!
const {
  registerCompany,
} = require("../controller/delivery/deliveryController");

const {
  authenticate,
  authorizeRoles,
} = require("../middleware/authMiddleware");

// --- MULTER SETUP ---
// We can use this exact same storage logic for BOTH sellers and delivery companies
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// ==========================================
//                 ROUTES
// ==========================================

// --- OTP VERIFICATION ROUTES ---
router.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[email] = { code: otp, expires: Date.now() + 5 * 60 * 1000 };

  try {
    await transporter.sendMail({
      from: '"SouqYemen Security" <no-reply@souqyemen.com>',
      to: email,
      subject: "Your SouqYemen Verification Code",
      html: `<h2>Welcome to SouqYemen!</h2><p>Your business verification code is: <b style="font-size:24px; color:#f43f5e;">${otp}</b></p><p>This code expires in 5 minutes.</p>`,
    });
    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Nodemailer Error:", error);
    res.status(500).json({ message: "Failed to send verification email" });
  }
});

router.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;
  const record = otpStore[email];

  if (!record) return res.status(400).json({ message: "No OTP requested." });
  if (Date.now() > record.expires) {
    delete otpStore[email];
    return res.status(400).json({ message: "OTP expired." });
  }
  if (record.code !== otp)
    return res.status(400).json({ message: "Invalid code." });

  delete otpStore[email];
  res.status(200).json({ message: "Email verified successfully" });
});

// --- REGISTRATION ROUTES ---
router.post("/register/customer", registerCustomer);
router.post("/google/login", googleLogin);

// Seller Registration
router.post(
  "/register/seller",
  upload.fields([
    { name: "idPhoto", maxCount: 1 },
    { name: "selfieWithId", maxCount: 1 },
  ]),
  registerSeller,
);

// NEW: Delivery Company Registration
router.post(
  "/register/shipping", // <-- Matches the endpoint in your React file
  upload.fields([
    { name: "idPhoto", maxCount: 1 },
    { name: "selfieWithId", maxCount: 1 },
  ]),
  registerCompany,
);

// --- ACCOUNT ROUTES ---
router.post("/login", login);
router.get("/profile", authenticate, getProfile);
router.put("/profile", authenticate, updateProfile);
router.put("/change-password", authenticate, changePassword);

// --- PROTECTED TEST ROUTES ---
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
  },
);

module.exports = router;
