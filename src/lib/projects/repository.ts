import {
  and,
  asc,
  desc,
  eq,
  ilike,
  inArray,
  isNull,
  or,
  sql,
} from "drizzle-orm";
import { getDb } from "@/lib/db";
import { folders, projectMedia, projects } from "@/lib/db/schema";
import { buildPublicMediaUrl } from "@/lib/storage/s3";

export interface PublicMediaDTO {
  id: string;
  mediaType: "image" | "video";
  objectKey: string;
  url: string;
  posterUrl: string | null;
  lqipBase64: string | null;
  altText: string;
  width: number | null;
  height: number | null;
  isCover: boolean;
  sortOrder: number;
}

export interface PublicProjectDTO {
  id: string;
  title: string;
  slug: string;
  status: "draft" | "upcoming" | "published" | "archived";
  summary: string;
  externalUrl: string | null;
  year: number | null;
  clientOrContext: string | null;
  tags: string[];
  isFeaturedHome: boolean;
  featuredOrder: number | null;
  folder: { id: string; name: string; slug: string } | null;
  coverMedia: PublicMediaDTO | null;
  mediaCount: number;
}

export interface PublicFolderDTO {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  displayOrder: number;
  projectCount: number;
}

function toMediaDTO(row: {
  id: string;
  mediaType: "image" | "video";
  objectKey: string;
  posterKey: string | null;
  lqipBase64: string | null;
  altText: string;
  width: number | null;
  height: number | null;
  isCover: boolean;
  sortOrder: number;
}): PublicMediaDTO {
  return {
    id: row.id,
    mediaType: row.mediaType,
    objectKey: row.objectKey,
    url: buildPublicMediaUrl(row.objectKey),
    posterUrl: row.posterKey ? buildPublicMediaUrl(row.posterKey) : null,
    lqipBase64: row.lqipBase64,
    altText: row.altText,
    width: row.width,
    height: row.height,
    isCover: row.isCover,
    sortOrder: row.sortOrder,
  };
}

export async function listPublicHomeProjects(): Promise<PublicProjectDTO[]> {
  try {
    const db = getDb();
    const rows = await db
      .select({
        id: projects.id,
        title: projects.title,
        slug: projects.slug,
        status: projects.status,
        summary: projects.summary,
        externalUrl: projects.externalUrl,
        year: projects.year,
        clientOrContext: projects.clientOrContext,
        tags: projects.tags,
        isFeaturedHome: projects.isFeaturedHome,
        featuredOrder: projects.featuredOrder,
        folderId: folders.id,
        folderName: folders.name,
        folderSlug: folders.slug,
      })
      .from(projects)
      .leftJoin(
        folders,
        and(eq(projects.folderId, folders.id), isNull(folders.deletedAt))
      )
      .where(
        and(
          eq(projects.isFeaturedHome, true),
          isNull(projects.deletedAt),
          inArray(projects.status, ["published", "upcoming"])
        )
      )
      .orderBy(asc(projects.featuredOrder), desc(projects.updatedAt))
      .limit(3);

    return await attachCoverMedia(rows);
  } catch {
    return [];
  }
}

export async function listPublicFolders(): Promise<PublicFolderDTO[]> {
  try {
    const db = getDb();
    const rows = await db
      .select({
        id: folders.id,
        name: folders.name,
        slug: folders.slug,
        description: folders.description,
        displayOrder: folders.displayOrder,
        projectCount: sql<number>`count(${projects.id})::int`,
      })
      .from(folders)
      .leftJoin(
        projects,
        and(
          eq(projects.folderId, folders.id),
          isNull(projects.deletedAt),
          inArray(projects.status, ["published", "upcoming"])
        )
      )
      .where(
        and(isNull(folders.deletedAt), eq(folders.isVisiblePublic, true))
      )
      .groupBy(folders.id)
      .orderBy(asc(folders.displayOrder));

    return rows;
  } catch {
    return [];
  }
}

export async function listPublicCatalogProjects(params: {
  q?: string;
  folderSlug?: string;
  status?: "all" | "published" | "upcoming";
  sort?: "recent" | "az" | "oldest";
}): Promise<PublicProjectDTO[]> {
  try {
    const db = getDb();
    const conditions = [
      isNull(projects.deletedAt),
      params.status && params.status !== "all"
        ? eq(projects.status, params.status)
        : inArray(projects.status, ["published", "upcoming"]),
    ];

    if (params.folderSlug) {
      conditions.push(eq(folders.slug, params.folderSlug));
    }

    if (params.q && params.q.trim().length > 0) {
      const pattern = `%${params.q.trim()}%`;
      conditions.push(
        or(ilike(projects.title, pattern), ilike(projects.summary, pattern))!
      );
    }

    const orderByClause =
      params.sort === "az"
        ? asc(projects.title)
        : params.sort === "oldest"
          ? asc(projects.year)
          : desc(projects.year);

    const rows = await db
      .select({
        id: projects.id,
        title: projects.title,
        slug: projects.slug,
        status: projects.status,
        summary: projects.summary,
        externalUrl: projects.externalUrl,
        year: projects.year,
        clientOrContext: projects.clientOrContext,
        tags: projects.tags,
        isFeaturedHome: projects.isFeaturedHome,
        featuredOrder: projects.featuredOrder,
        folderId: folders.id,
        folderName: folders.name,
        folderSlug: folders.slug,
      })
      .from(projects)
      .leftJoin(
        folders,
        and(eq(projects.folderId, folders.id), isNull(folders.deletedAt))
      )
      .where(and(...conditions))
      .orderBy(orderByClause, desc(projects.createdAt))
      .limit(24);

    return await attachCoverMedia(rows);
  } catch {
    return [];
  }
}

export async function getPublicProjectBySlug(slug: string): Promise<{
  project: PublicProjectDTO;
  gallery: PublicMediaDTO[];
} | null> {
  try {
    const db = getDb();
    const [row] = await db
      .select({
        id: projects.id,
        title: projects.title,
        slug: projects.slug,
        status: projects.status,
        summary: projects.summary,
        externalUrl: projects.externalUrl,
        year: projects.year,
        clientOrContext: projects.clientOrContext,
        tags: projects.tags,
        isFeaturedHome: projects.isFeaturedHome,
        featuredOrder: projects.featuredOrder,
        folderId: folders.id,
        folderName: folders.name,
        folderSlug: folders.slug,
      })
      .from(projects)
      .leftJoin(
        folders,
        and(eq(projects.folderId, folders.id), isNull(folders.deletedAt))
      )
      .where(
        and(
          eq(projects.slug, slug),
          isNull(projects.deletedAt),
          inArray(projects.status, ["published", "upcoming"])
        )
      )
      .limit(1);

    if (!row) return null;

    const mediaRows = await db
      .select({
        id: projectMedia.id,
        mediaType: projectMedia.mediaType,
        objectKey: projectMedia.objectKey,
        posterKey: projectMedia.posterKey,
        lqipBase64: projectMedia.lqipBase64,
        altText: projectMedia.altText,
        width: projectMedia.width,
        height: projectMedia.height,
        isCover: projectMedia.isCover,
        sortOrder: projectMedia.sortOrder,
      })
      .from(projectMedia)
      .where(
        and(eq(projectMedia.projectId, row.id), isNull(projectMedia.deletedAt))
      )
      .orderBy(asc(projectMedia.sortOrder));

    const gallery = mediaRows.map(toMediaDTO);
    const coverMedia = gallery.find((m) => m.isCover) ?? gallery[0] ?? null;

    return {
      project: {
        id: row.id,
        title: row.title,
        slug: row.slug,
        status: row.status,
        summary: row.summary,
        externalUrl: row.externalUrl,
        year: row.year,
        clientOrContext: row.clientOrContext,
        tags: row.tags,
        isFeaturedHome: row.isFeaturedHome,
        featuredOrder: row.featuredOrder,
        folder:
          row.folderId && row.folderName && row.folderSlug
            ? { id: row.folderId, name: row.folderName, slug: row.folderSlug }
            : null,
        coverMedia,
        mediaCount: gallery.length,
      },
      gallery,
    };
  } catch {
    return null;
  }
}

async function attachCoverMedia(
  rows: Array<{
    id: string;
    title: string;
    slug: string;
    status: "draft" | "upcoming" | "published" | "archived";
    summary: string;
    externalUrl: string | null;
    year: number | null;
    clientOrContext: string | null;
    tags: string[];
    isFeaturedHome: boolean;
    featuredOrder: number | null;
    folderId: string | null;
    folderName: string | null;
    folderSlug: string | null;
  }>
): Promise<PublicProjectDTO[]> {
  if (rows.length === 0) return [];

  const db = getDb();
  const projectIds = rows.map((r) => r.id);
  const mediaRows = await db
    .select({
      id: projectMedia.id,
      projectId: projectMedia.projectId,
      mediaType: projectMedia.mediaType,
      objectKey: projectMedia.objectKey,
      posterKey: projectMedia.posterKey,
      lqipBase64: projectMedia.lqipBase64,
      altText: projectMedia.altText,
      width: projectMedia.width,
      height: projectMedia.height,
      isCover: projectMedia.isCover,
      sortOrder: projectMedia.sortOrder,
    })
    .from(projectMedia)
    .where(
      and(
        inArray(projectMedia.projectId, projectIds),
        isNull(projectMedia.deletedAt)
      )
    )
    .orderBy(asc(projectMedia.sortOrder));

  const mediaByProject = new Map<string, PublicMediaDTO[]>();
  for (const m of mediaRows) {
    const list = mediaByProject.get(m.projectId) ?? [];
    list.push(toMediaDTO(m));
    mediaByProject.set(m.projectId, list);
  }

  return rows.map((row) => {
    const list = mediaByProject.get(row.id) ?? [];
    const coverMedia = list.find((m) => m.isCover) ?? list[0] ?? null;
    return {
      id: row.id,
      title: row.title,
      slug: row.slug,
      status: row.status,
      summary: row.summary,
      externalUrl: row.externalUrl,
      year: row.year,
      clientOrContext: row.clientOrContext,
      tags: row.tags,
      isFeaturedHome: row.isFeaturedHome,
      featuredOrder: row.featuredOrder,
      folder:
        row.folderId && row.folderName && row.folderSlug
          ? { id: row.folderId, name: row.folderName, slug: row.folderSlug }
          : null,
      coverMedia,
      mediaCount: list.length,
    };
  });
}

