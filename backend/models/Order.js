const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      seller: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      name: String,
      quantity: Number,
      price: Number,
    },
  ],
  total: Number,
  status: { type: String, default: "Processing" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Order", orderSchema);
