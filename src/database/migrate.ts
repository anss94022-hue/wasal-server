import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import { db } from "./db.js";

const MIGRATIONS_DIR = path.resolve(process.cwd(), "migrations");
const LOCK_KEY = 728_115_001;

async function migrate(): Promise<void> {
  const client = await db.connect();

  try {
    // منع تشغيل نسختين من الترحيل في الوقت نفسه.
    await client.query("SELECT pg_advisory_lock($1)", [LOCK_KEY]);

    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        name TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    const appliedRows = await client.query<{ name: string }>(
      "SELECT name FROM schema_migrations"
    );
    const applied = new Set(appliedRows.rows.map((row) => row.name));

    const files = (await readdir(MIGRATIONS_DIR))
      .filter((name) => name.endsWith(".sql"))
      .sort((a, b) => a.localeCompare(b, "en"));

    for (const file of files) {
      if (applied.has(file)) {
        console.log(`skip (already applied): ${file}`);
        continue;
      }

      const sql = await readFile(path.join(MIGRATIONS_DIR, file), "utf8");

      console.log(`applying: ${file}`);

      await client.query("BEGIN");

      try {
        await client.query(sql);
        await client.query(
          "INSERT INTO schema_migrations (name) VALUES ($1)",
          [file]
        );
        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        throw new Error(
          `Migration ${file} failed: ${(error as Error).message}`
        );
      }
    }

    console.log("Database migration completed successfully.");
  } finally {
    await client
      .query("SELECT pg_advisory_unlock($1)", [LOCK_KEY])
      .catch(() => undefined);
    client.release();
  }
}

migrate()
  .catch((error) => {
    console.error("Database migration failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.end();
  });
