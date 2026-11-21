import { config as loadEnv } from "dotenv";
import { defineConfig } from "drizzle-kit";

loadEnv({ path: ".env.local" });
loadEnv();

// Règle neon-postgres : les migrations Drizzle utilisent exclusivement DATABASE_URL_UNPOOLED (connexion directe)
const rawDirectUrl =
  process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL ?? "";
const directUrl = rawDirectUrl.replace(
  /sslmode=(prefer|require|verify-ca)\b/g,
  "sslmode=verify-full"
);

export default defineConfig({
  out: "./drizzle",
  schema: "./src/lib/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: directUrl,
  },
});

