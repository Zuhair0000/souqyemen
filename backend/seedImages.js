const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

async function seedImagesFast() {
  // 1. Connect to your database
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Zoherama1122", // ⚠️ UPDATE THIS
    database: "souqyemen",
  });

  const uploadDir = path.join(__dirname, "uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  console.log("🔍 Scanning database and checking local files...");
  const [products] = await connection.query(
    "SELECT id, name FROM products WHERE id <= 1000",
  );

  // 2. SMART RESUME: Only process products that DO NOT exist in the uploads folder yet
  const pendingProducts = products.filter((p) => {
    const filePath = path.join(uploadDir, `ai_prod_${p.id}.jpg`);
    return !fs.existsSync(filePath);
  });

  console.log(
    `🚀 Resuming... ${pendingProducts.length} images left to download.`,
  );

  // 3. BATCH PROCESSING: Download 5 at a time
  const BATCH_SIZE = 5;

  for (let i = 0; i < pendingProducts.length; i += BATCH_SIZE) {
    const batch = pendingProducts.slice(i, i + BATCH_SIZE);

    // Create an array of 5 simultaneous download tasks
    const promises = batch.map(async (product) => {
      const cleanName = product.name.replace(/[^a-zA-Z0-9 ]/g, "");
      const prompt = `Product photography of a ${cleanName}, plain white background, highly detailed, e-commerce style`;
      const aiUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=400&height=300&nologo=true&seed=${product.id}`;
      const filePath = path.join(uploadDir, `ai_prod_${product.id}.jpg`);
      const dbImagePath = `/uploads/ai_prod_${product.id}.jpg`;

      try {
        // TIMEOUT PREVENTER: Abort if it takes longer than 15 seconds
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        const response = await fetch(aiUrl, { signal: controller.signal });
        clearTimeout(timeoutId); // clear the timeout if it succeeds quickly

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const buffer = await response.arrayBuffer();
        fs.writeFileSync(filePath, Buffer.from(buffer));

        // Update database
        await connection.query("UPDATE products SET image = ? WHERE id = ?", [
          dbImagePath,
          product.id,
        ]);

        console.log(`✅ ID ${product.id} (${cleanName}) - Downloaded`);
      } catch (err) {
        // If it times out or fails, just log it and move on so the script doesn't freeze
        console.log(
          `⚠️ Skipped ID ${product.id} (${cleanName}) - API too slow.`,
        );
      }
    });

    // Wait for the batch of 5 to finish
    await Promise.all(promises);

    // Wait just 1 second before the next batch of 5 to avoid getting IP banned
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log(`\n🎉 Batch run complete!`);
  process.exit();
}

seedImagesFast();
