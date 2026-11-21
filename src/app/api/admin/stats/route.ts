import { NextResponse } from "next/server";
import { getAnalyticsDashboardSummary } from "@/lib/analytics/repository";
import { withAdminAuth } from "@/lib/security/with-admin-auth";

export const GET = withAdminAuth(async () => {
  const summary = await getAnalyticsDashboardSummary();
  return NextResponse.json({ ok: true, summary });
});

