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
INSERT INTO users (email, password_hash)
    VALUES
    ('user1@example.com', '$2b$10$GFfVuIolc8j.qa0qGTWUJuxt/aYgAS0aoQzwIyFlwne0Hl7DtmTwO'),
    ('user2@example.com', '$2b$10$aV4wATg2lRM1VpvuOAZT3ORuMMWI/BJf5bQ.F1sCH.cFp98dhfht.'),
    ('user3@example.com', '$2b$10$TOSxG1AFzCKZBMhGqrf8L.sS9SdgxDUwZ6BCVFUUY8AWDTcuC/x3W');
  `);
