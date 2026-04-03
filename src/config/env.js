const path = require("path");
const dotenv = require("dotenv");

dotenv.config();

module.exports = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 4000),
  dbPath: process.env.DB_PATH || path.join(process.cwd(), "data", "hms.sqlite"),
  frontendOrigin: process.env.FRONTEND_ORIGIN || "http://localhost:4000",
};
