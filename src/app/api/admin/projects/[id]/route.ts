import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { and, asc, eq, isNull } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { projectMedia, projects } from "@/lib/db/schema";
import {
  evaluateHomeFeaturedQuota,
  HomeQuotaExceededError,
} from "@/lib/projects/quota";
import { recordSecurityAuditLog } from "@/lib/security/audit";
import { withAdminAuth } from "@/lib/security/with-admin-auth";
import { ProjectCreateSchema } from "@/lib/validators/project";

type RouteContext = { params: Promise<{ id: string }> };

export const GET = withAdminAuth<RouteContext>(
  async (_request, _session, context) => {
    const { id } = await context.params;
    const db = getDb();
    const [project] = await db
      .select()
      .from(projects)
      .where(and(eq(projects.id, id), isNull(projects.deletedAt)))
      .limit(1);

    if (!project) {
      return NextResponse.json(
        { error: "Projet introuvable." },
        { status: 404 }
      );
    }

    const media = await db
      .select()
      .from(projectMedia)
      .where(
        and(eq(projectMedia.projectId, id), isNull(projectMedia.deletedAt))
      )
      .orderBy(asc(projectMedia.sortOrder));

    return NextResponse.json({ item: project, mediaItems: media });
  }
);

export const PATCH = withAdminAuth<RouteContext>(
  async (request, _session, context) => {
    const { id } = await context.params;
    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json({ error: "JSON invalide." }, { status: 400 });
    }

    const parsed = ProjectCreateSchema.partial().safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Données invalides." },
        { status: 400 }
      );
    }

    const db = getDb();

    try {
      const updated = await db.transaction(async (tx) => {
        let assignedFeaturedOrder: number | null | undefined;

        if (parsed.data.isFeaturedHome !== undefined) {
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
            targetProjectId: id,
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

          assignedFeaturedOrder = quota.assignedOrder;
        }

        const [row] = await tx
          .update(projects)
          .set({
            ...(parsed.data.title !== undefined ? { title: parsed.data.title } : {}),
            ...(parsed.data.slug !== undefined ? { slug: parsed.data.slug } : {}),
            ...(parsed.data.folderId !== undefined
              ? { folderId: parsed.data.folderId }
              : {}),
            ...(parsed.data.status !== undefined
              ? { status: parsed.data.status }
              : {}),
            ...(parsed.data.summary !== undefined
              ? { summary: parsed.data.summary }
              : {}),
            ...(parsed.data.externalUrl !== undefined
              ? { externalUrl: parsed.data.externalUrl || null }
              : {}),
            ...(parsed.data.year !== undefined ? { year: parsed.data.year } : {}),
            ...(parsed.data.clientOrContext !== undefined
              ? { clientOrContext: parsed.data.clientOrContext }
              : {}),
            ...(parsed.data.tags !== undefined ? { tags: parsed.data.tags } : {}),
            ...(parsed.data.isFeaturedHome !== undefined
              ? {
                  isFeaturedHome: parsed.data.isFeaturedHome,
                  featuredOrder: assignedFeaturedOrder ?? null,
                }
              : {}),
            updatedAt: new Date(),
          })
          .where(and(eq(projects.id, id), isNull(projects.deletedAt)))
          .returning();

        if (!row) return null;

        if (parsed.data.mediaItems !== undefined) {
          await tx
            .update(projectMedia)
            .set({ deletedAt: new Date() })
            .where(eq(projectMedia.projectId, id));

          if (parsed.data.mediaItems.length > 0) {
            await tx.insert(projectMedia).values(
              parsed.data.mediaItems.map((media, idx) => ({
                projectId: id,
                mediaType: media.mediaType,
                objectKey: media.objectKey,
                posterKey: media.posterKey ?? null,
                lqipBase64: media.lqipBase64 ?? null,
                altText: media.altText || row.title,
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
        }

        return row;
      });

      if (!updated) {
        return NextResponse.json(
          { error: "Projet introuvable." },
          { status: 404 }
        );
      }

      revalidatePath("/");
      revalidatePath("/projets");
      revalidatePath(`/projets/${updated.slug}`);
      return NextResponse.json({ ok: true, item: updated });
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
  }
);

export const DELETE = withAdminAuth<RouteContext>(
  async (request, session, context) => {
    const { id } = await context.params;
    const hard = new URL(request.url).searchParams.get("hard") === "true";
    const db = getDb();

    if (hard) {
      const [purged] = await db
        .delete(projects)
        .where(eq(projects.id, id))
        .returning({ id: projects.id, slug: projects.slug });

      if (!purged) {
        return NextResponse.json(
          { error: "Projet introuvable." },
          { status: 404 }
        );
      }

      await recordSecurityAuditLog({
        adminId: session.adminId,
        action: "project_purged",
        entityType: "project",
        entityId: purged.id,
        metadata: { slug: purged.slug },
      });

      revalidatePath("/");
      revalidatePath("/projets");
      revalidatePath(`/projets/${purged.slug}`);
      return NextResponse.json({ ok: true, purged: true });
    }

    const [deleted] = await db
      .update(projects)
      .set({
        deletedAt: new Date(),
        isFeaturedHome: false,
        featuredOrder: null,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, id))
      .returning({ id: projects.id, slug: projects.slug });

    if (!deleted) {
      return NextResponse.json(
        { error: "Projet introuvable." },
        { status: 404 }
      );
    }

    await recordSecurityAuditLog({
      adminId: session.adminId,
      action: "project_soft_deleted",
      entityType: "project",
      entityId: deleted.id,
      metadata: { slug: deleted.slug },
    });

    revalidatePath("/");
    revalidatePath("/projets");
    revalidatePath(`/projets/${deleted.slug}`);
    return NextResponse.json({ ok: true });
  }
);

