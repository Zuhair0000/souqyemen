const mysql = require("mysql2/promise");
const fs = require("fs");
const csv = require("csv-parser"); // Run: npm install csv-parser

// This maps the Category ID to the new Seller IDs we just created
const categoryToSellerMap = {
  2: 30, // Electronics -> YemenTech
  3: 31, // Men's Fashion -> Aden Outfitters
  4: 32, // Women's Fashion -> Balkis Boutique
  5: 33, // Toys -> Moka Kids
  6: 34, // Home & Kitchen -> Sanaa Home Goods
  7: 35, // Beauty -> Desert Oasis Beauty
  8: 36, // Food & Groceries -> Golden Horn Foods
  9: 37, // Traditional Crafts -> RedSea Heritage
};

async function seedProducts() {
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Zoherama1122", // <-- Update this!
    database: "souqyemen",
  });

  console.log("🚀 Starting Smart Product Seed...");

  const products = [];

  // Ensure the path matches where your Python script saved the CSV
  fs.createReadStream("../FastAPI/souqyemen_products_1000.csv")
    .pipe(csv())
    .on("data", (row) => {
      const categoryId = parseInt(row.category_id);
      // Re-assign the seller based on our mapping
      const assignedSellerId = categoryToSellerMap[categoryId];

      products.push([
        parseInt(row.id),
        assignedSellerId,
        row.name,
        row.description,
        parseFloat(row.price),
        row.image,
        parseInt(row.stock),
        categoryId,
      ]);
    })
    .on("end", async () => {
      console.log(
        `📦 Loaded ${products.length} products. Inserting into MySQL...`,
      );

      // THE FIX: Use ON DUPLICATE KEY UPDATE instead of REPLACE
      const sql = `
                INSERT INTO products 
                (id, seller_id, name, description, price, image, stock, category_id) 
                VALUES ?
                ON DUPLICATE KEY UPDATE 
                seller_id = VALUES(seller_id),
                name = VALUES(name),
                description = VALUES(description),
                price = VALUES(price),
                image = VALUES(image),
                stock = VALUES(stock),
                category_id = VALUES(category_id)
            `;

      try {
        await connection.query(sql, [products]);
        console.log(
          `✅ Successfully seeded and merged all ${products.length} products!`,
        );
      } catch (err) {
        console.error("❌ Seeding failed:", err);
      } finally {
        await connection.end();
        process.exit();
      }
    });
}

seedProducts();
