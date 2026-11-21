import { NextResponse } from "next/server";
import { getNeonFunctionUrl } from "@/lib/env/neon";

interface HelloFunctionPayload {
  ok: boolean;
  service?: string;
  function?: string;
  database?: {
    server_time: string;
    projects_count: number | null;
    folders_count: number | null;
  };
  error?: string;
}

export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse> {
  try {
    const functionUrl = getNeonFunctionUrl("hello");
    const response = await fetch(`${functionUrl}/`, {
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });

    const data = (await response.json()) as HelloFunctionPayload;
    const host = new URL(functionUrl).host;

    return NextResponse.json(
      {
        ok: response.ok && data.ok,
        service: "neon-functions",
        host,
        status: response.status,
        payload: data,
      },
      {
        status: response.ok ? 200 : 502,
        headers: { "Cache-Control": "no-store" },
      }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Neon Function inaccessible.";
    return NextResponse.json(
      { ok: false, service: "neon-functions", error: message },
      { status: 502, headers: { "Cache-Control": "no-store" } }
    );
  }
}

