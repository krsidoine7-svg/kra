import { attachDatabasePool } from "@neon/functions";
import { Hono } from "hono";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { Pool } from "pg";

interface DbCountsRow {
  server_time: string;
  projects_count: number | null;
  folders_count: number | null;
}

const connectionString = process.env.DATABASE_URL?.replace(
  /sslmode=(prefer|require|verify-ca)\b/g,
  "sslmode=verify-full"
);

const pool = connectionString
  ? new Pool({
      connectionString,
      max: 5,
    })
  : null;

if (pool) {
  pool.on("error", (err) => {
    console.error("[Neon Function] Unexpected PG pool error:", err.message);
  });
  attachDatabasePool(pool);
}

let cachedJwksUrl = "";
let cachedJwks: ReturnType<typeof createRemoteJWKSet> | null = null;

function getJwksClient(jwksUrl: string): ReturnType<typeof createRemoteJWKSet> {
  if (!cachedJwks || cachedJwksUrl !== jwksUrl) {
    cachedJwksUrl = jwksUrl;
    cachedJwks = createRemoteJWKSet(new URL(jwksUrl));
  }
  return cachedJwks;
}

const app = new Hono();

app.get("/", async (c) => {
  if (!pool) {
    return c.json(
      { ok: false, error: "DATABASE_URL is not configured in function env" },
      500
    );
  }

  try {
    const timeResult = await pool.query<{ server_time: string }>(
      "SELECT now()::text AS server_time"
    );
    const serverTime = timeResult.rows[0]?.server_time ?? new Date().toISOString();

    let projectsCount: number | null = null;
    let foldersCount: number | null = null;

    try {
      const countsResult = await pool.query<{
        projects_count: number;
        folders_count: number;
      }>(`
        SELECT
          (SELECT count(*)::int FROM projects WHERE deleted_at IS NULL) AS projects_count,
          (SELECT count(*)::int FROM folders WHERE deleted_at IS NULL) AS folders_count
      `);
      projectsCount = countsResult.rows[0]?.projects_count ?? 0;
      foldersCount = countsResult.rows[0]?.folders_count ?? 0;
    } catch {
      // Schema not pushed yet on first bootstrap
    }

    const payload: DbCountsRow = {
      server_time: serverTime,
      projects_count: projectsCount,
      folders_count: foldersCount,
    };

    return c.json({
      ok: true,
      service: "neon-function",
      function: "hello",
      database: payload,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Database error";
    return c.json({ ok: false, error: message }, 500);
  }
});

app.get("/me", async (c) => {
  const jwksUrl = process.env.NEON_AUTH_JWKS_URL;
  const authBaseUrl = process.env.NEON_AUTH_BASE_URL;

  if (!jwksUrl || !authBaseUrl) {
    return c.json(
      { ok: false, error: "Neon Auth JWKS configuration missing" },
      503
    );
  }

  const authHeader = c.req.header("authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) {
    return c.json({ ok: false, error: "Missing Bearer token" }, 401);
  }

  const token = authHeader.slice("Bearer ".length).trim();
  if (!token) {
    return c.json({ ok: false, error: "Empty Bearer token" }, 401);
  }

  try {
    const jwks = getJwksClient(jwksUrl);
    const issuer = new URL(authBaseUrl).origin;
    const { payload } = await jwtVerify(token, jwks, { issuer });

    return c.json({
      ok: true,
      authenticated: true,
      sub: typeof payload.sub === "string" ? payload.sub : null,
      email: typeof payload.email === "string" ? payload.email : null,
    });
  } catch {
    return c.json({ ok: false, error: "Invalid or expired token" }, 401);
  }
});

export default async function hello(request: Request): Promise<Response> {
  return app.fetch(request);
}
