const db = require("./db");

function findById(id) {
  const stmt = db.prepare(`
          SELECT *
          FROM products
          WHERE id = ?
      `);

  return stmt.get(id);
}

function create(name, description, price) {
  const stmt = db.prepare(`
          INSERT INTO products (
              name,
              description,
              price
          )
          VALUES (?, ?, ?)
      `);

  return stmt.run(name, description, price);
}

module.exports = {
  findById,
  create,
};
