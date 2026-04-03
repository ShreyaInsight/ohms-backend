const { db } = require("../db/client");
const { HttpError } = require("../utils/httpError");
const { verifyPassword } = require("../utils/password");
const { signToken } = require("../utils/token");

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

function login({ email, password }) {
  if (!email || !password) {
    throw new HttpError(400, "Email and password are required");
  }

  const user = db.prepare("SELECT * FROM users WHERE lower(email) = lower(?)").get(email);
  if (!user || !verifyPassword(password, user.password_hash)) {
    throw new HttpError(401, "Invalid email or password");
  }

  const safeUser = sanitizeUser(user);
  const token = signToken(safeUser, 8 * 60 * 60);

  return {
    token,
    user: safeUser,
  };
}

function getMe(userId) {
  const user = db.prepare("SELECT id, name, email, role FROM users WHERE id = ?").get(userId);
  if (!user) {
    throw new HttpError(404, "User not found");
  }
  return user;
}

module.exports = {
  login,
  getMe,
};
