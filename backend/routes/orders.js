const express = require("express");
const { db, transaction } = require("../db");
const authMiddleware = require("../middleware/auth");

const router = express.Router();
router.use(authMiddleware);

function genCode() {
  return "#AMZ" + Math.random().toString(36).substring(2, 8).toUpperCase();
}

router.post("/checkout", (req, res) => {
  const userId = req.user.id;
  const cartItems = db.prepare(`
    SELECT c.product_id, c.qty, p.name, p.icon, p.price
    FROM cart_items c JOIN products p ON p.id = c.product_id
    WHERE c.user_id = ?
  `).all(userId);

  if (!cartItems.length)
    return res.status(400).json({ error: "Your cart is empty." });

  const total = cartItems.reduce((sum, i) => sum + i.price * i.qty, 0);
  const orderCode = genCode();
  const eta = new Date(Date.now() + 10 * 60000).toISOString();

  const orderId = transaction(() => {
    const id = db.prepare("INSERT INTO orders (user_id, order_code, total, eta) VALUES (?, ?, ?, ?)").run(userId, orderCode, total, eta).lastInsertRowid;
    for (const item of cartItems) {
      db.prepare("INSERT INTO order_items (order_id, product_id, name, icon, price, qty) VALUES (?, ?, ?, ?, ?, ?)").run(id, item.product_id, item.name, item.icon, item.price, item.qty);
    }
    db.prepare("DELETE FROM cart_items WHERE user_id = ?").run(userId);
    return id;
  });

  const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(orderId);
  const items = db.prepare("SELECT * FROM order_items WHERE order_id = ?").all(orderId);
  res.json({ ...order, items });
});

router.get("/", (req, res) => {
  const orders = db.prepare("SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC").all(req.user.id);
  const withItems = orders.map((o) => ({
    ...o,
    items: db.prepare("SELECT * FROM order_items WHERE order_id = ?").all(o.id),
  }));
  res.json(withItems);
});

router.post("/:id/reorder", (req, res) => {
  const userId = req.user.id;
  const items = db.prepare("SELECT * FROM order_items WHERE order_id = ?").all(req.params.id);
  if (!items.length) return res.status(404).json({ error: "Order not found." });

  transaction(() => {
    for (const item of items) {
      const existing = db.prepare("SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?").get(userId, item.product_id);
      if (existing) {
        db.prepare("UPDATE cart_items SET qty = qty + ? WHERE id = ?").run(item.qty, existing.id);
      } else {
        db.prepare("INSERT INTO cart_items (user_id, product_id, qty) VALUES (?, ?, ?)").run(userId, item.product_id, item.qty);
      }
    }
  });

  const cartItems = db.prepare(`
    SELECT c.product_id AS id, c.qty, p.name, p.brand, p.size, p.price, p.icon
    FROM cart_items c JOIN products p ON p.id = c.product_id
    WHERE c.user_id = ?
  `).all(userId);
  res.json({ items: cartItems, total: cartItems.reduce((s, i) => s + i.price * i.qty, 0) });
});

module.exports = router;