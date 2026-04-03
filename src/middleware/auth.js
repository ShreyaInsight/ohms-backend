const { HttpError } = require("../utils/httpError");
const { verifyToken } = require("../utils/token");

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) {
    return next(new HttpError(401, "Unauthorized"));
  }

  try {
    req.user = verifyToken(token);
    return next();
  } catch (error) {
    return next(error);
  }
}

function requireAnyRole(roles) {
  return (req, res, next) => {
    if (!req.user) return next(new HttpError(401, "Unauthorized"));
    if (!roles.includes(req.user.role)) {
      return next(new HttpError(403, "Forbidden: insufficient permissions"));
    }
    return next();
  };
}

module.exports = {
  requireAuth,
  requireAnyRole,
};
