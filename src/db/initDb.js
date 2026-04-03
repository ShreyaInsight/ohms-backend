const fs = require("fs");
const path = require("path");
const { pool } = require("./client");
const { hashPassword } = require("../utils/password");

async function runSqlFile(filePath) {
  const sql = fs.readFileSync(filePath, "utf8");
  await pool.query(sql);
}

async function init() {
  const base = __dirname;
  await runSqlFile(path.join(base, "schema.sql"));
  await runSqlFile(path.join(base, "seed.sql"));
  await seedUsers();
  console.log("PostgreSQL database initialized successfully.");
  await pool.end();
}

async function seedUsers() {
  const users = [
    { name: "System Admin", email: "admin@medcore.local", role: "admin", password: "Admin@123" },
    { name: "Reception Desk", email: "reception@medcore.local", role: "reception", password: "Reception@123" },
    { name: "Duty Doctor", email: "doctor@medcore.local", role: "doctor", password: "Doctor@123" },
    { name: "Lab User", email: "lab@medcore.local", role: "lab", password: "Lab@123" },
    { name: "Pharmacy User", email: "pharmacy@medcore.local", role: "pharmacy", password: "Pharmacy@123" },
  ];

  for (const user of users) {
    await pool.query(
      "INSERT INTO users (name, email, role, password_hash) VALUES ($1, $2, $3, $4)",
      [user.name, user.email, user.role, hashPassword(user.password)]
    );
  }
}

init().catch(async (error) => {
  console.error("Database initialization failed:", error.message);
  await pool.end();
  process.exit(1);
});
