"use client";

import * as React from "react";
import {
  FilmSlate,
  House,
  Images,
  Plus,
  Trash,
  UploadSimple,
  Warning,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { ProjectShareMenu } from "@/components/public/ProjectShareMenu";
import { slugify } from "@/lib/utils";
import type { FeaturedProjectSummary } from "@/lib/projects/quota";

export interface DashboardProjectRow {
  id: string;
  title: string;
  slug: string;
  status: "draft" | "upcoming" | "published" | "archived";
  summary: string;
  folderId: string | null;
  folderName: string | null;
  year: number | null;
  clientOrContext: string | null;
  isFeaturedHome: boolean;
  featuredOrder: number | null;
}

interface UploadedPhotoDraft {
  mediaType: "image" | "video";
  objectKey: string;
  url: string;
  posterKey?: string | null;
  lqipBase64: string;
  mimeType: string;
  width: number | null;
  height: number | null;
  sizeBytes: number;
  sha256Hash: string;
  isCover: boolean;
}

interface ProjectsManagerClientProps {
  initialProjects: DashboardProjectRow[];
  folders: Array<{ id: string; name: string }>;
}

const STATUS_LABELS: Record<DashboardProjectRow["status"], string> = {
  published: "Réalisé",
  upcoming: "À venir",
  draft: "Brouillon",
  archived: "Archivé",
};

export function ProjectsManagerClient({
  initialProjects,
  folders,
}: ProjectsManagerClientProps) {
  const [projects, setProjects] =
    React.useState<DashboardProjectRow[]>(initialProjects);
  const [showForm, setShowForm] = React.useState(false);

  const [title, setTitle] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [folderId, setFolderId] = React.useState<string>("");
  const [status, setStatus] =
    React.useState<DashboardProjectRow["status"]>("published");
  const [summary, setSummary] = React.useState("");
  const [year, setYear] = React.useState<string>("2026");
  const [clientOrContext, setClientOrContext] = React.useState("");
  const [externalUrl, setExternalUrl] = React.useState("");
  const [isFeaturedHome, setIsFeaturedHome] = React.useState(false);
  const [photos, setPhotos] = React.useState<UploadedPhotoDraft[]>([]);

  const [saving, setSaving] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [quotaConflict, setQuotaConflict] = React.useState<{
    pendingProjectId: string | null;
    currentFeatured: FeaturedProjectSummary[];
  } | null>(null);

  const homeCount = projects.filter((p) => p.isFeaturedHome).length;

  const [pendingPosterFile, setPendingPosterFile] = React.useState<File | null>(null);

  async function handleMultiPhotoUpload(files: FileList) {
    setErrorMsg(null);
    setSaving(true);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("scope", "projects");

        const response = await fetch("/api/admin/media/upload", {
          method: "POST",
          body: formData,
        });
        const data = (await response.json()) as {
          ok?: boolean;
          mediaType?: "image" | "video";
          objectKey?: string;
          url?: string;
          posterKey?: string | null;
          lqipBase64?: string;
          mimeType?: string;
          width?: number | null;
          height?: number | null;
          sizeBytes?: number;
          sha256Hash?: string;
          error?: string;
        };

        if (!response.ok || !data.ok || !data.objectKey) {
          setErrorMsg(data.error ?? "Erreur d'upload sur une photo.");
          continue;
        }

        const kind = data.mediaType === "video" ? "video" : "image";
        setPhotos((prev) => [
          ...prev,
          {
            mediaType: kind,
            objectKey: data.objectKey!,
            url: data.url ?? data.objectKey!,
            posterKey: data.posterKey ?? null,
            lqipBase64: data.lqipBase64 ?? "",
            mimeType: data.mimeType ?? "image/webp",
            width: data.width ?? null,
            height: data.height ?? null,
            sizeBytes: data.sizeBytes ?? 0,
            sha256Hash: data.sha256Hash ?? "",
            isCover: kind === "image" && prev.every((item) => !item.isCover),
          },
        ]);
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleVideoUpload(videoFile: File) {
    setErrorMsg(null);
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("file", videoFile);
      formData.append("scope", "projects");
      if (pendingPosterFile) {
        formData.append("poster", pendingPosterFile);
      }

      const response = await fetch("/api/admin/media/upload", {
        method: "POST",
        body: formData,
      });
      const data = (await response.json()) as {
        ok?: boolean;
        objectKey?: string;
        url?: string;
        posterKey?: string | null;
        lqipBase64?: string;
        mimeType?: string;
        width?: number | null;
        height?: number | null;
        sizeBytes?: number;
        sha256Hash?: string;
        error?: string;
      };

      if (!response.ok || !data.ok || !data.objectKey) {
        setErrorMsg(data.error ?? "Erreur d'upload vidéo.");
        return;
      }

      setPhotos((prev) => [
        ...prev,
        {
          mediaType: "video",
          objectKey: data.objectKey!,
          url: data.url ?? data.objectKey!,
          posterKey: data.posterKey ?? null,
          lqipBase64: data.lqipBase64 ?? "",
          mimeType: data.mimeType ?? "video/mp4",
          width: data.width ?? null,
          height: data.height ?? null,
          sizeBytes: data.sizeBytes ?? 0,
          sha256Hash: data.sha256Hash ?? "",
          isCover: false,
        },
      ]);
      setPendingPosterFile(null);
    } finally {
      setSaving(false);
    }
  }

  async function submitProject(replaceProjectId?: string) {
    setErrorMsg(null);
    setSaving(true);
    try {
      const response = await fetch("/api/admin/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug: slug || slugify(title),
          folderId: folderId || null,
          status,
          summary,
          year: year ? Number(year) : null,
          clientOrContext: clientOrContext || null,
          externalUrl: externalUrl || null,
          isFeaturedHome,
          replaceProjectId,
          mediaItems: photos.map((p, idx) => ({
            mediaType: p.mediaType,
            objectKey: p.objectKey,
            posterKey: p.posterKey ?? null,
            lqipBase64: p.lqipBase64,
            mimeType: p.mimeType,
            width: p.width,
            height: p.height,
            sizeBytes: p.sizeBytes,
            sha256Hash: p.sha256Hash,
            isCover: p.isCover,
            sortOrder: idx,
          })),
        }),
      });

      const data = (await response.json()) as {
        ok?: boolean;
        code?: string;
        currentFeatured?: FeaturedProjectSummary[];
        item?: DashboardProjectRow;
        error?: string;
      };

      if (response.status === 409 && data.code === "HOME_QUOTA_EXCEEDED") {
        setQuotaConflict({
          pendingProjectId: null,
          currentFeatured: data.currentFeatured ?? [],
        });
        return;
      }

      if (!response.ok || !data.ok || !data.item) {
        setErrorMsg(data.error ?? "Impossible d'enregistrer le projet.");
        return;
      }

      const folderName =
        folders.find((f) => f.id === folderId)?.name ?? null;

      setProjects((prev) => [
        { ...data.item!, folderName },
        ...prev.map((item) =>
          replaceProjectId && item.id === replaceProjectId
            ? { ...item, isFeaturedHome: false, featuredOrder: null }
            : item
        ),
      ]);
      setQuotaConflict(null);
      setShowForm(false);
      setTitle("");
      setSlug("");
      setSummary("");
      setPhotos([]);
      setIsFeaturedHome(false);
    } finally {
      setSaving(false);
    }
  }

  async function toggleHomePin(
    project: DashboardProjectRow,
    replaceProjectId?: string
  ) {
    const response = await fetch(`/api/admin/projects/${project.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        isFeaturedHome: !project.isFeaturedHome,
        replaceProjectId,
      }),
    });
    const data = (await response.json()) as {
      ok?: boolean;
      code?: string;
      currentFeatured?: FeaturedProjectSummary[];
      item?: DashboardProjectRow;
    };

    if (response.status === 409 && data.code === "HOME_QUOTA_EXCEEDED") {
      setQuotaConflict({
        pendingProjectId: project.id,
        currentFeatured: data.currentFeatured ?? [],
      });
      return;
    }

    if (response.ok && data.ok && data.item) {
      setQuotaConflict(null);
      setProjects((prev) =>
        prev.map((p) => {
          if (p.id === project.id) {
            return {
              ...p,
              isFeaturedHome: data.item!.isFeaturedHome,
              featuredOrder: data.item!.featuredOrder,
            };
          }
          if (replaceProjectId && p.id === replaceProjectId) {
            return { ...p, isFeaturedHome: false, featuredOrder: null };
          }
          return p;
        })
      );
    }
  }

  async function handleDelete(id: string) {
    const response = await fetch(`/api/admin/projects/${id}`, {
      method: "DELETE",
    });
    if (response.ok) {
      setProjects((prev) => prev.filter((p) => p.id !== id));
    }
  }

  const inputClass =
    "h-9 w-full rounded-[6px] border border-[var(--dash-border)] bg-[var(--dash-surface)] px-3 text-sm text-[var(--dash-text)] focus:border-[var(--dash-text)] focus:outline-none";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-mono-tech text-xs text-[var(--dash-muted)]">
          Accueil : {homeCount} / 3 projets épinglés
        </p>
        <Button type="button" onClick={() => setShowForm((prev) => !prev)}>
          <Plus size={15} weight="bold" aria-hidden="true" />
          {showForm ? "Fermer" : "Nouveau projet"}
        </Button>
      </div>

      {/* Modale de remplacement si 3 projets déjà sur l'accueil */}
      {quotaConflict ? (
        <div
          role="dialog"
          aria-modal="true"
          className="rounded-[8px] border border-[var(--p-amber-fg)] bg-[var(--p-amber-bg)] p-4 text-[var(--p-amber-fg)] space-y-3"
        >
          <div className="flex items-start gap-2.5">
            <Warning size={18} weight="bold" className="mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium">
                Maximum 3 projets sur la page d&apos;accueil atteint
              </p>
              <p className="mt-0.5 text-xs">
                Choisissez quel projet retirer de l&apos;accueil pour publier celui-ci :
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {quotaConflict.currentFeatured.map((featured) => (
              <button
                key={featured.id}
                type="button"
                onClick={() => {
                  if (quotaConflict.pendingProjectId) {
                    const target = projects.find(
                      (p) => p.id === quotaConflict.pendingProjectId
                    );
                    if (target) void toggleHomePin(target, featured.id);
                  } else {
                    void submitProject(featured.id);
                  }
                }}
                className="rounded-[6px] border border-[var(--p-amber-fg)] bg-[#FFFFFF] px-3 py-1.5 text-xs font-medium text-[#111111] hover:bg-[#F4F4F4]"
              >
                Remplacer : {featured.title}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setQuotaConflict(null)}
              className="px-2 py-1.5 text-xs underline"
            >
              Annuler
            </button>
          </div>
        </div>
      ) : null}

      {showForm ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void submitProject();
          }}
          className="rounded-[8px] border border-[var(--dash-border)] bg-[var(--dash-surface)] p-5 space-y-4"
        >
          <h2 className="text-base font-medium text-[var(--dash-text)]">
            Ajouter un projet (actuel ou à venir)
          </h2>
          {errorMsg ? (
            <p role="alert" className="text-sm text-[var(--p-red-fg)]">
              {errorMsg}
            </p>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--dash-muted)]">
                Titre du projet
              </label>
              <input
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setSlug(slugify(e.target.value));
                }}
                required
                className={inputClass}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--dash-muted)]">
                Slug partageable
              </label>
              <input
                value={slug}
                onChange={(e) => setSlug(slugify(e.target.value))}
                required
                className={`${inputClass} font-mono-tech`}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--dash-muted)]">
                Dossier
              </label>
              <select
                value={folderId}
                onChange={(e) => setFolderId(e.target.value)}
                className={inputClass}
              >
                <option value="">Sans dossier</option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--dash-muted)]">
                Statut
              </label>
              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as DashboardProjectRow["status"])
                }
                className={inputClass}
              >
                <option value="published">Réalisé (Publié)</option>
                <option value="upcoming">Futur projet (À venir)</option>
                <option value="draft">Brouillon privé</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--dash-muted)]">
                Année
              </label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[var(--dash-muted)]">
              Résumé (affiché sur l&apos;accueil et les aperçus)
            </label>
            <textarea
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              required
              className="w-full rounded-[6px] border border-[var(--dash-border)] bg-[var(--dash-surface)] p-3 text-sm text-[var(--dash-text)] focus:border-[var(--dash-text)] focus:outline-none"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <input
              value={clientOrContext}
              onChange={(e) => setClientOrContext(e.target.value)}
              placeholder="Client / Contexte (ex. Abidjan, CI)"
              className={inputClass}
            />
            <input
              type="url"
              value={externalUrl}
              onChange={(e) => setExternalUrl(e.target.value)}
              placeholder="Lien externe (https://...)"
              className={inputClass}
            />
          </div>

          {/* Multi-photos & vidéos 3G upload */}
          <div className="space-y-3 border-t border-[var(--dash-border)] pt-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--dash-muted)]">
                <Images size={15} weight="bold" aria-hidden="true" />
                Médias du projet ({photos.length})
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <label className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-[6px] border border-[var(--dash-border)] px-3 text-xs font-medium text-[var(--dash-text)] hover:bg-[var(--dash-active)]">
                  <UploadSimple size={14} weight="bold" aria-hidden="true" />
                  Importer photos
                  <input
                    type="file"
                    multiple
                    accept="image/png,image/jpeg,image/webp"
                    className="sr-only"
                    onChange={(e) => {
                      if (e.target.files?.length) {
                        void handleMultiPhotoUpload(e.target.files);
                      }
                    }}
                  />
                </label>

                <label className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-[6px] border border-[var(--dash-border)] px-3 text-xs font-medium text-[var(--dash-text)] hover:bg-[var(--dash-active)]">
                  Poster vidéo (optionnel)
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="sr-only"
                    onChange={(e) => {
                      setPendingPosterFile(e.target.files?.[0] ?? null);
                    }}
                  />
                </label>

                <label className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-[6px] border border-[var(--dash-border)] px-3 text-xs font-medium text-[var(--dash-text)] hover:bg-[var(--dash-active)]">
                  <FilmSlate size={14} weight="bold" aria-hidden="true" />
                  Importer vidéo MP4/WebM
                  <input
                    type="file"
                    accept="video/mp4,video/webm"
                    className="sr-only"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        void handleVideoUpload(file);
                      }
                    }}
                  />
                </label>
              </div>
            </div>
            {pendingPosterFile ? (
              <p className="font-mono-tech text-[11px] text-[var(--dash-muted)]">
                Poster sélectionné : {pendingPosterFile.name} (sera converti en WebP avec la prochaine vidéo)
              </p>
            ) : null}
            {photos.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {photos.map((photo, idx) => (
                  <div
                    key={photo.objectKey}
                    className="flex items-center gap-2 rounded-[6px] border border-[var(--dash-border)] px-2.5 py-1 text-xs"
                  >
                    <span>
                      {photo.mediaType === "video" ? "Vidéo" : "Photo"} {idx + 1}{" "}
                      {photo.isCover ? "(Couverture)" : ""}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setPhotos((prev) =>
                          prev.filter((_, i) => i !== idx)
                        )
                      }
                      aria-label="Retirer cette photo"
                    >
                      <Trash size={12} weight="bold" />
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-[var(--dash-text)]">
              <input
                type="checkbox"
                checked={isFeaturedHome}
                onChange={(e) => setIsFeaturedHome(e.target.checked)}
                className="h-4 w-4 accent-[#111111]"
              />
              Publier sur la page d&apos;accueil (max 3)
            </label>
            <Button type="submit" disabled={saving}>
              {saving ? "Enregistrement..." : "Créer le projet"}
            </Button>
          </div>
        </form>
      ) : null}

      {/* Liste Linear des projets */}
      <div className="divide-y divide-[var(--dash-border)] rounded-[8px] border border-[var(--dash-border)] bg-[var(--dash-surface)]">
        {projects.length === 0 ? (
          <p className="p-6 text-sm text-[var(--dash-muted)]">
            Aucun projet enregistré.
          </p>
        ) : (
          projects.map((project) => (
            <div
              key={project.id}
              className="flex flex-wrap items-center justify-between gap-3 p-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-sm font-medium text-[var(--dash-text)]">
                    {project.title}
                  </p>
                  <span className="rounded-full bg-[var(--dash-active)] px-2 py-0.5 text-[11px] font-medium text-[var(--dash-text)]">
                    {STATUS_LABELS[project.status]}
                  </span>
                  {project.isFeaturedHome ? (
                    <span className="rounded-full bg-[var(--p-green-bg)] px-2 py-0.5 text-[11px] font-medium text-[var(--p-green-fg)]">
                      Accueil #{project.featuredOrder ?? 1}
                    </span>
                  ) : null}
                </div>
                <p className="font-mono-tech mt-0.5 text-xs text-[var(--dash-muted)]">
                  {project.folderName ?? "Sans dossier"}
                  {project.year ? ` · ${project.year}` : ""} · /projets/
                  {project.slug}
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => void toggleHomePin(project)}
                  aria-label={
                    project.isFeaturedHome
                      ? `Retirer ${project.title} de l'accueil`
                      : `Épingler ${project.title} sur l'accueil`
                  }
                  className="inline-flex h-9 items-center gap-1.5 rounded-[6px] border border-[var(--dash-border)] px-2.5 text-xs text-[var(--dash-text)] hover:bg-[var(--dash-active)]"
                >
                  <House
                    size={14}
                    weight={project.isFeaturedHome ? "fill" : "regular"}
                    aria-hidden="true"
                  />
                  {project.isFeaturedHome ? "Sur l'accueil" : "Épingler"}
                </button>

                <ProjectShareMenu
                  title={project.title}
                  slug={project.slug}
                  summary={project.summary}
                />

                <button
                  type="button"
                  aria-label={`Supprimer ${project.title}`}
                  onClick={() => void handleDelete(project.id)}
                  className="flex h-9 w-9 items-center justify-center rounded-[6px] text-[var(--dash-muted)] hover:bg-[var(--dash-active)] hover:text-[var(--dash-text)]"
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

