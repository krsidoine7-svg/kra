import { NextResponse } from "next/server";
import { getNeonFunctionUrl } from "@/lib/env/neon";
import { withAdminAuth } from "@/lib/security/with-admin-auth";

export const POST = withAdminAuth(async (_request, session) => {
  try {
    const functionUrl = getNeonFunctionUrl("hello");
    const response = await fetch(`${functionUrl}/`, {
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });

    const data: unknown = await response.json();
    return NextResponse.json({
      ok: response.ok,
      checkedBy: session.email,
      functionUrl,
      status: response.status,
      data,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur appel Neon Function.";
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }
});

