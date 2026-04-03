const fs = require("fs");
const path = require("path");
const { DatabaseSync } = require("node:sqlite");
const { dbPath } = require("../config/env");

const resolvedDbPath = path.resolve(dbPath);
fs.mkdirSync(path.dirname(resolvedDbPath), { recursive: true });

const db = new DatabaseSync(resolvedDbPath);
db.exec("PRAGMA journal_mode = WAL;");
db.exec("PRAGMA foreign_keys = ON;");

module.exports = { db, resolvedDbPath };
