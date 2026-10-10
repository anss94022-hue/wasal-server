
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
  {
    id: "003_enforce_15_char_wasal_code",
    file: "003_enforce_15_char_wasal_code.sql",
  },
];

async function migrate() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS _wasal_migrations (
      id TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  for (const migration of migrations) {
    const result = await db.query(
      "SELECT id FROM _wasal_migrations WHERE id = $1",
      [migration.id],
    );

    if (result.rows.length > 0) {
      console.log(`Migration already applied: ${migration.id}`);
      continue;
    }

    const migrationPath = path.join(
      process.cwd(),
      "migrations",
      migration.file,
    );

    if (!fs.existsSync(migrationPath)) {
      throw new Error(`Migration file not found: ${migrationPath}`);
    }

    const sql = fs.readFileSync(migrationPath, "utf8");
    const client = await db.connect();

    try {
      await client.query("BEGIN");
      await client.query(sql);
      await client.query(
        "INSERT INTO _wasal_migrations (id) VALUES ($1)",
        [migration.id],
      );
      await client.query("COMMIT");

      console.log(`Migration applied: ${migration.id}`);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
}

migrate()
  .then(async () => {
    console.log("Database migrations completed.");
    await db.end();
  })
  .catch(async (error) => {
    console.error("Database migration failed:", error);

    try {
      await db.end();
    } catch {
      // Ignore connection cleanup errors.
    }

    process.exitCode = 1;
  });
