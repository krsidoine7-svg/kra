"use client";

import * as React from "react";
import { ArrowCounterClockwise, Trash } from "@phosphor-icons/react";

export interface TrashItemRow {
  id: string;
  entityType: "project" | "folder" | "article";
  label: string;
  slug: string;
  deletedAt: string;
}

interface TrashManagerClientProps {
  initialItems: TrashItemRow[];
}

const ENTITY_LABELS: Record<TrashItemRow["entityType"], string> = {
  project: "Projet",
  folder: "Dossier",
  article: "Article",
};

export function TrashManagerClient({ initialItems }: TrashManagerClientProps) {
  const [items, setItems] = React.useState<TrashItemRow[]>(initialItems);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState<string | null>(null);

  async function handleRestore(item: TrashItemRow) {
    setBusyId(item.id);
    setMessage(null);
    try {
      const response = await fetch("/api/admin/trash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entityType: item.entityType, id: item.id }),
      });
      if (response.ok) {
        setItems((prev) => prev.filter((x) => x.id !== item.id));
        setMessage(`${ENTITY_LABELS[item.entityType]} « ${item.label} » restauré.`);
      }
    } finally {
      setBusyId(null);
    }
  }

  async function handlePurge(item: TrashItemRow) {
    setBusyId(item.id);
    setMessage(null);
    try {
      const response = await fetch("/api/admin/trash", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entityType: item.entityType, id: item.id }),
      });
      if (response.ok) {
        setItems((prev) => prev.filter((x) => x.id !== item.id));
        setMessage(
          `${ENTITY_LABELS[item.entityType]} « ${item.label} » purgé définitivement.`
        );
      }
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-4">
      {message ? (
        <div
          role="status"
          className="rounded-[6px] border border-[var(--dash-border)] bg-[var(--dash-surface)] px-4 py-2.5 text-sm text-[var(--dash-text)]"
        >
          {message}
        </div>
      ) : null}

      <div className="divide-y divide-[var(--dash-border)] rounded-[8px] border border-[var(--dash-border)] bg-[var(--dash-surface)]">
        {items.length === 0 ? (
          <p className="p-6 text-sm text-[var(--dash-muted)]">
            La corbeille est vide. Les suppressions Projets, Dossiers et Articles passent d&apos;abord par ici avant toute purge définitive.
          </p>
        ) : (
          items.map((item) => (
            <div
              key={`${item.entityType}-${item.id}`}
              className="flex flex-wrap items-center justify-between gap-3 p-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[var(--dash-active)] px-2 py-0.5 font-mono-tech text-[11px] uppercase text-[var(--dash-text)]">
                    {ENTITY_LABELS[item.entityType]}
                  </span>
                  <p className="truncate text-sm font-medium text-[var(--dash-text)]">
                    {item.label}
                  </p>
                </div>
                <p className="font-mono-tech mt-1 text-xs text-[var(--dash-muted)]">
                  /{item.slug} · Supprimé le{" "}
                  {item.deletedAt
                    ? new Date(item.deletedAt).toLocaleDateString("fr-FR")
                    : "—"}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={busyId === item.id}
                  onClick={() => void handleRestore(item)}
                  className="inline-flex h-9 items-center gap-1.5 rounded-[6px] border border-[var(--dash-border)] px-3 text-xs font-medium text-[var(--dash-text)] hover:bg-[var(--dash-active)] disabled:opacity-50"
                >
                  <ArrowCounterClockwise size={14} weight="bold" aria-hidden="true" />
                  Restaurer
                </button>
                <button
                  type="button"
                  disabled={busyId === item.id}
                  onClick={() => void handlePurge(item)}
                  className="inline-flex h-9 items-center gap-1.5 rounded-[6px] border border-[var(--p-red-fg)] px-3 text-xs font-medium text-[var(--p-red-fg)] hover:bg-[var(--p-red-bg)] disabled:opacity-50"
                >
                  <Trash size={14} weight="bold" aria-hidden="true" />
                  Purger
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

