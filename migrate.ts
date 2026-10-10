
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

async function migrate(): Promise<void> {
  await db.query(`
    CREATE TABLE IF NOT EXISTS _wasal_migrations (
      id TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const baseline = await db.query(`
    SELECT to_regclass('public.users') AS users_table
  `);

  const initial = await db.query(
    "SELECT id FROM _wasal_migrations WHERE id = $1",
    ["001_initial_schema"],
  );

  if (
    initial.rows.length === 0 &&
    baseline.rows[0]?.users_table !== null &&
    baseline.rows[0]?.users_table !== undefined
  ) {
    await db.query(
      "INSERT INTO _wasal_migrations (id) VALUES ($1) ON CONFLICT DO NOTHING",
      ["001_initial_schema"],
    );

    console.log(
      "Existing users table detected; initial schema will not be recreated.",
    );
  }

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

  console.log("Database migrations completed successfully.");
}

migrate()
  .catch((error) => {
    console.error("Database migration failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.end();
  });
