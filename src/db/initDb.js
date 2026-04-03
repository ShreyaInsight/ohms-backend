const fs = require("fs");
const path = require("path");
const { db, resolvedDbPath } = require("./client");
const { hashPassword } = require("../utils/password");

function runSqlFile(filePath) {
  const sql = fs.readFileSync(filePath, "utf8");
  db.exec(sql);
}

function init() {
  const base = __dirname;
  runSqlFile(path.join(base, "schema.sql"));
  runSqlFile(path.join(base, "seed.sql"));
  seedUsers();
  console.log(`Database initialized at ${resolvedDbPath}`);
}

function seedUsers() {
  const users = [
    { name: "System Admin", email: "admin@medcore.local", role: "admin", password: "Admin@123" },
    { name: "Reception Desk", email: "reception@medcore.local", role: "reception", password: "Reception@123" },
    { name: "Duty Doctor", email: "doctor@medcore.local", role: "doctor", password: "Doctor@123" },
    { name: "Lab User", email: "lab@medcore.local", role: "lab", password: "Lab@123" },
    { name: "Pharmacy User", email: "pharmacy@medcore.local", role: "pharmacy", password: "Pharmacy@123" },
  ];

  const stmt = db.prepare("INSERT INTO users (name, email, role, password_hash) VALUES (?, ?, ?, ?)");
  for (const user of users) {
    stmt.run(user.name, user.email, user.role, hashPassword(user.password));
  }
}

init();
