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

function createUser(email, passwordHash) {
  const stmt = db.prepare(`
		INSERT INTO users (email, password_hash)
		VALUES (?, ?)
	  `);
  const result = stmt.run(email, passwordHash);
  return result;
}

module.exports = {
  findByEmail,
  createUser,
};
