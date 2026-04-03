const crypto = require("node:crypto");
const { HttpError } = require("./httpError");

const TOKEN_SECRET = process.env.TOKEN_SECRET || "dev-only-change-me";

function base64urlEncode(input) {
  return Buffer.from(input).toString("base64url");
}

function base64urlDecode(input) {
  return Buffer.from(input, "base64url").toString("utf8");
}

function signToken(payload, expiresInSeconds = 8 * 60 * 60) {
  const header = { alg: "HS256", typ: "JWT" };
  const body = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
    iat: Math.floor(Date.now() / 1000),
  };
  const encodedHeader = base64urlEncode(JSON.stringify(header));
  const encodedBody = base64urlEncode(JSON.stringify(body));
  const signature = crypto
    .createHmac("sha256", TOKEN_SECRET)
    .update(`${encodedHeader}.${encodedBody}`)
    .digest("base64url");
  return `${encodedHeader}.${encodedBody}.${signature}`;
}

function verifyToken(token) {
  if (!token) throw new HttpError(401, "Missing token");
  const [encodedHeader, encodedBody, signature] = token.split(".");
  if (!encodedHeader || !encodedBody || !signature) {
    throw new HttpError(401, "Invalid token format");
  }

  const expected = crypto
    .createHmac("sha256", TOKEN_SECRET)
    .update(`${encodedHeader}.${encodedBody}`)
    .digest("base64url");
  if (expected !== signature) {
    throw new HttpError(401, "Invalid token signature");
  }

  let payload;
  try {
    payload = JSON.parse(base64urlDecode(encodedBody));
  } catch {
    throw new HttpError(401, "Invalid token payload");
  }

  if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
    throw new HttpError(401, "Token expired");
  }

  return payload;
}

module.exports = {
  signToken,
  verifyToken,
};
