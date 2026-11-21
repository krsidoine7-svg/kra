import { desc, isNotNull } from "drizzle-orm";
import {
  TrashManagerClient,
  type TrashItemRow,
} from "@/components/dashboard/TrashManagerClient";
import { getDb } from "@/lib/db";
import { articles, folders, projects } from "@/lib/db/schema";

export default async function StudioTrashPage() {
  const db = getDb();
  const [deletedProjects, deletedFolders, deletedArticles] = await Promise.all([
    db
      .select({
        id: projects.id,
        title: projects.title,
        slug: projects.slug,
        deletedAt: projects.deletedAt,
      })
      .from(projects)
      .where(isNotNull(projects.deletedAt))
      .orderBy(desc(projects.deletedAt)),
    db
      .select({
        id: folders.id,
        name: folders.name,
        slug: folders.slug,
        deletedAt: folders.deletedAt,
      })
      .from(folders)
      .where(isNotNull(folders.deletedAt))
      .orderBy(desc(folders.deletedAt)),
    db
      .select({
        id: articles.id,
        title: articles.title,
        slug: articles.slug,
        deletedAt: articles.deletedAt,
      })
      .from(articles)
      .where(isNotNull(articles.deletedAt))
      .orderBy(desc(articles.deletedAt)),
  ]);

  const initialItems: TrashItemRow[] = [
    ...deletedProjects.map((p) => ({
      id: p.id,
      entityType: "project" as const,
      label: p.title,
      slug: p.slug,
      deletedAt: p.deletedAt ? p.deletedAt.toISOString() : "",
    })),
    ...deletedFolders.map((f) => ({
      id: f.id,
      entityType: "folder" as const,
      label: f.name,
      slug: f.slug,
      deletedAt: f.deletedAt ? f.deletedAt.toISOString() : "",
    })),
    ...deletedArticles.map((a) => ({
      id: a.id,
      entityType: "article" as const,
      label: a.title,
      slug: a.slug,
      deletedAt: a.deletedAt ? a.deletedAt.toISOString() : "",
    })),
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-[var(--dash-border)] pb-5">
        <h1 className="text-2xl font-semibold tracking-[-0.02em] text-[var(--dash-text)]">
          Corbeille (Soft Delete)
        </h1>
        <p className="mt-1 text-sm text-[var(--dash-muted)]">
          Restaurez les projets, dossiers ou articles supprimés avant toute purge définitive.
        </p>
      </div>

      <TrashManagerClient initialItems={initialItems} />
    </div>
  );
}
