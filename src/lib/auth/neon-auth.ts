import "server-only";
import { createNeonAuth } from "@neon/auth/next/server";
import { parseEnv } from "@neon/env";
import neonConfig from "../../../neon";

type NeonAuthInstance = ReturnType<typeof createNeonAuth>;

const globalForAuth = globalThis as {
  neonAuth?: NeonAuthInstance;
};

/**
 * Retourne le singleton Neon Auth (Managed Better Auth) côté serveur.
 */
export function getNeonAuth(): NeonAuthInstance {
  if (globalForAuth.neonAuth) {
    return globalForAuth.neonAuth;
  }

  const { auth } = parseEnv(neonConfig, ["NEON_AUTH_BASE_URL"]);
  const cookieSecret = process.env.NEON_AUTH_COOKIE_SECRET;
  if (!cookieSecret || cookieSecret.length < 32) {
    throw new Error(
      "NEON_AUTH_COOKIE_SECRET manquante ou trop courte (minimum 32 caractères)."
    );
  }

  globalForAuth.neonAuth = createNeonAuth({
    baseUrl: auth.baseUrl,
    cookies: {
      secret: cookieSecret,
    },
  });

  return globalForAuth.neonAuth;
}

