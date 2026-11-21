import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { recordAnalyticsPing } from "@/lib/analytics/repository";

const AnalyticsPingSchema = z.object({
  eventType: z.enum([
    "page_view",
    "project_view",
    "project_share",
    "link_copy",
    "article_view",
  ]),
  targetId: z.string().uuid().optional(),
  targetSlug: z.string().trim().max(220).optional(),
});

function extractClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? "unknown";
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(request: NextRequest) {
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const parsed = AnalyticsPingSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  try {
    await recordAnalyticsPing({
      eventType: parsed.data.eventType,
      targetId: parsed.data.targetId ?? null,
      targetSlug: parsed.data.targetSlug ?? null,
      ipAddress: extractClientIp(request),
      userAgent: request.headers.get("user-agent") ?? "",
    });
  } catch (error) {
    console.error("[Analytics] Erreur non bloquante:", error);
  }

  return NextResponse.json(
    { ok: true, accepted: parsed.data.eventType },
    { status: 202 }
  );
}
