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

function count(conditions = [], values = []) {
  let query = "SELECT COUNT(*) AS total FROM products";
  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }
  const stmt = db.prepare(query);
  return stmt.get(...values).total;
}

function findPage(page, limit) {
  const offset = (page - 1) * limit;
  const stmt = db.prepare(`
          SELECT *
          FROM products
          ORDER BY id DESC
          LIMIT ?
          OFFSET ?
      `);

  return stmt.all(limit, offset);
}

module.exports = {
  findById,
  create,
  count,
  findPage
};
