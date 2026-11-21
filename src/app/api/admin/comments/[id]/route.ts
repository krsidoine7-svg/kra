import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { articleComments, articles } from "@/lib/db/schema";
import { recordSecurityAuditLog } from "@/lib/security/audit";
import { withAdminAuth } from "@/lib/security/with-admin-auth";
import { CommentModerationUpdateSchema } from "@/lib/validators/comment";

type RouteContext = { params: Promise<{ id: string }> };

export const PATCH = withAdminAuth<RouteContext>(
  async (request, session, context) => {
    const { id } = await context.params;
    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json({ error: "JSON invalide." }, { status: 400 });
    }

    const parsed = CommentModerationUpdateSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Statut invalide." },
        { status: 400 }
      );
    }

    const db = getDb();
    const [updated] = await db
      .update(articleComments)
      .set({ moderationStatus: parsed.data.moderationStatus })
      .where(eq(articleComments.id, id))
      .returning({
        id: articleComments.id,
        articleId: articleComments.articleId,
        moderationStatus: articleComments.moderationStatus,
      });

    if (!updated) {
      return NextResponse.json(
        { error: "Commentaire introuvable." },
        { status: 404 }
      );
    }

    const [articleRow] = await db
      .select({ slug: articles.slug })
      .from(articles)
      .where(eq(articles.id, updated.articleId))
      .limit(1);

    await recordSecurityAuditLog({
      adminId: session.adminId,
      action: "comment_moderated",
      entityType: "article_comment",
      entityId: updated.id,
      metadata: { moderationStatus: updated.moderationStatus },
    });

    revalidatePath("/articles");
    if (articleRow) {
      revalidatePath(`/articles/${articleRow.slug}`);
    }

    return NextResponse.json({ ok: true, item: updated });
  }
);

export const DELETE = withAdminAuth<RouteContext>(
  async (_request, session, context) => {
    const { id } = await context.params;
    const db = getDb();
    const [deleted] = await db
      .update(articleComments)
      .set({ deletedAt: new Date() })
      .where(eq(articleComments.id, id))
      .returning({
        id: articleComments.id,
        articleId: articleComments.articleId,
      });

    if (!deleted) {
      return NextResponse.json(
        { error: "Commentaire introuvable." },
        { status: 404 }
      );
    }

    await recordSecurityAuditLog({
      adminId: session.adminId,
      action: "comment_soft_deleted",
      entityType: "article_comment",
      entityId: deleted.id,
    });

    const [articleRow] = await db
      .select({ slug: articles.slug })
      .from(articles)
      .where(eq(articles.id, deleted.articleId))
      .limit(1);

    if (articleRow) {
      revalidatePath(`/articles/${articleRow.slug}`);
    }

    return NextResponse.json({ ok: true });
  }
);

