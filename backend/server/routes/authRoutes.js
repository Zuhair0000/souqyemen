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
// POST: /api/auth/register/request-otp
router.post("/register/request-otp", async (req, res) => {
  const { email } = req.body;

  try {
    // 1. Check if user already exists
    const [existingUser] = await db.query(
      "SELECT id FROM users WHERE email = ?",
      [email],
    );
    if (existingUser.length > 0) {
      return res.status(400).json({ message: "Email is already registered." });
    }

    // 2. Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 3. Save OTP to database (Insert or Update if they request again)
    await db.query(
      `INSERT INTO otp_verifications (email, otp, created_at) 
       VALUES (?, ?, NOW()) 
       ON DUPLICATE KEY UPDATE otp = ?, created_at = NOW()`,
      [email, otp, otp],
    );

    // 4. Send the Email
    const mailOptions = {
      from: `"Souq Yemen" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Souq Yemen Verification Code",
      html: `
        <h2>Welcome to Souq Yemen!</h2>
        <p>Your verification code is: <b style="font-size: 24px; color: #a22f29;">${otp}</b></p>
        <p>This code is valid for a short time. Please do not share it with anyone.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("OTP Error:", error);
    res.status(500).json({ message: "Failed to send OTP email" });
  }
});

router.post(
  "/register/seller",
  upload.fields([
    { name: "idPhoto", maxCount: 1 },
    { name: "selfieWithId", maxCount: 1 },
  ]),
  registerSeller,
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
  },
);

module.exports = router;
