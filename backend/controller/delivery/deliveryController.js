// backend/controller/delivery/deliveryController.js
const db = require("../../config/db");
const bcrypt = require("bcrypt");

exports.registerCompany = async (req, res) => {
  try {
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

    const idPhotoPath = req.files["idPhoto"]
      ? `/uploads/${req.files["idPhoto"][0].filename}`
      : null;
    const selfiePath = req.files["selfieWithId"]
      ? `/uploads/${req.files["selfieWithId"][0].filename}`
      : null;

    if (!idPhotoPath || !selfiePath) {
      return res
        .status(400)
        .json({ message: "ID Photo and Selfie are required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [userResult] = await db.query(
      `INSERT INTO users (name, email, password, phone, role, status) VALUES (?, ?, ?, ?, 'delivery', 'pending')`,
      [fullName, email, hashedPassword, phoneNumber],
    );
    const userId = userResult.insertId;

    await db.query(
      `INSERT INTO delivery_companies (name, contact_info, user_id, id_photo, selfie_photo) VALUES (?, ?, ?, ?, ?)`,
      [businessName, phoneNumber, userId, idPhotoPath, selfiePath],
    );

    res
      .status(201)
      .json({ message: "Delivery company submitted for approval" });
  } catch (error) {
    console.error("Delivery Registration Error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
};

exports.getActiveOrders = async (req, res) => {
  try {
    const [companyData] = await db.query(
      "SELECT id FROM delivery_companies WHERE user_id = ?",
      [req.user.id],
    );

    if (companyData.length === 0) {
      return res.status(403).json({ message: "Not a delivery company" });
    }

    const companyId = companyData[0].id;

    const [orders] = await db.query(
      `SELECT 
        o.id, o.status, o.total, o.payment_method, 
        u.name as customer_name, u.phone as customer_phone, u.address as customer_location
      FROM orders o
      JOIN users u ON o.customer_id = u.id
      WHERE o.delivery_company_id = ? AND o.status IN ('shipped', 'out_for_delivery', 'delivered')
      ORDER BY o.id DESC`,
      [companyId],
    );

    if (orders.length === 0) return res.json([]);

    const orderIds = orders.map((order) => order.id);

    const [allTracking] = await db.query(
      "SELECT order_id, update_text, created_at FROM tracking_updates WHERE order_id IN (?) ORDER BY created_at ASC",
      [orderIds],
    );

    const trackingMap = {};
    allTracking.forEach((track) => {
      if (!trackingMap[track.order_id]) trackingMap[track.order_id] = [];
      trackingMap[track.order_id].push({
        update_text: track.update_text,
        created_at: track.created_at,
      });
    });

    orders.forEach((order) => {
      order.tracking = trackingMap[order.id] || [];
    });

    res.json(orders);
  } catch (error) {
    console.error("Error fetching delivery orders:", error);
    res.status(500).json({ message: "Server error fetching delivery orders" });
  }
};

// Add a tracking update
exports.addTrackingUpdate = async (req, res) => {
  const orderId = req.params.id;
  const { update_text } = req.body;

  try {
    await db.query(
      "INSERT INTO tracking_updates (order_id, update_text) VALUES (?, ?)",
      [orderId, update_text],
    );

    // Automatically change status from shipped to out_for_delivery on first update
    await db.query(
      `UPDATE orders SET status = 'out_for_delivery' WHERE id = ? AND status = 'shipped'`,
      [orderId],
    );

    res.json({ message: "Tracking updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error updating tracking" });
  }
};

// Mark order as Delivered
exports.markAsDelivered = async (req, res) => {
  const orderId = req.params.id;
  try {
    await db.query(`UPDATE orders SET status = 'delivered' WHERE id = ?`, [
      orderId,
    ]);
    await db.query(
      "INSERT INTO tracking_updates (order_id, update_text) VALUES (?, ?)",
      [
        orderId,
        "Package delivered successfully. Awaiting customer confirmation.",
      ],
    );

    res.json({ message: "Order marked as delivered" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error delivering order" });
  }
};

// Get all order history
exports.getOrderHistory = async (req, res) => {
  try {
    const [companyData] = await db.query(
      "SELECT id FROM delivery_companies WHERE user_id = ?",
      [req.user.id],
    );
    if (companyData.length === 0)
      return res.status(403).json({ message: "Not a delivery company" });

    const companyId = companyData[0].id;

    const [orders] = await db.query(
      `SELECT 
        o.id, o.status, o.total, o.payment_method, o.created_at, 
        u.name as customer_name, u.phone as customer_phone, u.address as customer_location
      FROM orders o
      JOIN users u ON o.customer_id = u.id
      WHERE o.delivery_company_id = ?
      ORDER BY o.created_at DESC`,
      [companyId],
    );

    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error fetching delivery history" });
  }
};
