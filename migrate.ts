
import fs from "node:fs";
import path from "node:path";

import { db } from "./src/database/db.js";

const migrations = [
  {
    id: "001_initial_schema",
    file: "001_initial_schema.sql",
  },
  {
    id: "002_expand_wasal_code",
    file: "002_expand_wasal_code.sql",
  },
];

async function runMigration(): Promise<void> {
  console.log("Starting database migrations...");

  const client = await db.connect();

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS _wasal_migrations (
        id VARCHAR(100) PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    for (const migration of migrations) {
      const existing = await client.query(
        `
          SELECT id
          FROM _wasal_migrations
          WHERE id = $1
          LIMIT 1
        `,
        [migration.id],
      );

      if (existing.rows.length > 0) {
        console.log(
          `Migration already applied: ${migration.id}`,
        );
        continue;
      }

      const migrationPath = path.join(
        process.cwd(),
        "migrations",
        migration.file,
      );

      const sql = fs.readFileSync(
        migrationPath,
        "utf8",
      );

      await client.query("BEGIN");

      try {
        await client.query(sql);

        await client.query(
          `
            INSERT INTO _wasal_migrations (id)
            VALUES ($1)
          `,
          [migration.id],
        );

        await client.query("COMMIT");

        console.log(
          `Migration applied: ${migration.id}`,
        );
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
    }

    console.log("Database migrations completed.");
  } finally {
    client.release();
    await db.end();
  }
}

runMigration().catch((error) => {
  console.error("Database migration failed:", error);
  process.exitCode = 1;
});
