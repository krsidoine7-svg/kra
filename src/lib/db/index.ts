import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { getPostgresDatabaseUrl } from "@/lib/env/neon";
import * as schema from "./schema";

const globalForDb = globalThis as {
  pgPool?: Pool;
  pgPoolConnectionString?: string;
};

function createPool(connectionString: string): Pool {
  const pool = new Pool({
    connectionString,
    max: 5,
  });

  pool.on("error", (error) => {
    console.error("[Neon Postgres] Erreur inattendue sur le pool:", error.message);
  });

  return pool;
}

export function getDbPool(): Pool {
  const connectionString = getPostgresDatabaseUrl();
  if (!globalForDb.pgPool || globalForDb.pgPoolConnectionString !== connectionString) {
    if (globalForDb.pgPool) {
      void globalForDb.pgPool.end().catch(() => null);
    }
    globalForDb.pgPool = createPool(connectionString);
    globalForDb.pgPoolConnectionString = connectionString;
  }
  return globalForDb.pgPool;
}

export function getDb() {
  return drizzle(getDbPool(), { schema });
}

