import { functionBaseUrl, parseEnv } from "@neon/env";
import neonConfig from "../../../neon";

/**
 * Normalise `sslmode=prefer|require|verify-ca` vers `sslmode=verify-full` selon les bonnes pratiques pg / Neon
 * (sauf si `uselibpqcompat=true` est explicitement demandé).
 */
export function normalizePostgresUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const useCompat = parsed.searchParams.get("uselibpqcompat") === "true";
    const sslMode = parsed.searchParams.get("sslmode");
    if (
      !useCompat &&
      sslMode &&
      (sslMode === "prefer" || sslMode === "require" || sslMode === "verify-ca")
    ) {
      parsed.searchParams.set("sslmode", "verify-full");
      return parsed.toString();
    }
    return url;
  } catch {
    return url.replace(
      /sslmode=(prefer|require|verify-ca)\b/g,
      "sslmode=verify-full"
    );
  }
}

/**
 * Lit et valide `DATABASE_URL` via `@neon/env` (`parseEnv` ciblé) à la demande.
 */
export function getPostgresDatabaseUrl(): string {
  const { postgres } = parseEnv(neonConfig, ["DATABASE_URL"]);
  return normalizePostgresUrl(postgres.databaseUrl);
}

/**
 * Extrait le nom de la base PostgreSQL à partir de `DATABASE_URL`.
 */
export function getPostgresDatabaseName(): string {
  const dbUrl = getPostgresDatabaseUrl();
  const pathname = new URL(dbUrl).pathname.replace(/^\/+/, "");
  return pathname || "neondb";
}

/**
 * Calcule l'URL de base d'une Neon Function sur la branche courante.
 */
export function getNeonFunctionUrl(slug = "hello"): string {
  if (process.env.NEON_BRANCH_ID && process.env.NEON_FUNCTION_HOST_SUFFIX) {
    return functionBaseUrl(slug, process.env);
  }
  const fallback = process.env.NEON_HELLO_FUNCTION_URL?.trim();
  if (fallback) {
    return fallback.replace(/\/+$/, "");
  }
  throw new Error(
    "URL de la Neon Function introuvable (NEON_BRANCH_ID / NEON_FUNCTION_HOST_SUFFIX ou NEON_HELLO_FUNCTION_URL)."
  );
}

