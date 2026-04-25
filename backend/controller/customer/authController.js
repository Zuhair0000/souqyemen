const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../../config/db");
const nodemailer = require("nodemailer");
const { OAuth2Client } = require("google-auth-library");

// 1. Setup Google Client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// 2. Setup Email Transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
// ENV secret key or hardcoded for now
const JWT_SECRET =
  "8cbf7645a1e3b8723e1d5f934b8d7e614e6d77c8b798e3b257456bcd312f74c1";

exports.registerCustomer = async (req, res) => {
  const { name, email, password, otp } = req.body;

  // 1. Log the incoming request to see what React actually sent!
  console.log("INCOMING CUSTOMER REGISTRATION:", {
    name,
    email,
    password,
    otp,
  });

  // 2. Make sure OTP is required before hitting the database
  if (!name || !email || !password || !otp) {
    return res.status(400).json({ message: "All fields and OTP are required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO users (name, email, password, role, status)
      VALUES (?, ?, ?, 'customer', 'approved')
    `;

    await db.query(query, [name, email, hashedPassword]);

    return res.status(201).json({
      success: true,
      message: "Customer registered successfully",
    });
  } catch (error) {
    console.error("Register Error:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Email already exists" });
    }

    return res.status(500).json({ message: "Server error" });
  }
};

// Login (blocks unapproved sellers)
exports.login = async (req, res) => {
  const { emailOrPhone, password } = req.body;

  try {
    const [rows] = await db.query(
      "SELECT * FROM users WHERE email = ? OR phone = ?",
      [emailOrPhone, emailOrPhone],
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    if (user.role === "seller" && user.status !== "approved") {
      return res.status(403).json({
        message: "Your seller account is under review or was rejected",
      });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({
      token,
      role: user.role,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        business_name: user.business_name || null,
        id_photo: user.id_photo || null,
        selfie_with_id: user.selfie_with_id || null,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res
      .status(400)
      .json({ message: "Email and new password are required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const [result] = await db.query(
      "UPDATE users SET password = ? WHERE email = ?",
      [hashedPassword, email],
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "No account found with this email" });
    }

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getProfile = async (req, res) => {
  const userId = req.user.id;

  try {
    const [rows] = await db
      .promise()
      .query("SELECT * FROM users WHERE id = ?", [userId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = rows[0];
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      business_name: user.business_name || null,
      id_photo: user.id_photo || null,
      selfie_with_id: user.selfie_with_id || null,
    });
  } catch (error) {
    console.error("Get Profile Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateProfile = async (req, res) => {
  const userId = req.user.id;
  const { name, phone, businessName } = req.body;

  try {
    const query = `
      UPDATE users 
      SET name = ?, phone = ?, business_name = ?
      WHERE id = ?`;

    await db
      .promise()
      .query(query, [name, phone, businessName || null, userId]);

    res.json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.changePassword = async (req, res) => {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res
      .status(400)
      .json({ message: "Both current and new passwords are required" });
  }

  try {
    const [rows] = await db
      .promise()
      .query("SELECT password FROM users WHERE id = ?", [userId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect current password" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db
      .promise()
      .query("UPDATE users SET password = ? WHERE id = ?", [
        hashedPassword,
        userId,
      ]);

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Change Password Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.googleLogin = async (req, res) => {
  const { token } = req.body;

  try {
    // 1. Verify the token with Google
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    // Extract user info from Google
    const payload = ticket.getPayload();
    const googleEmail = payload.email;
    const googleName = payload.name;
    // const googlePhoto = payload.picture; // Optional: save their profile pic

    // 2. Check if user exists in your database
    let [users] = await db.query("SELECT * FROM users WHERE email = ?", [
      googleEmail,
    ]);
    let user = users[0];

    // 3. If user doesn't exist, Auto-Register them as a Customer!
    if (!user) {
      // Create a random secure password since they use Google
      const randomPassword = await bcrypt.hash(
        Math.random().toString(36).slice(-8),
        10,
      );

      const [insertResult] = await db.query(
        "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'customer')",
        [googleName, googleEmail, randomPassword],
      );

      // Fetch the newly created user
      const [newUsers] = await db.query("SELECT * FROM users WHERE id = ?", [
        insertResult.insertId,
      ]);
      user = newUsers[0];
    }

    // 4. Generate JWT Token for login
    const jwtToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || "your_super_secret_key",
      { expiresIn: "7d" },
    );

    // 5. Send successful response
    res.status(200).json({
      message: "Login successful",
      token: jwtToken,
      role: user.role,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status || "approved",
      },
    });
  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(401).json({ message: "Invalid Google Token" });
  }
};
