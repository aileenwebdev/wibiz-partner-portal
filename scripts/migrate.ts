/**
 * scripts/migrate.ts
 * Run: npx tsx scripts/migrate.ts
 */

import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import { migrate } from "drizzle-orm/mysql2/migrator";
import mysql from "mysql2/promise";

(async () => {
  const connection = await mysql.createConnection(process.env.DATABASE_URL!);
  const db = drizzle(connection);

  console.log("Running migrations…");
  await migrate(db, { migrationsFolder: "./drizzle/migrations" });
  console.log("Done.");
  await connection.end();
})();
