import path from "path";
import { migrate as runDrizzleMigrations } from "drizzle-orm/postgres-js/migrator";
import { runMigrations as runGraphileMigrations } from "graphile-worker";
import { loadMigrateConfig } from "../config/env.ts";
import { createDb, closeDb } from "../db/client.ts";

async function main() {
  const config = loadMigrateConfig();
  const db = createDb(config.databaseUrl);

  try {
    const migrationsFolder = path.resolve(import.meta.dir, "../../drizzle");
    await runDrizzleMigrations(db, { migrationsFolder });
    await runGraphileMigrations({ connectionString: config.databaseUrl });
    console.log("Migrations applied");
  } finally {
    await closeDb();
  }
}

main().catch((error) => {
  console.error("Migration error:", error);
  process.exit(1);
});
