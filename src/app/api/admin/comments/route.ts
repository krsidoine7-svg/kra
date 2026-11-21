import { NextResponse } from "next/server";
import { and, desc, eq, isNull } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { articleComments, articles } from "@/lib/db/schema";
import { withAdminAuth } from "@/lib/security/with-admin-auth";

export const GET = withAdminAuth(async (request) => {
  const statusParam = new URL(request.url).searchParams.get("status");
  const validStatus =
    statusParam === "pending" ||
    statusParam === "approved" ||
    statusParam === "rejected"
      ? statusParam
      : null;

  const db = getDb();
  const conditions = [isNull(articleComments.deletedAt)];
  if (validStatus) {
    conditions.push(eq(articleComments.moderationStatus, validStatus));
  }

  const rows = await db
    .select({
      id: articleComments.id,
      articleId: articleComments.articleId,
      articleTitle: articles.title,
      articleSlug: articles.slug,
      authorName: articleComments.authorName,
      bodySanitized: articleComments.bodySanitized,
      moderationStatus: articleComments.moderationStatus,
      createdAt: articleComments.createdAt,
    })
    .from(articleComments)
    .innerJoin(articles, eq(articleComments.articleId, articles.id))
    .where(and(...conditions))
    .orderBy(desc(articleComments.createdAt))
    .limit(100);

  return NextResponse.json({
    items: rows.map((row) => ({
      id: row.id,
      articleId: row.articleId,
      articleTitle: row.articleTitle,
      articleSlug: row.articleSlug,
      authorName: row.authorName,
      bodySanitized: row.bodySanitized,
      moderationStatus: row.moderationStatus,
      createdAt: row.createdAt.toISOString(),
    })),
  });
});

