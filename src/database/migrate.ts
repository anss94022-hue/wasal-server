import { readFile } from "node:fs/promises";
import path from "node:path";
import { db } from "./db.js";

async function migrate(): Promise<void> {
  const migrationPath = path.join(
    process.cwd(),
    "migrations",
    "001_initial_schema.sql"
  );

  const sql = await readFile(migrationPath, "utf8");

  await db.query(sql);

  console.log("Database migration completed successfully.");
}

migrate()
  .catch((error) => {
    console.error("Database migration failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.end();
  });
