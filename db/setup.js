const sqlite = require("node:sqlite");
const path = require("node:path");

const dbPath = path.join(__dirname, "products.sqlite");
const db = new sqlite.DatabaseSync(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'viewer'
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    created DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME,
    created_by INTEGER REFERENCES users(id) DEFAULT NULL
  );

  CREATE TABLE IF NOT EXISTS product_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER REFERENCES products(id),
    filename TEXT NOT NULL
  );
`);

console.log("Database setup completed successfully.");
