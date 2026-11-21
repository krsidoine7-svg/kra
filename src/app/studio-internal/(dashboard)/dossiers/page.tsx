import { and, asc, eq, isNull, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { folders, projects } from "@/lib/db/schema";
import {
  FoldersManagerClient,
  type DashboardFolderRow,
} from "@/components/dashboard/FoldersManagerClient";

export const dynamic = "force-dynamic";

export default async function StudioFoldersPage() {
  let rows: DashboardFolderRow[] = [];
  try {
    const db = getDb();
    rows = await db
      .select({
        id: folders.id,
        name: folders.name,
        slug: folders.slug,
        description: folders.description,
        displayOrder: folders.displayOrder,
        isVisiblePublic: folders.isVisiblePublic,
        projectCount: sql<number>`count(${projects.id})::int`,
      })
      .from(folders)
      .leftJoin(
        projects,
        and(eq(projects.folderId, folders.id), isNull(projects.deletedAt))
      )
      .where(isNull(folders.deletedAt))
      .groupBy(folders.id)
      .orderBy(asc(folders.displayOrder));
  } catch {
    rows = [];
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-[-0.02em] text-[var(--dash-text)]">
          Dossiers & Collections
        </h1>
        <p className="mt-1 text-sm text-[var(--dash-muted)]">
          Organisez vos projets par dossiers thématiques affichés sur le portfolio public.
        </p>
      </div>

      <FoldersManagerClient initialFolders={rows} />
    </div>
  );
}

