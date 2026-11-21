import type { AnalyticsDashboardSummary } from "@/lib/analytics/repository";

interface AnalyticsStatsSectionProps {
  summary: AnalyticsDashboardSummary;
}

export function AnalyticsStatsSection({ summary }: AnalyticsStatsSectionProps) {
  const deviceTotal =
    summary.deviceBreakdown.mobile +
    summary.deviceBreakdown.tablet +
    summary.deviceBreakdown.desktop;

  const formatShare = (count: number) =>
    deviceTotal === 0 ? "0 %" : `${Math.round((count / deviceTotal) * 100)} %`;

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-sm font-medium text-[var(--dash-text)]">
          Statistiques &amp; Partages Privacy-First
        </h2>
        <p className="text-xs text-[var(--dash-muted)]">
          Comptage sans cookie ni traceur tiers (vues projets, lectures articles, clics partage « ... »).
        </p>
      </div>

      <div className="grid grid-cols-1 divide-y divide-[var(--dash-border)] rounded-[8px] border border-[var(--dash-border)] bg-[var(--dash-surface)] md:grid-cols-3 md:divide-x md:divide-y-0">
        <div className="p-5">
          <p className="text-xs font-medium text-[var(--dash-muted)]">
            Consultations projets
          </p>
          <p className="tabular-nums mt-2 text-2xl font-semibold text-[var(--dash-text)]">
            {summary.totalProjectViews}
          </p>
        </div>

        <div className="p-5">
          <p className="text-xs font-medium text-[var(--dash-muted)]">
            Partages &amp; copies de lien (...)
          </p>
          <p className="tabular-nums mt-2 text-2xl font-semibold text-[var(--dash-text)]">
            {summary.totalSharesAndCopies}
          </p>
        </div>

        <div className="p-5">
          <p className="text-xs font-medium text-[var(--dash-muted)]">
            Lectures d&apos;articles
          </p>
          <p className="tabular-nums mt-2 text-2xl font-semibold text-[var(--dash-text)]">
            {summary.totalArticleViews}
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[8px] border border-[var(--dash-border)] bg-[var(--dash-surface)] p-5">
          <h3 className="text-xs font-medium uppercase tracking-[0.06em] text-[var(--dash-muted)]">
            Répartition appareils ({deviceTotal} événements)
          </h3>
          <div className="mt-4 space-y-2.5 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-[var(--dash-text)]">Mobile (priorité 3G)</span>
              <span className="tabular-nums font-mono-tech text-xs text-[var(--dash-muted)]">
                {summary.deviceBreakdown.mobile} ({formatShare(summary.deviceBreakdown.mobile)})
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--dash-text)]">Tablette</span>
              <span className="tabular-nums font-mono-tech text-xs text-[var(--dash-muted)]">
                {summary.deviceBreakdown.tablet} ({formatShare(summary.deviceBreakdown.tablet)})
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--dash-text)]">Ordinateur</span>
              <span className="tabular-nums font-mono-tech text-xs text-[var(--dash-muted)]">
                {summary.deviceBreakdown.desktop} ({formatShare(summary.deviceBreakdown.desktop)})
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-[8px] border border-[var(--dash-border)] bg-[var(--dash-surface)] p-5">
          <h3 className="text-xs font-medium uppercase tracking-[0.06em] text-[var(--dash-muted)]">
            Contenus les plus consultés / partagés
          </h3>
          {summary.topTargets.length === 0 ? (
            <p className="mt-4 text-sm text-[var(--dash-muted)]">
              Aucune interaction enregistrée pour le moment.
            </p>
          ) : (
            <div className="mt-4 space-y-2.5 text-sm">
              {summary.topTargets.map((item) => (
                <div
                  key={item.targetSlug}
                  className="flex items-center justify-between gap-2"
                >
                  <span className="truncate font-mono-tech text-xs text-[var(--dash-text)]">
                    /{item.targetSlug}
                  </span>
                  <span className="tabular-nums font-mono-tech text-xs text-[var(--dash-muted)]">
                    {item.eventCount}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

