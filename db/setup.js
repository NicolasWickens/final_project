const sqlite = require("node:sqlite");
const path = require("node:path");

const dbPath = path.join(__dirname, "products.sqlite");

const db = new sqlite.DatabaseSync(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      created DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  `);

console.log("Database created successfully.");

db.exec(`
  INSERT INTO products (name, description, price)
  VALUES
  ('Mechanical Keyboard', 'RGB Gaming Keyboard', 89.99),

  ('Wireless Mouse', 'Bluetooth Mouse', 24.99),

  ('27 Inch Monitor', '4K IPS Display', 349.99);
  `);
console.log("Sample products inserted successfully.");
