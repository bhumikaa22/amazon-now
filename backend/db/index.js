const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.join(__dirname, "amazonnow.db"));
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

function init() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      phone TEXT DEFAULT '',
      address TEXT DEFAULT '',
      notify_orders INTEGER DEFAULT 1,
      notify_offers INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      brand TEXT,
      size TEXT,
      price INTEGER NOT NULL,
      category TEXT,
      urgency TEXT,
      delivery_time TEXT,
      icon TEXT,
      keywords TEXT
    );
    CREATE TABLE IF NOT EXISTS cart_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      qty INTEGER NOT NULL DEFAULT 1,
      UNIQUE(user_id, product_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      order_code TEXT NOT NULL,
      total INTEGER NOT NULL,
      eta TEXT,
      status TEXT DEFAULT 'delivered',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      name TEXT,
      icon TEXT,
      price INTEGER,
      qty INTEGER,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    );
  `);

  const count = db.prepare("SELECT COUNT(*) AS c FROM products").get().c;
  if (count === 0) {
    const insert = db.prepare(`
      INSERT INTO products (id, name, brand, size, price, category, urgency, delivery_time, icon, keywords)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const products = [
      [1,  "Amul Full Cream Milk",     "Amul",         "1 Litre",  68,  "dairy",       "high",   "8 min",  "🥛", JSON.stringify(["milk","dairy","drink","cream"])],
      [2,  "Mother Dairy Toned Milk",  "Mother Dairy", "500 ml",   56,  "dairy",       "high",   "10 min", "🥛", JSON.stringify(["milk","dairy","toned"])],
      [3,  "Nestle Slim Milk UHT",     "Nestle",       "1 Litre",  79,  "dairy",       "medium", "14 min", "🥛", JSON.stringify(["milk","dairy","slim","uht"])],
      [4,  "Anker USB-C Fast Charger", "Anker",        "20W",      899, "electronics", "high",   "11 min", "🔌", JSON.stringify(["charger","usb","phone","cable","charging","usbc","fast","dying","dead","low battery","phone dying","phone dead","battery low","power"])],
      [5,  "Portronics USB-C Cable",   "Portronics",   "1.2m",     349, "electronics", "high",   "9 min",  "🔌", JSON.stringify(["charger","cable","usb","phone","charging","usbc","dying","dead","phone dying"])],
      [6,  "boAt Micro USB Charger",   "boAt",         "2A",       449, "electronics", "medium", "12 min", "🔌", JSON.stringify(["charger","micro","usb","phone","charging","dying","dead"])],
      [7,  "Crocin Pain Relief",       "Crocin",       "15 tabs",  38,  "medicine",    "high",   "7 min",  "💊", JSON.stringify(["headache","pain","medicine","paracetamol","tablet","fever","crocin","sick","unwell","ache","head hurts","feeling sick","not feeling well"])],
      [8,  "Dolo 650 Paracetamol",     "Dolo",         "10 tabs",  28,  "medicine",    "high",   "10 min", "💊", JSON.stringify(["headache","fever","medicine","paracetamol","tablet","dolo","sick","unwell","temperature","hot body","feeling sick","not feeling well"])],
      [9,  "Disprin Aspirin",          "Disprin",      "10 tabs",  22,  "medicine",    "medium", "10 min", "💊", JSON.stringify(["headache","pain","aspirin","tablet","medicine","ache","head hurts"])],
      [10, "Britannia Brown Bread",    "Britannia",    "400g",     45,  "food",        "medium", "11 min", "🍞", JSON.stringify(["bread","food","breakfast","wheat","brown","hungry"])],
      [11, "Harvest Gold White Bread", "Harvest Gold", "400g",     38,  "food",        "medium", "9 min",  "🍞", JSON.stringify(["bread","food","breakfast","white","hungry"])],
      [12, "Duracell AA Batteries",    "Duracell",     "4 pack",   199, "electronics", "high",   "10 min", "🔋", JSON.stringify(["battery","batteries","aa","power","duracell","remote not working","remote dead"])],
      [13, "Energizer AA Batteries",   "Energizer",    "4 pack",   189, "electronics", "high",   "12 min", "🔋", JSON.stringify(["battery","batteries","aa","power","energizer","remote not working","remote dead"])],
      [14, "Bisleri Mineral Water",    "Bisleri",      "1 Litre",  20,  "food",        "low",    "9 min",  "💧", JSON.stringify(["water","drink","bottle","bisleri","mineral","thirsty"])],
      [15, "Kinley Water 2L",          "Kinley",       "2 Litres", 35,  "food",        "low",    "10 min", "💧", JSON.stringify(["water","drink","bottle","kinley","thirsty"])],
    ];

    const insertMany = db.transaction((rows) => {
      for (const row of rows) insert.run(...row);
    });
    insertMany(products);
    console.log("Seeded 15 products.");
  }
}

function transaction(fn) {
  return db.transaction(fn)();
}

module.exports = { db, init, transaction };