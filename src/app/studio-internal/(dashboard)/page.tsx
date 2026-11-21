import Link from "next/link";
import { and, count, eq, isNull } from "drizzle-orm";
import { AnalyticsStatsSection } from "@/components/dashboard/AnalyticsStatsSection";
import { LiveProjectsPanel } from "@/components/dashboard/LiveProjectsPanel";
import { StudioOnboardingCard } from "@/components/dashboard/StudioOnboardingCard";
import { getAnalyticsDashboardSummary } from "@/lib/analytics/repository";
import { getCmsSnapshot } from "@/lib/cms/repository";
import { getDb } from "@/lib/db";
import { articles, folders, logos, projects, skills } from "@/lib/db/schema";
import { getDictionary } from "@/lib/i18n/dictionary";
import { getServerLocale } from "@/lib/i18n/server";
import { loadStudioProjectsLiveData } from "@/lib/realtime/server";
import { getAdminBasePath } from "@/lib/security/admin-path";
import { getCurrentAdminSession } from "@/lib/security/session";

export default async function StudioOverviewPage() {
  const basePath = getAdminBasePath();
  const locale = await getServerLocale();
  const t = getDictionary(locale).studioOverview;
  const db = getDb();

  const [
    session,
    cmsSnapshot,
    [projectTotal],
    [homeFeaturedTotal],
    [folderTotal],
    [articleTotal],
    [publishedArticleTotal],
    [logoTotal],
    [skillTotal],
    liveProjectsData,
    analyticsSummary,
  ] = await Promise.all([
    getCurrentAdminSession(),
    getCmsSnapshot(),
    db.select({ value: count() }).from(projects).where(isNull(projects.deletedAt)),
    db
      .select({ value: count() })
      .from(projects)
      .where(and(eq(projects.isFeaturedHome, true), isNull(projects.deletedAt))),
    db.select({ value: count() }).from(folders).where(isNull(folders.deletedAt)),
    db.select({ value: count() }).from(articles).where(isNull(articles.deletedAt)),
    db
      .select({ value: count() })
      .from(articles)
      .where(and(eq(articles.status, "published"), isNull(articles.deletedAt))),
    db.select({ value: count() }).from(logos).where(isNull(logos.deletedAt)),
    db.select({ value: count() }).from(skills).where(isNull(skills.deletedAt)),
    loadStudioProjectsLiveData(),
    getAnalyticsDashboardSummary(),
  ]);

  const metrics = [
    { label: t.metricProjects, value: String(projectTotal?.value ?? 0) },
    {
      label: t.metricFeatured,
      value: `${homeFeaturedTotal?.value ?? 0} / 3`,
    },
    {
      label: t.metricFoldersArticles,
      value: `${folderTotal?.value ?? 0} / ${articleTotal?.value ?? 0}`,
    },
    {
      label: t.metricLogosSkills,
      value: String((logoTotal?.value ?? 0) + (skillTotal?.value ?? 0)),
    },
  ];

  const onboardingAutoCompleted = {
    profile: Boolean(session && session.email !== "admin@manukra.ci"),
    cms: Boolean(cmsSnapshot.hero.portraitUrl),
    projects: (homeFeaturedTotal?.value ?? 0) > 0,
    articles: (publishedArticleTotal?.value ?? 0) > 0,
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-[-0.02em] text-[var(--dash-text)]">
            {t.heading}
          </h1>
          <p className="mt-1 text-sm text-[var(--dash-muted)]">{t.subtitle}</p>
        </div>
        <Link
          href={`${basePath}/projets`}
          className="inline-flex h-9 items-center justify-center rounded-[6px] bg-[#0F2942] px-3.5 text-sm font-medium text-white transition-colors hover:bg-[#183D61]"
        >
          {t.manageProjectsBtn}
        </Link>
      </div>

      <StudioOnboardingCard
        basePath={basePath}
        locale={locale}
        autoCompleted={onboardingAutoCompleted}
      />

      {/* Bande métriques divisée par filets 1px (app-screens.md) */}
      <div className="grid grid-cols-2 divide-y divide-[var(--dash-border)] rounded-[8px] border border-[var(--dash-border)] bg-[var(--dash-surface)] md:grid-cols-4 md:divide-x md:divide-y-0">
        {metrics.map((metric) => (
          <div key={metric.label} className="p-5">
            <p className="text-xs font-medium text-[var(--dash-muted)]">
              {metric.label}
            </p>
            <p className="tabular-nums mt-2 text-2xl font-semibold text-[var(--dash-text)]">
              {metric.value}
            </p>
          </div>
        ))}
      </div>

      <AnalyticsStatsSection summary={analyticsSummary} />

      <LiveProjectsPanel
        initialRows={liveProjectsData.rows}
        initialSealedQuery={liveProjectsData.sealedQuery}
        realtimeUrl={liveProjectsData.realtimeUrl}
      />
    </div>
  );
}

