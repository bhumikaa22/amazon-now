const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { db } = require("../db");

const router = express.Router();

function generateToken(user) {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

router.post("/signup", (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log("Signup attempt:", { name, email });

    if (!name || !email || !password)
      return res.status(400).json({ error: "Name, email and password are required." });
    if (password.length < 6)
      return res.status(400).json({ error: "Password must be at least 6 characters." });

    const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
    if (existing)
      return res.status(409).json({ error: "An account with this email already exists." });

    const hash = bcrypt.hashSync(password, 10);
    const result = db.prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)").run(name, email, hash);
    const user = db.prepare("SELECT id, name, email FROM users WHERE id = ?").get(result.lastInsertRowid);
    const token = generateToken(user);

    res.status(201).json({ token, user });
  } catch (err) {
    console.error("Signup error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

router.post("/login", (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login attempt:", { email });

    if (!email || !password)
      return res.status(400).json({ error: "Email and password are required." });

    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (!user)
      return res.status(401).json({ error: "No account found with this email." });

    const valid = bcrypt.compareSync(password, user.password);
    if (!valid)
      return res.status(401).json({ error: "Incorrect password." });

    const token = generateToken(user);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

router.get("/me", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token." });
  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = db.prepare("SELECT id, name, email, phone, address FROM users WHERE id = ?").get(decoded.id);
    res.json(user);
  } catch {
    res.status(401).json({ error: "Invalid token." });
  }
});

module.exports = router;