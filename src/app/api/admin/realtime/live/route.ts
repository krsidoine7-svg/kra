import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { buildStudioProjectsLiveQuery } from "@/lib/realtime/queries";
import { getRealtimeServer } from "@/lib/realtime/server";
import { withAdminAuth } from "@/lib/security/with-admin-auth";

export const POST = withAdminAuth(async () => {
  const db = getDb();
  const query = buildStudioProjectsLiveQuery(db);
  const sealedQuery = await getRealtimeServer().seal({ query });

  return NextResponse.json(sealedQuery, {
    headers: { "Cache-Control": "no-store" },
  });
});

