const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../../config/db");

// ENV secret key or hardcoded for now
const JWT_SECRET =
  "8cbf7645a1e3b8723e1d5f934b8d7e614e6d77c8b798e3b257456bcd312f74c1";

exports.registerCustomer = async (req, res) => {
  const { name, emailOrPhone, password } = req.body;

  if (!name || !emailOrPhone || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `INSERT INTO users (name, email, password, role, status)
               VALUES (?, ?, ?, 'customer', 'approved')`;

    db.query(query, [name, emailOrPhone, hashedPassword], (err, result) => {
      if (err) {
        console.error("DB Error:", err);
        return res.status(500).json({ message: "Database error" });
      }
      res.status(201).json({ message: "Customer registered successfully" });
    });
  } catch (err) {
    res.status(500).json({ message: "Error while registering customer" });
  }
};

// Login (blocks unapproved sellers)
exports.login = async (req, res) => {
  const { emailOrPhone, password } = req.body;

  try {
    const [rows] = await db
      .promise()
      .query("SELECT * FROM users WHERE email = ? OR phone = ?", [
        emailOrPhone,
        emailOrPhone,
      ]);

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
