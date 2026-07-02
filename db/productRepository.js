const db = require("./db");

function findById(id) {
  const stmt = db.prepare(`
          SELECT *
          FROM products
          WHERE id = ? AND deleted_at IS NULL
      `);

  return stmt.get(id);
}

function findDeletedById(id) {
  const stmt = db.prepare(`
          SELECT *
          FROM products
          WHERE id = ? AND deleted_at IS NOT NULL
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
  if (conditions.length > 0) {
    query += " AND deleted_at IS NULL";
  } else {
    query += " WHERE deleted_at IS NULL";
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
          WHERE deleted_at IS NULL
          LIMIT ?
          OFFSET ?
      `);

  return stmt.all(limit, offset);
}

function update(id, name, description, price) {
  const stmt = db.prepare(`
        UPDATE products

        SET
            name = ?,
            description = ?,
            price = ?

        WHERE id = ? AND deleted_at IS NULL
    `);

  return stmt.run(name, description, price, id);
}

function deleteById(id) {
  const stmt = db.prepare(`
        UPDATE products

        SET deleted_at = CURRENT_TIMESTAMP

        WHERE id = ?
      `);

  return stmt.run(id);
}

function restoreById(id) {
  const stmt = db.prepare(`
        UPDATE products

        SET deleted_at = NULL

        WHERE id = ?
      `);

  return stmt.run(id);
}

function saveProductImage(productId, filename) {
  const stmt = db.prepare(`
      INSERT INTO product_images (product_id, filename)
      VALUES (?, ?)
  `);

  return stmt.run(productId, filename);
}

function findProductImages(productId) {
  const stmt = db.prepare(`
      SELECT filename
      FROM product_images
      WHERE product_id = ?
  `);

  return stmt.all(productId);
}

function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.redirect("/login");
  }
  next();
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) {
      return res.redirect("/login");
    }
    const roles = {
      viewer: 1,
      editor: 2,
      admin: 3,
    };
    if (roles[req.user.role] < roles[role]) {
      return res.status(403).render("403", { title: "403" });
    }
    next();
  };
}

module.exports = {
  findById,
  findDeletedById,
  create,
  count,
  findPage,
  update,
  deleteById,
  restoreById,
  saveProductImage,
  findProductImages,
  requireAuth,
  requireRole,
};
