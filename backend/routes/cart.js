const express = require("express");
const { db } = require("../db");
const authMiddleware = require("../middleware/auth");

const router = express.Router();
router.use(authMiddleware);

function getCart(userId) {
  const items = db.prepare(`
    SELECT c.product_id AS id, c.qty,
           p.name, p.brand, p.size, p.price, p.icon
    FROM cart_items c
    JOIN products p ON p.id = c.product_id
    WHERE c.user_id = ?
    ORDER BY c.id ASC
  `).all(userId);
  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  return { items, total };
}

router.get("/", (req, res) => res.json(getCart(req.user.id)));

router.post("/", (req, res) => {
  const { productId, qty = 1 } = req.body;
  const userId = req.user.id;
  const product = db.prepare("SELECT id FROM products WHERE id = ?").get(productId);
  if (!product) return res.status(404).json({ error: "Product not found." });
  const existing = db.prepare("SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?").get(userId, productId);
  if (existing) {
    db.prepare("UPDATE cart_items SET qty = qty + ? WHERE id = ?").run(qty, existing.id);
  } else {
    db.prepare("INSERT INTO cart_items (user_id, product_id, qty) VALUES (?, ?, ?)").run(userId, productId, qty);
  }
  res.json(getCart(userId));
});

router.put("/:productId", (req, res) => {
  const { qty } = req.body;
  const userId = req.user.id;
  const productId = Number(req.params.productId);
  if (qty <= 0) {
    db.prepare("DELETE FROM cart_items WHERE user_id = ? AND product_id = ?").run(userId, productId);
  } else {
    db.prepare("UPDATE cart_items SET qty = ? WHERE user_id = ? AND product_id = ?").run(qty, userId, productId);
  }
  res.json(getCart(userId));
});

router.delete("/:productId", (req, res) => {
  db.prepare("DELETE FROM cart_items WHERE user_id = ? AND product_id = ?").run(req.user.id, Number(req.params.productId));
  res.json(getCart(req.user.id));
});

router.delete("/", (req, res) => {
  db.prepare("DELETE FROM cart_items WHERE user_id = ?").run(req.user.id);
  res.json(getCart(req.user.id));
});

module.exports = router;