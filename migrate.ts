import fs from "node:fs";
import path from "node:path";

import { db } from "./src/database/db.js";

const migrationPath = path.join(
  process.cwd(),
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
    await client.query(`
      CREATE TABLE IF NOT EXISTS _wasal_migrations (
        id VARCHAR(100) PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    const migrationId = "001_initial_schema";

    const existingMigration =
      await client.query(
        `
          SELECT id
          FROM _wasal_migrations
          WHERE id = $1
          LIMIT 1
        `,
        [migrationId],
      );

    if (existingMigration.rows.length > 0) {
      console.log(
        "Migration already applied. Nothing to do.",
      );
      return;
    }

    await client.query("BEGIN");

    await client.query(sql);

    await client.query(
      `
        INSERT INTO _wasal_migrations (id)
        VALUES ($1)
      `,
      [migrationId],
    );

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
