const express = require("express");
const router = express.Router();
const multer = require("multer");
const db = require("../config/db");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const otpStore = {};

const {
  registerCustomer,
  login,
  getProfile,
  updateProfile,
  changePassword,
  googleLogin,
  resetPassword,
} = require("../controller/customer/authController");

const { registerSeller } = require("../controller/seller/authController");

const {
  registerCompany,
} = require("../controller/delivery/deliveryController");

const {
  authenticate,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

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

router.post("/register/customer", registerCustomer);
router.post("/google/login", googleLogin);

router.post(
  "/register/seller",
  upload.fields([
    { name: "idPhoto", maxCount: 1 },
    { name: "selfieWithId", maxCount: 1 },
  ]),
  registerSeller,
);

router.post(
  "/register/shipping",
  upload.fields([
    { name: "idPhoto", maxCount: 1 },
    { name: "selfieWithId", maxCount: 1 },
  ]),
  registerCompany,
);

router.post("/login", login);
router.post("/reset-password", resetPassword);
router.get("/profile", authenticate, getProfile);
router.put("/profile", authenticate, updateProfile);
router.put("/change-password", authenticate, changePassword);

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
