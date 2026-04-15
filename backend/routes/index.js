const express = require("express");
const router = express.Router();

const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");
const sellerRoutes = require("./sellerRoutes");

router.use("/auth", authRoutes); // /api/auth/...
router.use("/user", userRoutes); // /api/user/...
router.use("/seller", sellerRoutes); // /api/seller/...

module.exports = router;
