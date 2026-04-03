const path = require("path");
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const { frontendOrigin } = require("./config/env");
const { apiRouter } = require("./routes/api.routes");
const { notFoundHandler, errorHandler } = require("./middleware/errorHandler");

const app = express();

app.use(
  helmet({
    // Current frontend uses inline onclick handlers in index.html.
    // Disable CSP for now so existing UI interactions work.
    // Next step for strict production hardening: migrate to addEventListener + nonce CSP.
    contentSecurityPolicy: false,
  })
);
app.use(cors({ origin: frontendOrigin, credentials: false }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.use("/api", apiRouter);

const staticRoot = path.resolve(process.cwd(), "..");
app.use(express.static(staticRoot));

app.get("/", (req, res) => {
  res.sendFile(path.join(staticRoot, "index.html"));
});

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = { app };
