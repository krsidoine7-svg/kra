import { NextResponse } from "next/server";
import { getDbPool } from "@/lib/db";

interface HealthCountsRow {
  server_time: string;
  projects_count: number;
  folders_count: number;
  cms_count: number;
}

export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse> {
  try {
    const pool = getDbPool();
    const result = await pool.query<HealthCountsRow>(`
      SELECT
        now()::text AS server_time,
        (SELECT count(*)::int FROM projects WHERE deleted_at IS NULL) AS projects_count,
        (SELECT count(*)::int FROM folders WHERE deleted_at IS NULL) AS folders_count,
        (SELECT count(*)::int FROM cms_sections) AS cms_count
    `);

    const row = result.rows[0];
    return NextResponse.json(
      {
        ok: true,
        service: "postgres",
        database: {
          connected: true,
          serverTime: row?.server_time ?? new Date().toISOString(),
          projectsCount: row?.projects_count ?? 0,
          foldersCount: row?.folders_count ?? 0,
          cmsCount: row?.cms_count ?? 0,
        },
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur de connexion PostgreSQL.";
    return NextResponse.json(
      { ok: false, service: "postgres", error: message },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}

