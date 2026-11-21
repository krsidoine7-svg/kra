"use client";

import * as React from "react";
import { Eye, EyeSlash, Folder as FolderIcon, Plus, Trash } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { slugify } from "@/lib/utils";

export interface DashboardFolderRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  displayOrder: number;
  isVisiblePublic: boolean;
  projectCount: number;
}

interface FoldersManagerClientProps {
  initialFolders: DashboardFolderRow[];
}

export function FoldersManagerClient({
  initialFolders,
}: FoldersManagerClientProps) {
  const [folders, setFolders] = React.useState<DashboardFolderRow[]>(initialFolders);
  const [name, setName] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [feedback, setFeedback] = React.useState<string | null>(null);

  function handleNameChange(value: string) {
    setName(value);
    setSlug(slugify(value));
  }

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);
    setSaving(true);
    try {
      const response = await fetch("/api/admin/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug: slug || slugify(name),
          description: description || null,
          displayOrder: folders.length + 1,
          isVisiblePublic: true,
        }),
      });
      const data = (await response.json()) as {
        ok?: boolean;
        item?: Omit<DashboardFolderRow, "projectCount">;
        error?: string;
      };
      if (!response.ok || !data.ok || !data.item) {
        setFeedback(data.error ?? "Impossible de créer le dossier.");
        return;
      }
      setFolders((prev) => [...prev, { ...data.item!, projectCount: 0 }]);
      setName("");
      setSlug("");
      setDescription("");
    } finally {
      setSaving(false);
    }
  }

  async function toggleVisibility(folder: DashboardFolderRow) {
    const response = await fetch(`/api/admin/folders/${folder.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isVisiblePublic: !folder.isVisiblePublic }),
    });
    if (response.ok) {
      setFolders((prev) =>
        prev.map((item) =>
          item.id === folder.id
            ? { ...item, isVisiblePublic: !item.isVisiblePublic }
            : item
        )
      );
    }
  }

  async function deleteFolder(id: string) {
    const response = await fetch(`/api/admin/folders/${id}`, {
      method: "DELETE",
    });
    if (response.ok) {
      setFolders((prev) => prev.filter((item) => item.id !== id));
    }
  }

  const inputClass =
    "h-9 w-full rounded-[6px] border border-[var(--dash-border)] bg-[var(--dash-surface)] px-3 text-sm text-[var(--dash-text)] focus:border-[var(--dash-text)] focus:outline-none";

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleCreate}
        className="rounded-[8px] border border-[var(--dash-border)] bg-[var(--dash-surface)] p-5 space-y-4"
      >
        <h2 className="text-base font-medium text-[var(--dash-text)]">
          Créer un dossier thématique
        </h2>
        {feedback ? (
          <p role="alert" className="text-sm text-[var(--p-red-fg)]">
            {feedback}
          </p>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[var(--dash-muted)]">
              Nom du dossier
            </label>
            <input
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Ex. Études & Économie"
              required
              className={inputClass}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[var(--dash-muted)]">
              Slug URL
            </label>
            <input
              value={slug}
              onChange={(e) => setSlug(slugify(e.target.value))}
              placeholder="etudes-economie"
              required
              className={`${inputClass} font-mono-tech`}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[var(--dash-muted)]">
            Description (optionnelle)
          </label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Courte présentation des projets rangés dans ce dossier..."
            className={inputClass}
          />
        </div>

        <Button type="submit" disabled={saving}>
          <Plus size={15} weight="bold" aria-hidden="true" />
          {saving ? "Création..." : "Créer le dossier"}
        </Button>
      </form>

      <div className="divide-y divide-[var(--dash-border)] rounded-[8px] border border-[var(--dash-border)] bg-[var(--dash-surface)]">
        {folders.length === 0 ? (
          <p className="p-6 text-sm text-[var(--dash-muted)]">
            Aucun dossier créé pour le moment.
          </p>
        ) : (
          folders.map((folder) => (
            <div
              key={folder.id}
              className="flex flex-wrap items-center justify-between gap-4 p-4"
            >
              <div className="flex items-start gap-3">
                <FolderIcon
                  size={18}
                  weight="bold"
                  className="mt-0.5 text-[var(--dash-muted)]"
                  aria-hidden="true"
                />
                <div>
                  <p className="text-sm font-medium text-[var(--dash-text)]">
                    {folder.name}
                  </p>
                  <p className="font-mono-tech text-xs text-[var(--dash-muted)]">
                    /{folder.slug} · {folder.projectCount} projet(s)
                  </p>
                  {folder.description ? (
                    <p className="mt-1 text-xs text-[var(--dash-muted)]">
                      {folder.description}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => void toggleVisibility(folder)}
                  className="inline-flex h-8 items-center gap-1.5 rounded-[6px] border border-[var(--dash-border)] px-2.5 text-xs text-[var(--dash-text)] hover:bg-[var(--dash-active)]"
                >
                  {folder.isVisiblePublic ? (
                    <>
                      <Eye size={14} weight="bold" aria-hidden="true" />
                      Visible
                    </>
                  ) : (
                    <>
                      <EyeSlash size={14} weight="bold" aria-hidden="true" />
                      Masqué
                    </>
                  )}
                </button>
                <button
                  type="button"
                  aria-label={`Supprimer ${folder.name}`}
                  onClick={() => void deleteFolder(folder.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-[6px] text-[var(--dash-muted)] hover:bg-[var(--dash-active)] hover:text-[var(--dash-text)]"
                >
                  <Trash size={15} weight="bold" aria-hidden="true" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

