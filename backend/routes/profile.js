const express = require("express");
const { db } = require("../db");
const authMiddleware = require("../middleware/auth");

const router = express.Router();
router.use(authMiddleware);

function formatProfile(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone || "",
    address: row.address || "",
    notifyOrders: !!row.notify_orders,
    notifyOffers: !!row.notify_offers,
  };
}

router.get("/", (req, res) => {
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.id);
  if (!user) return res.status(404).json({ error: "User not found." });
  res.json(formatProfile(user));
});

router.put("/", (req, res) => {
  const { name, phone, address, notifyOrders, notifyOffers } = req.body;
  const userId = req.user.id;
  const current = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
  db.prepare(`UPDATE users SET name = ?, phone = ?, address = ?, notify_orders = ?, notify_offers = ? WHERE id = ?`).run(
    name ?? current.name,
    phone ?? current.phone,
    address ?? current.address,
    notifyOrders !== undefined ? (notifyOrders ? 1 : 0) : current.notify_orders,
    notifyOffers !== undefined ? (notifyOffers ? 1 : 0) : current.notify_offers,
    userId
  );
  const updated = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
  res.json(formatProfile(updated));
});

module.exports = router;