import { asc, desc, eq, isNull } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { folders, projects } from "@/lib/db/schema";
import {
  ProjectsManagerClient,
  type DashboardProjectRow,
} from "@/components/dashboard/ProjectsManagerClient";

export const dynamic = "force-dynamic";

export default async function StudioProjectsPage() {
  let projectRows: DashboardProjectRow[] = [];
  let folderRows: Array<{ id: string; name: string }> = [];

  try {
    const db = getDb();
    const [pRows, fRows] = await Promise.all([
      db
        .select({
          id: projects.id,
          title: projects.title,
          slug: projects.slug,
          status: projects.status,
          summary: projects.summary,
          folderId: projects.folderId,
          folderName: folders.name,
          year: projects.year,
          clientOrContext: projects.clientOrContext,
          isFeaturedHome: projects.isFeaturedHome,
          featuredOrder: projects.featuredOrder,
        })
        .from(projects)
        .leftJoin(folders, eq(projects.folderId, folders.id))
        .where(isNull(projects.deletedAt))
        .orderBy(
          desc(projects.isFeaturedHome),
          asc(projects.featuredOrder),
          desc(projects.updatedAt)
        ),
      db
        .select({ id: folders.id, name: folders.name })
        .from(folders)
        .where(isNull(folders.deletedAt))
        .orderBy(asc(folders.displayOrder)),
    ]);

    projectRows = pRows;
    folderRows = fRows;
  } catch {
    projectRows = [];
    folderRows = [];
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-[-0.02em] text-[var(--dash-text)]">
          Projets
        </h1>
        <p className="mt-1 text-sm text-[var(--dash-muted)]">
          Ajoutez vos réalisations actuelles ou projets à venir et choisissez les 3 projets épinglés sur l&apos;accueil.
        </p>
      </div>

      <ProjectsManagerClient
        initialProjects={projectRows}
        folders={folderRows}
      />
    </div>
  );
}

