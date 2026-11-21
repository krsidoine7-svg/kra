import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { and, eq, isNull } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { articles } from "@/lib/db/schema";
import { recordSecurityAuditLog } from "@/lib/security/audit";
import { withAdminAuth } from "@/lib/security/with-admin-auth";
import {
  ArticleCreateSchema,
  estimateReadingMinutes,
} from "@/lib/validators/article";

type RouteContext = { params: Promise<{ id: string }> };

export const GET = withAdminAuth<RouteContext>(
  async (_request, _session, context) => {
    const { id } = await context.params;
    const db = getDb();
    const [article] = await db
      .select()
      .from(articles)
      .where(and(eq(articles.id, id), isNull(articles.deletedAt)))
      .limit(1);

    if (!article) {
      return NextResponse.json(
        { error: "Article introuvable." },
        { status: 404 }
      );
    }
    return NextResponse.json({ item: article });
  }
);

export const PATCH = withAdminAuth<RouteContext>(
  async (request, session, context) => {
    const { id } = await context.params;
    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json({ error: "JSON invalide." }, { status: 400 });
    }

    const parsed = ArticleCreateSchema.partial().safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Données invalides." },
        { status: 400 }
      );
    }

    const db = getDb();
    const nextReadingMinutes =
      parsed.data.readingMinutes ??
      (parsed.data.blocks ? estimateReadingMinutes(parsed.data.blocks) : undefined);

    const [updated] = await db
      .update(articles)
      .set({
        ...(parsed.data.title !== undefined ? { title: parsed.data.title } : {}),
        ...(parsed.data.slug !== undefined ? { slug: parsed.data.slug } : {}),
        ...(parsed.data.excerpt !== undefined
          ? { excerpt: parsed.data.excerpt }
          : {}),
        ...(parsed.data.status !== undefined
          ? {
              status: parsed.data.status,
              publishedAt:
                parsed.data.status === "published" ? new Date() : undefined,
            }
          : {}),
        ...(parsed.data.blocks !== undefined
          ? { blocks: parsed.data.blocks }
          : {}),
        ...(parsed.data.tags !== undefined ? { tags: parsed.data.tags } : {}),
        ...(nextReadingMinutes !== undefined
          ? { readingMinutes: nextReadingMinutes }
          : {}),
        ...(parsed.data.coverObjectKey !== undefined
          ? { coverObjectKey: parsed.data.coverObjectKey }
          : {}),
        ...(parsed.data.coverLqip !== undefined
          ? { coverLqip: parsed.data.coverLqip }
          : {}),
        updatedAt: new Date(),
      })
      .where(and(eq(articles.id, id), isNull(articles.deletedAt)))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { error: "Article introuvable." },
        { status: 404 }
      );
    }

    await recordSecurityAuditLog({
      adminId: session.adminId,
      action: "article_updated",
      entityType: "article",
      entityId: updated.id,
      metadata: { slug: updated.slug, status: updated.status },
    });

    revalidatePath("/articles");
    revalidatePath(`/articles/${updated.slug}`);
    return NextResponse.json({ ok: true, item: updated });
  }
);

export const DELETE = withAdminAuth<RouteContext>(
  async (request, session, context) => {
    const { id } = await context.params;
    const hard = new URL(request.url).searchParams.get("hard") === "true";
    const db = getDb();

    if (hard) {
      const [purged] = await db
        .delete(articles)
        .where(eq(articles.id, id))
        .returning({ id: articles.id, slug: articles.slug });

      if (!purged) {
        return NextResponse.json(
          { error: "Article introuvable." },
          { status: 404 }
        );
      }

      await recordSecurityAuditLog({
        adminId: session.adminId,
        action: "article_purged",
        entityType: "article",
        entityId: purged.id,
        metadata: { slug: purged.slug },
      });

      revalidatePath("/articles");
      revalidatePath(`/articles/${purged.slug}`);
      return NextResponse.json({ ok: true, purged: true });
    }

    const [deleted] = await db
      .update(articles)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(articles.id, id))
      .returning({ id: articles.id, slug: articles.slug });

    if (!deleted) {
      return NextResponse.json(
        { error: "Article introuvable." },
        { status: 404 }
      );
    }

    await recordSecurityAuditLog({
      adminId: session.adminId,
      action: "article_soft_deleted",
      entityType: "article",
      entityId: deleted.id,
      metadata: { slug: deleted.slug },
    });

    revalidatePath("/articles");
    revalidatePath(`/articles/${deleted.slug}`);
    return NextResponse.json({ ok: true });
  }
);

