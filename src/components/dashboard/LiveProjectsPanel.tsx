"use client";

import { useCallback, useMemo, useState } from "react";
import type { SealedLiveQuery } from "@neon/realtime/client";
import { useLiveQuery } from "@neon/realtime-react";
import {
  deserializeLiveProjects,
  type LiveProjectRow,
  type SerializedLiveProjectRow,
} from "@/lib/realtime/queries";
import { RealtimeRoot } from "./RealtimeRoot";

interface LiveProjectsPanelProps {
  initialRows: readonly SerializedLiveProjectRow[];
  initialSealedQuery: SealedLiveQuery<LiveProjectRow> | null;
  realtimeUrl: string | null;
}

function StatusBadge({ status }: { status: string }) {
  const label =
    status === "live"
      ? "Temps réel actif"
      : status === "connecting"
        ? "Connexion…"
        : status === "stale"
          ? "Renouvellement…"
          : status === "error"
            ? "Erreur flux"
            : "Instantané";

  const dotClass =
    status === "live"
      ? "bg-emerald-600"
      : status === "error"
        ? "bg-red-600"
        : "bg-neutral-400";

  return (
    <span className="inline-flex items-center gap-2 rounded-[4px] border border-[var(--dash-border)] px-2 py-0.5 font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--dash-muted)]">
      <span className={`h-1.5 w-1.5 rounded-full ${dotClass}`} />
      {label}
    </span>
  );
}

function LiveProjectsFeed({
  initialRows,
  initialSealedQuery,
}: {
  initialRows: readonly SerializedLiveProjectRow[];
  initialSealedQuery: SealedLiveQuery<LiveProjectRow>;
}) {
  const [sealedQuery] = useState(initialSealedQuery);
  const initialData = useMemo(
    () => deserializeLiveProjects(initialRows),
    [initialRows]
  );

  const refreshQuery = useCallback(async () => {
    const response = await fetch("/api/admin/realtime/live", {
      method: "POST",
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error(`Impossible de renouveler le flux Realtime (${response.status})`);
    }
    return (await response.json()) as SealedLiveQuery<LiveProjectRow>;
  }, []);

  const { data, status, error } = useLiveQuery(sealedQuery, {
    initialData,
    refreshQuery,
  });

  const rows = data ?? initialData;

  return (
    <section className="rounded-[8px] border border-[var(--dash-border)] bg-[var(--dash-surface)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--dash-border)] px-5 py-3.5">
        <div>
          <h2 className="text-sm font-medium text-[var(--dash-text)]">
            Activité Projets en direct (Neon Realtime)
          </h2>
          <p className="text-xs text-[var(--dash-muted)]">
            Synchronisation WAL PostgreSQL sans rechargement de page.
          </p>
        </div>
        <StatusBadge status={status} />
      </div>

      {error ? (
        <div className="border-b border-[var(--dash-border)] bg-neutral-50 px-5 py-2.5 text-xs text-red-700">
          Flux interrompu : {error.message}
        </div>
      ) : null}

      <div className="divide-y divide-[var(--dash-border)]">
        {rows.length === 0 ? (
          <p className="px-5 py-6 text-sm text-[var(--dash-muted)]">
            Aucun projet enregistré pour le moment.
          </p>
        ) : (
          rows.map((project) => (
            <div
              key={project.id}
              className="flex flex-col justify-between gap-2 px-5 py-3 sm:flex-row sm:items-center"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-[var(--dash-text)]">
                  {project.title}
                </p>
                <p className="font-mono text-[11px] text-[var(--dash-muted)]">
                  /{project.slug}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {project.is_featured_home ? (
                  <span className="rounded-[4px] border border-[#111111] px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.06em] text-[#111111]">
                    Accueil #{project.featured_order ?? "-"}
                  </span>
                ) : null}
                <span className="rounded-[4px] border border-[var(--dash-border)] px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.06em] text-[var(--dash-muted)]">
                  {project.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export function LiveProjectsPanel({
  initialRows,
  initialSealedQuery,
  realtimeUrl,
}: LiveProjectsPanelProps) {
  if (!realtimeUrl || !initialSealedQuery) {
    return (
      <section className="rounded-[8px] border border-[var(--dash-border)] bg-[var(--dash-surface)]">
        <div className="flex items-center justify-between border-b border-[var(--dash-border)] px-5 py-3.5">
          <h2 className="text-sm font-medium text-[var(--dash-text)]">
            Activité Projets
          </h2>
          <StatusBadge status="static" />
        </div>
        <div className="divide-y divide-[var(--dash-border)]">
          {initialRows.map((project) => (
            <div key={project.id} className="flex items-center justify-between px-5 py-3">
              <span className="text-sm text-[var(--dash-text)]">{project.title}</span>
              <span className="font-mono text-[10px] uppercase text-[var(--dash-muted)]">
                {project.status}
              </span>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <RealtimeRoot realtimeUrl={realtimeUrl}>
      <LiveProjectsFeed
        initialRows={initialRows}
        initialSealedQuery={initialSealedQuery}
      />
    </RealtimeRoot>
  );
}

