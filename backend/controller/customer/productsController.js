// backend/controller/customer/productsController.js
const db = require("../../config/db");

exports.getAllProducts = async (req, res) => {
  try {
    const sql = `
      SELECT p.*, AVG(r.rating) as avg_rating, COUNT(r.id) as total_reviews 
      FROM products p 
      LEFT JOIN reviews r ON p.id = r.product_id 
      GROUP BY p.id
    `;
    const [products] = await db.query(sql);
    res.json(products);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getProductById = async (req, res) => {
  const productId = req.params.id;
  try {
    const [[product]] = await db.query(
      `SELECT p.*, c.name AS category, AVG(r.rating) as avg_rating, COUNT(r.id) as total_reviews
       FROM products p
       JOIN categories c ON p.category_id = c.id 
       LEFT JOIN reviews r ON p.id = r.product_id
       WHERE p.id = ?
       GROUP BY p.id`,
      [productId],
    );

    if (!product) return res.status(404).json({ message: "Product not found" });

    const [related] = await db.query(
      `SELECT p.*, c.name AS category, AVG(r.rating) as avg_rating
       FROM products p
       JOIN categories c ON p.category_id = c.id 
       LEFT JOIN reviews r ON p.id = r.product_id
       WHERE p.category_id = ? AND p.id != ? 
       GROUP BY p.id
       LIMIT 4`,
      [product.category_id, productId],
    );

    res.json({ product, related });
  } catch (err) {
    console.error("Error fetching product details:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    const [categories] = await db.query("SELECT * FROM categories");
    res.json(categories);
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getProductsByCategory = async (req, res) => {
  // Use req.params.id to match your routes file!
  const categoryId = req.params.id || req.params.categoryId;

  try {
    const [products] = await db.query(
      `SELECT 
          p.*, 
          c.name AS category,
          AVG(r.rating) as avg_rating,
          COUNT(r.id) as total_reviews
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN reviews r ON p.id = r.product_id
       WHERE p.category_id = ?
       GROUP BY p.id`,
      [categoryId],
    );
    res.json(products);
  } catch (err) {
    console.error("Get Products by Category Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Cleaned up Review Function!
exports.review = async (req, res) => {
  const { order_id, product_id, rating, comment } = req.body;

  // The 'authenticate' middleware already verified the token and gave us the user ID!
  const userId = req.user.id;

  if (!order_id || !product_id || !rating) {
    return res.status(400).json({
      success: false,
      message: "Missing required data! Check your terminal console.",
    });
  }

  const safeComment = comment === undefined ? null : comment;

  try {
    const sql = `
      INSERT INTO reviews (user_id, product_id, order_id, rating, comment) 
      VALUES (?, ?, ?, ?, ?)
    `;
    await db.execute(sql, [userId, product_id, order_id, rating, safeComment]);

    res
      .status(201)
      .json({ success: true, message: "Review submitted successfully" });
  } catch (error) {
    console.error("Error saving review:", error);

    if (error.errno === 1062) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this item for this order.",
      });
    }
    res
      .status(500)
      .json({ success: false, message: "Failed to submit review" });
  }
};

// Function to fetch recommendations from the Python FastAPI server
// exports.getAIRecommendations = async (req, res) => {
//   const { userId } = req.params;

//   try {
//     const response = await fetch(
//       `http://127.0.0.1:8000/api/recommend/${userId}`,
//     );
//     const aiData = await response.json();
//     const aiRecs = aiData.recommendations; // This is the list of 5 products

//     // Get the IDs of the products the AI suggested
//     const aiIds = aiRecs.map((p) => p.id);

//     // CRITICAL: Check which of these actually exist in YOUR MySQL database
//     const [existingProducts] = await db.query(
//       `SELECT * FROM products WHERE id IN (?)`,
//       [aiIds],
//     );

//     // Merge the AI's "predicted_rating" with the real data from your DB
//     const finalRecommendations = existingProducts.map((dbProd) => {
//       const aiMatch = aiRecs.find((a) => a.id === dbProd.id);
//       return {
//         ...dbProd,
//         predicted_rating: aiMatch ? aiMatch.predicted_rating : 0,
//       };
//     });

//     return res.status(200).json(finalRecommendations);
//   } catch (error) {
//     console.error("AI Sync Error:", error);
//     return res.status(200).json([]); // Fallback to empty array
//   }
// };

// Function to fetch recommendations from the Python FastAPI server
exports.getAIRecommendations = async (req, res) => {
  const { userId } = req.params;

  console.log(`AI Engine: Fetching recommendations for User ${userId}...`);

  try {
    // 1. Call the FastAPI server
    const response = await fetch(
      `http://127.0.0.1:8000/api/recommend/${userId}`,
    );

    if (!response.ok) {
      throw new Error(`FastAPI responded with status: ${response.status}`);
    }

    const aiData = await response.json();
    const aiRecs = aiData.recommendations; // The 5 products from the AI's "hallucination"

    if (!aiRecs || aiRecs.length === 0) {
      return res.status(200).json([]);
    }

    // 2. Get the IDs suggested by the AI
    const aiIds = aiRecs.map((p) => p.id);

    // 3. Check if these IDs exist in your ACTUAL MySQL database
    const [existingProducts] = await db.query(
      `SELECT p.*, c.name AS category 
       FROM products p 
       LEFT JOIN categories c ON p.category_id = c.id 
       WHERE p.id IN (?)`,
      [aiIds],
    );

    // --- LOGIC FOR YOUR TEST PHASE ---
    // If we found products in MySQL, we merge them with the AI ratings
    if (existingProducts.length > 0) {
      console.log(
        `AI Engine: Found ${existingProducts.length} matching products in MySQL.`,
      );

      const mergedData = existingProducts.map((dbProd) => {
        const aiMatch = aiRecs.find((a) => a.id === dbProd.id);
        return {
          ...dbProd,
          predicted_rating: aiMatch ? aiMatch.predicted_rating : 0,
        };
      });
      return res.status(200).json(mergedData);
    }

    // --- DEBUG BYPASS ---
    // If NO products were found in MySQL, we return the AI data directly
    // so you can see that the AI is actually working!
    console.warn(
      "AI Engine: Suggested IDs don't exist in MySQL. Returning raw AI data for debugging.",
    );
    return res.status(200).json(aiRecs);
  } catch (error) {
    console.error("AI Server Connection Error:", error.message);

    // Final Fallback: Return empty so the frontend doesn't stay in 'loading' state
    return res.status(500).json({
      error: "AI service unavailable",
      details: error.message,
    });
  }
};
