const db = require("./db");

function findByEmail(email) {
  const stmt = db.prepare(`
        SELECT *
        FROM users
        WHERE email = ? 
      `);

  const result = stmt.get(email);
  return result;
}

function findById(id) {
  const stmt = db.prepare(`
        SELECT *
        FROM users
        WHERE id = ? 
      `);

  const result = stmt.get(id);
  return result;
}

function createUser(email, passwordHash) {
  const stmt = db.prepare(`
		INSERT INTO users (email, password_hash)
		VALUES (?, ?)
	  `);
  const result = stmt.run(email, passwordHash);
  return result;
}

function findAllUsers() {
  const stmt = db.prepare(`
          SELECT *
          FROM users
      `);
  return stmt.all();
}

function updateUser(id, email, role) {
  const stmt = db.prepare(`
    UPDATE users
    SET email = ?, role = ?
    WHERE id = ?
  `);
  const result = stmt.run(email, role, id);
  return result;
}

function deleteUser(id) {
  const stmt = db.prepare(`
    DELETE FROM users
    WHERE id = ?
  `);
  const result = stmt.run(id);
  return result;
}

module.exports = {
  findByEmail,
  findById,
  createUser,
  findAllUsers,
  updateUser,
  deleteUser,
};
