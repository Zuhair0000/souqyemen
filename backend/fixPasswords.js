const mysql = require("mysql2/promise");
// Use 'bcryptjs' if that is what is in your package.json
const bcrypt = require("bcrypt");

async function fixSellerPasswords() {
  // 1. Connect to your database
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Zoherama1122", // ⚠️ Update this to your MySQL password
    database: "souqyemen",
  });

  // 2. The exact password you want to type into the React login form
  const plainTextPassword = "password";

  // 3. Generate a secure hash using YOUR server
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(plainTextPassword, saltRounds);

  console.log(`🔒 Secure Hash Generated: ${hashedPassword}`);

  // 4. The emails we are fixing
  const emails = [
    "tech@souqyemen.com",
    "men@souqyemen.com",
    "women@souqyemen.com",
    "toys@souqyemen.com",
    "home@souqyemen.com",
    "beauty@souqyemen.com",
    "food@souqyemen.com",
    "crafts@souqyemen.com",
  ];

  // 5. Update the database
  for (const email of emails) {
    // NOTE: If your table is named 'sellers' instead of 'users', change it here!
    await connection.query("UPDATE users SET password = ? WHERE email = ?", [
      hashedPassword,
      email,
    ]);
    console.log(`✅ Password synced for: ${email}`);
  }

  console.log(
    "\n🎉 All seller passwords have been securely reset! You can now log in.",
  );
  process.exit();
}

fixSellerPasswords();
