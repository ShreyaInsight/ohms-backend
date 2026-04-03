const { Pool } = require("pg");
const { databaseUrl } = require("../config/env");

const MAX_ATTEMPTS = 30;
const DELAY_MS = 1000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForDb() {
  const pool = new Pool({ connectionString: databaseUrl });

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      await pool.query("SELECT 1");
      console.log("PostgreSQL is ready.");
      await pool.end();
      process.exit(0);
    } catch (error) {
      console.log(`Waiting for PostgreSQL (${attempt}/${MAX_ATTEMPTS})...`);
      await sleep(DELAY_MS);
    }
  }

  await pool.end();
  console.error("PostgreSQL did not become ready in time.");
  process.exit(1);
}

waitForDb();
