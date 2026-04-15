// backend/controller/seller/productController.js
const db = require("../../config/db");

exports.getProductById = async (req, res) => {
  const productId = req.params.id;
  try {
    const [rows] = await db.query("SELECT * FROM products WHERE id = ?", [
      productId,
    ]);
    if (rows.length === 0)
      return res.status(404).json({ message: "Not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.editProduct = async (req, res) => {
  const { id } = req.params;
  const { name, description, price, stock } = req.body;
  try {
    const [result] = await db.query(
      "UPDATE products SET name = ?, description = ?, price = ?, stock = ? WHERE id = ?",
      [name, description, price, stock, id],
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query("DELETE FROM products WHERE id = ?", [id]);
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({ message: "Server error" });
  }
};
