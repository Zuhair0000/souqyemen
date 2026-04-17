const db = require("../../config/db");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.getPendingPartners = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM users WHERE role IN ('seller', 'delivery') AND status = 'pending'",
    );

    res.json(rows);
  } catch (error) {
    console.error("Error fetching pending partners:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.updatePartnerStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  try {
    const [userRows] = await db.query(
      "SELECT name, email FROM users WHERE id = ? AND role IN ('seller', 'delivery')",
      [id],
    );

    if (userRows.length === 0) {
      return res
        .status(404)
        .json({ message: "Account not found or invalid role" });
    }

    const { name: userName, email: userEmail } = userRows[0];

    await db.query("UPDATE users SET status = ? WHERE id = ?", [status, id]);

    const subject =
      status === "approved"
        ? "تمت الموافقة على حسابك في سوق اليمن! | Your SouqYemen Account is Approved!"
        : "تحديث بخصوص حسابك في سوق اليمن | Update on your SouqYemen Account";

    const htmlContent =
      status === "approved"
        ? `
          <div dir="rtl" style="text-align: right; font-family: Arial, sans-serif; color: #333;">
            <h2 style="color: #a22f29;">مرحباً بك في سوق اليمن، ${userName}!</h2>
            <p>أخبار رائعة! تمت <strong>الموافقة</strong> على حساب الشريك الخاص بك.</p>
            <p>يمكنك الآن تسجيل الدخول إلى لوحة التحكم الخاصة بك والبدء في إدارة عملك.</p>
          </div>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;" />
          
          <div dir="ltr" style="text-align: left; font-family: Arial, sans-serif; color: #333;">
            <h2 style="color: #a22f29;">Welcome to SouqYemen, ${userName}!</h2>
            <p>Great news! Your partner account has been <strong>approved</strong>.</p>
            <p>You can now log in to your dashboard and start managing your business.</p>
          </div>
        `
        : `
          <div dir="rtl" style="text-align: right; font-family: Arial, sans-serif; color: #333;">
            <h2 style="color: #a22f29;">مرحباً ${userName}،</h2>
            <p>نأسف لإبلاغك بأنه قد تم <strong>رفض</strong> طلب تسجيل حساب الشريك الخاص بك في الوقت الحالي.</p>
            <p>يرجى التأكد من أن المستندات المرفوعة تتطابق مع تفاصيل عملك. تواصل مع الدعم الفني إذا كنت تعتقد أن هذا خطأ.</p>
          </div>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;" />
          
          <div dir="ltr" style="text-align: left; font-family: Arial, sans-serif; color: #333;">
            <h2 style="color: #a22f29;">Hello ${userName},</h2>
            <p>We regret to inform you that your partner account registration has been <strong>declined</strong> at this time.</p>
            <p>Please ensure your uploaded documents match your business details. Contact support if you believe this was a mistake.</p>
          </div>
        `;

    try {
      await transporter.sendMail({
        from: '"SouqYemen Admin" <no-reply@souqyemen.com>',
        to: userEmail,
        subject: subject,
        html: htmlContent,
      });
    } catch (mailError) {
      console.error("Email failed to send, but status was updated:", mailError);
    }

    res.json({ message: `Account successfully ${status} and email sent.` });
  } catch (error) {
    console.error("Error updating account status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const [users] = await db.query("SELECT * FROM users WHERE role != 'admin'");

    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.banUser = async (req, res) => {
  const { id } = req.params;

  try {
    await db.query("UPDATE users SET status = 'banned' WHERE id = ?", [id]);
    res.json({ message: "User banned" });
  } catch (error) {
    console.error("Error banning user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.unbanUser = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query(
      `
      UPDATE users 
      SET status = 'approved'
      WHERE id = ?
    `,
      [id],
    );

    res.json({ message: "User unbanned successfully" });
  } catch (error) {
    console.error("Error unbanning user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const [products] = await db.query("SELECT * FROM products");
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    await db.query("DELETE FROM products WHERE id = ?", [id]);
    res.json({ message: "Product deleted" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const [orders] = await db.query("SELECT * FROM orders");
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.generateReport = async (req, res) => {
  try {
    const [[users]] = await db.query(
      "SELECT COUNT(*) as totalUsers FROM users",
    );

    const [[sellers]] = await db.query(
      "SELECT COUNT(*) as totalSellers FROM users WHERE role='seller'",
    );

    const [[products]] = await db.query(
      "SELECT COUNT(*) as totalProducts FROM products",
    );

    const [[orders]] = await db.query(
      "SELECT COUNT(*) as totalOrders FROM orders",
    );

    const [[revenue]] = await db.query(
      "SELECT IFNULL(SUM(total),0) as totalRevenue FROM orders WHERE status='completed'",
    );

    const [topProducts] = await db.query(`
      SELECT p.name,
             IFNULL(SUM(oi.quantity),0) as totalSold
      FROM products p
      LEFT JOIN order_items oi ON p.id = oi.product_id
      LEFT JOIN orders o 
        ON oi.order_id = o.id 
        AND o.status='completed'
      GROUP BY p.id
      ORDER BY totalSold DESC
      LIMIT 5
    `);

    res.json({
      totalUsers: users.totalUsers,
      totalSellers: sellers.totalSellers,
      totalProducts: products.totalProducts,
      totalOrders: orders.totalOrders,
      totalRevenue: revenue.totalRevenue,
      topProducts,
    });
  } catch (error) {
    console.error("Admin Report Error:", error);
    res.status(500).json({ message: error.message });
  }
};
