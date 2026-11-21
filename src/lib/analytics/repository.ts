import { desc, eq, inArray, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { analyticsEvents } from "@/lib/db/schema";
import { hashIpAddress, sha256Hex } from "@/lib/security/crypto";

export type DeviceCategory = "mobile" | "tablet" | "desktop";

export interface AnalyticsTopTarget {
  targetSlug: string;
  eventCount: number;
}

export interface AnalyticsDashboardSummary {
  totalProjectViews: number;
  totalArticleViews: number;
  totalSharesAndCopies: number;
  deviceBreakdown: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  topTargets: AnalyticsTopTarget[];
}

/**
 * Détecte de façon légère la catégorie d'appareil sans empreinte navigateur intrusive.
 */
export function classifyDeviceType(userAgent: string | null): DeviceCategory {
  const ua = (userAgent ?? "").toLowerCase();
  if (!ua) return "desktop";
  if (/(ipad|tablet|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return "tablet";
  }
  if (/mobi|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) {
    return "mobile";
  }
  return "desktop";
}

/**
 * Construit un identifiant de session quotidien anonymisé et non corrélable entre jours.
 */
export function buildAnonymousSessionHash(params: {
  ipAddress: string;
  userAgent: string;
  now?: Date;
}): string {
  const dayBucket = (params.now ?? new Date()).toISOString().slice(0, 10);
  const ipHash = hashIpAddress(params.ipAddress);
  return sha256Hex(
    `${dayBucket}:${ipHash}:${params.userAgent.slice(0, 64)}`
  );
}

export async function getAnalyticsDashboardSummary(): Promise<AnalyticsDashboardSummary> {
  const empty: AnalyticsDashboardSummary = {
    totalProjectViews: 0,
    totalArticleViews: 0,
    totalSharesAndCopies: 0,
    deviceBreakdown: { mobile: 0, tablet: 0, desktop: 0 },
    topTargets: [],
  };

  if (!process.env.DATABASE_URL) {
    return empty;
  }

  try {
    const db = getDb();

    const [byType, byDevice, topRows] = await Promise.all([
      db
        .select({
          eventType: analyticsEvents.eventType,
          total: sql<number>`count(*)::int`,
        })
        .from(analyticsEvents)
        .groupBy(analyticsEvents.eventType),
      db
        .select({
          deviceType: analyticsEvents.deviceType,
          total: sql<number>`count(*)::int`,
        })
        .from(analyticsEvents)
        .groupBy(analyticsEvents.deviceType),
      db
        .select({
          targetSlug: analyticsEvents.targetSlug,
          eventCount: sql<number>`count(*)::int`,
        })
        .from(analyticsEvents)
        .where(
          inArray(analyticsEvents.eventType, [
            "project_view",
            "article_view",
            "project_share",
            "link_copy",
          ])
        )
        .groupBy(analyticsEvents.targetSlug)
        .orderBy(desc(sql`count(*)::int`))
        .limit(5),
    ]);

    const summary: AnalyticsDashboardSummary = {
      ...empty,
      deviceBreakdown: { ...empty.deviceBreakdown },
      topTargets: [],
    };

    for (const row of byType) {
      if (row.eventType === "project_view") {
        summary.totalProjectViews = row.total;
      } else if (row.eventType === "article_view") {
        summary.totalArticleViews = row.total;
      } else if (
        row.eventType === "project_share" ||
        row.eventType === "link_copy"
      ) {
        summary.totalSharesAndCopies += row.total;
      }
    }

    for (const row of byDevice) {
      if (row.deviceType === "mobile") {
        summary.deviceBreakdown.mobile = row.total;
      } else if (row.deviceType === "tablet") {
        summary.deviceBreakdown.tablet = row.total;
      } else if (row.deviceType === "desktop") {
        summary.deviceBreakdown.desktop = row.total;
      }
    }

    summary.topTargets = topRows
      .filter((r): r is { targetSlug: string; eventCount: number } =>
        Boolean(r.targetSlug)
      )
      .map((r) => ({
        targetSlug: r.targetSlug,
        eventCount: r.eventCount,
      }));

    return summary;
  } catch {
    return empty;
  }
}

export async function recordAnalyticsPing(params: {
  eventType:
    | "page_view"
    | "project_view"
    | "project_share"
    | "link_copy"
    | "article_view";
  targetId?: string | null;
  targetSlug?: string | null;
  ipAddress: string;
  userAgent: string;
}): Promise<void> {
  if (!process.env.DATABASE_URL) {
    return;
  }

  const db = getDb();
  const deviceType = classifyDeviceType(params.userAgent);
  const sessionHashSha256 = buildAnonymousSessionHash({
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
  });

  await db.insert(analyticsEvents).values({
    eventType: params.eventType,
    targetId: params.targetId ?? null,
    targetSlug: params.targetSlug ?? null,
    sessionHashSha256,
    deviceType,
  });
}

export async function countEventsForSlug(slug: string): Promise<number> {
  if (!process.env.DATABASE_URL) return 0;
  const db = getDb();
  const [row] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(analyticsEvents)
    .where(eq(analyticsEvents.targetSlug, slug));
  return row?.total ?? 0;
}

