import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { and, asc, desc, eq, isNull } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { folders, projectMedia, projects } from "@/lib/db/schema";
import {
  evaluateHomeFeaturedQuota,
  HomeQuotaExceededError,
} from "@/lib/projects/quota";
import { withAdminAuth } from "@/lib/security/with-admin-auth";
import { ProjectCreateSchema } from "@/lib/validators/project";

export const GET = withAdminAuth(async () => {
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
      folderId: projects.folderId,
      folderName: folders.name,
      isFeaturedHome: projects.isFeaturedHome,
      featuredOrder: projects.featuredOrder,
      updatedAt: projects.updatedAt,
    })
    .from(projects)
    .leftJoin(folders, eq(projects.folderId, folders.id))
    .where(isNull(projects.deletedAt))
    .orderBy(desc(projects.isFeaturedHome), asc(projects.featuredOrder), desc(projects.updatedAt));

  return NextResponse.json({ items: rows });
});

export const POST = withAdminAuth(async (request) => {
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide." }, { status: 400 });
  }

  const parsed = ProjectCreateSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Données invalides." },
      { status: 400 }
    );
  }

  const db = getDb();

  try {
    const created = await db.transaction(async (tx) => {
      const currentFeatured = await tx
        .select({
          id: projects.id,
          title: projects.title,
          featuredOrder: projects.featuredOrder,
        })
        .from(projects)
        .where(
          and(eq(projects.isFeaturedHome, true), isNull(projects.deletedAt))
        );

      const quota = evaluateHomeFeaturedQuota({
        currentlyFeatured: currentFeatured,
        targetProjectId: null,
        wantFeatured: parsed.data.isFeaturedHome,
        replaceProjectId: parsed.data.replaceProjectId,
      });

      if (!quota.allowed) {
        throw new HomeQuotaExceededError(quota.currentFeatured);
      }

      if (quota.replaceId) {
        await tx
          .update(projects)
          .set({
            isFeaturedHome: false,
            featuredOrder: null,
            updatedAt: new Date(),
          })
          .where(eq(projects.id, quota.replaceId));
      }

      const [projectRow] = await tx
        .insert(projects)
        .values({
          title: parsed.data.title,
          slug: parsed.data.slug,
          folderId: parsed.data.folderId ?? null,
          status: parsed.data.status,
          summary: parsed.data.summary,
          externalUrl: parsed.data.externalUrl || null,
          year: parsed.data.year ?? null,
          clientOrContext: parsed.data.clientOrContext ?? null,
          tags: parsed.data.tags,
          isFeaturedHome: parsed.data.isFeaturedHome,
          featuredOrder: quota.assignedOrder,
          publishedAt: parsed.data.status === "published" ? new Date() : null,
        })
        .returning();

      if (projectRow && parsed.data.mediaItems.length > 0) {
        await tx.insert(projectMedia).values(
          parsed.data.mediaItems.map((media, idx) => ({
            projectId: projectRow.id,
            mediaType: media.mediaType,
            objectKey: media.objectKey,
            posterKey: media.posterKey ?? null,
            lqipBase64: media.lqipBase64 ?? null,
            altText: media.altText || parsed.data.title,
            mimeType: media.mimeType,
            width: media.width ?? null,
            height: media.height ?? null,
            sizeBytes: media.sizeBytes,
            sha256Hash: media.sha256Hash || "manual",
            isCover: media.isCover || idx === 0,
            sortOrder: media.sortOrder ?? idx,
          }))
        );
      }

      return projectRow;
    });

    revalidatePath("/");
    revalidatePath("/projets");
    return NextResponse.json({ ok: true, item: created }, { status: 201 });
  } catch (error) {
    if (error instanceof HomeQuotaExceededError) {
      return NextResponse.json(
        {
          code: "HOME_QUOTA_EXCEEDED",
          error: error.message,
          currentFeatured: error.currentFeatured,
        },
        { status: 409 }
      );
    }
    throw error;
  }
});

