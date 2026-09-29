import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { db } from "./src/database/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const migrationPath = path.join(
  __dirname,
  "migrations",
  "001_initial_schema.sql",
);

async function runMigration(): Promise<void> {
  console.log("Starting database migration...");

  const sql = fs.readFileSync(
    migrationPath,
    "utf8",
  );

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    await client.query(sql);

    await client.query("COMMIT");

    console.log(
      "Database migration completed successfully.",
    );
  } catch (error) {
    await client.query("ROLLBACK");

    console.error(
      "Database migration failed:",
      error,
    );

    throw error;
  } finally {
    client.release();
    await db.end();
  }
}

runMigration().catch(() => {
  process.exit(1);
});
