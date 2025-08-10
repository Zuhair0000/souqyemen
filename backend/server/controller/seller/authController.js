const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../../config/db");

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

// Seller Registration
exports.registerSeller = async (req, res) => {
  const { businessName, fullName, email, password, phoneNumber } = req.body;

  if (
    !businessName ||
    !fullName ||
    !email ||
    !password ||
    !phoneNumber ||
    !req.files
  ) {
    return res
      .status(400)
      .json({ message: "All fields and files are required" });
  }

  const idPhoto = req.files.idPhoto?.[0]?.filename;
  const selfieWithId = req.files.selfieWithId?.[0]?.filename;

  if (!idPhoto || !selfieWithId) {
    return res
      .status(400)
      .json({ message: "ID Photo and Selfie are required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `INSERT INTO users (business_name, name, email, password, phone, id_photo, selfie_with_id, role, status)
                   VALUES (?, ?, ?, ?, ?, ?, ?, 'seller', 'pending')`;

    db.query(
      query,
      [
        businessName,
        fullName,
        email,
        hashedPassword,
        phoneNumber,
        idPhoto,
        selfieWithId,
      ],
      (err) => {
        if (err) {
          console.error("DB Error:", err);
          return res.status(500).json({ message: "Database error" });
        }
        res.status(201).json({ message: "Seller submitted for approval" });
      }
    );
  } catch (err) {
    res.status(500).json({ message: "Error while registering seller" });
  }
};

// Seller Profile
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

// Update seller profile
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

// Change Password
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
