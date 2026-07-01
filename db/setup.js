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
  ALTER TABLE products ADD COLUMN deleted_at DATETIME;`);
