const sqlite = require("node:sqlite");
const path = require("node:path");

const dbPath = path.join(__dirname, "products.sqlite");

const db = new sqlite.DatabaseSync(dbPath);

module.exports = db;
