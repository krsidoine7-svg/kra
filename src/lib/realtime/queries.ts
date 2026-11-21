import { asc, desc, isNull } from "drizzle-orm";
import type { getDb } from "@/lib/db";
import { projects } from "@/lib/db/schema";

export interface LiveProjectRow {
  id: string;
  title: string;
  slug: string;
  status: "draft" | "upcoming" | "published" | "archived";
  is_featured_home: boolean;
  featured_order: number | null;
  updated_at: Date;
}

export interface SerializedLiveProjectRow {
  id: string;
  title: string;
  slug: string;
  status: "draft" | "upcoming" | "published" | "archived";
  is_featured_home: boolean;
  featured_order: number | null;
  updated_at: string;
}

/**
 * Requête Drizzle déterministe conforme à Neon Realtime (clés sélectionnées en snake_case SQL).
 */
export function buildStudioProjectsLiveQuery(db: ReturnType<typeof getDb>) {
  return db
    .select({
      id: projects.id,
      title: projects.title,
      slug: projects.slug,
      status: projects.status,
      is_featured_home: projects.isFeaturedHome,
      featured_order: projects.featuredOrder,
      updated_at: projects.updatedAt,
    })
    .from(projects)
    .where(isNull(projects.deletedAt))
    .orderBy(desc(projects.updatedAt), asc(projects.id))
    .limit(12);
}

export function serializeLiveProjects(
  rows: readonly LiveProjectRow[]
): SerializedLiveProjectRow[] {
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    slug: row.slug,
    status: row.status,
    is_featured_home: row.is_featured_home,
    featured_order: row.featured_order,
    updated_at:
      row.updated_at instanceof Date
        ? row.updated_at.toISOString()
        : String(row.updated_at),
  }));
}

export function deserializeLiveProjects(
  rows: readonly SerializedLiveProjectRow[]
): LiveProjectRow[] {
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    slug: row.slug,
    status: row.status,
    is_featured_home: row.is_featured_home,
    featured_order: row.featured_order,
    updated_at: new Date(row.updated_at),
  }));
}

