const express = require("express");
const router = express.Router();
const {
  getProductById,
  review,
  getAllCategories,
  getProductsByCategory,
  getAllProducts,
  getAIRecommendations,
} = require("../controller/customer/productsController");
const { authenticate } = require("../middleware/authMiddleware");

router.get("/", getAllProducts);
router.get("/category/:id", getProductsByCategory);
router.get("/categories", getAllCategories);
router.get("/:id", getProductById);
router.post("/review", authenticate, review);
router.get("/for-you/:userId", getAIRecommendations);

module.exports = router;
