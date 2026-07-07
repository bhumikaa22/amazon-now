const express = require("express");
const { db } = require("../db");

const router = express.Router();
const BUNDLES = { medicine: 14 };

function parseProduct(row) {
  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    size: row.size,
    price: row.price,
    category: row.category,
    urgency: row.urgency,
    deliveryTime: row.delivery_time,
    icon: row.icon,
    keywords: JSON.parse(row.keywords || "[]"),
  };
}

function scoreProduct(p, q) {
  const qLower = q.toLowerCase();
  const words = qLower.split(/\s+/);
  let s = 0;
  p.keywords.forEach((k) => {
    if (k.includes(" ") && qLower.includes(k)) s += 4;
  });
  words.forEach((w) => {
    if (p.keywords.some((k) => k.includes(w) || w.includes(k))) s += 3;
    if (p.name.toLowerCase().includes(w)) s += 2;
    if (p.category.includes(w)) s += 1;
  });
  if (p.urgency === "high") s += 0.5;
  return s;
}

router.get("/", (req, res) => {
  const rows = db.prepare("SELECT * FROM products").all();
  res.json(rows.map(parseProduct));
});

router.get("/search", (req, res) => {
  const q = (req.query.q || "").trim();
  if (!q) return res.json({ query: q, results: [], bundle: null });
  const all = db.prepare("SELECT * FROM products").all().map(parseProduct);
  const results = all
    .map((p) => ({ ...p, _score: scoreProduct(p, q) }))
    .filter((p) => p._score > 0)
    .sort((a, b) => b._score - a._score)
    .slice(0, 6)
    .map(({ _score, ...rest }) => rest);
  let bundle = null;
  if (results.length) {
    const bundleId = BUNDLES[results[0].category];
    if (bundleId && !results.some((r) => r.id === bundleId)) {
      bundle = all.find((p) => p.id === bundleId) || null;
    }
  }
  res.json({ query: q, results, bundle });
});

module.exports = router;