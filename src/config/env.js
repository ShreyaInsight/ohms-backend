const dotenv = require("dotenv");

dotenv.config();

module.exports = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 4000),
  databaseUrl: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/medcore_hms",
  frontendOrigin: process.env.FRONTEND_ORIGIN || "http://localhost:4000",
};
