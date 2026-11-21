import { desc, eq, isNull } from "drizzle-orm";
import { ArticlesManagerClient } from "@/components/dashboard/ArticlesManagerClient";
import { getDb } from "@/lib/db";
import { articleComments, articles } from "@/lib/db/schema";

export default async function StudioArticlesPage() {
  const db = getDb();
  const [rows, commentRows] = await Promise.all([
    db
      .select({
        id: articles.id,
        title: articles.title,
        slug: articles.slug,
        excerpt: articles.excerpt,
        status: articles.status,
        blocks: articles.blocks,
        tags: articles.tags,
        readingMinutes: articles.readingMinutes,
      })
      .from(articles)
      .where(isNull(articles.deletedAt))
      .orderBy(desc(articles.updatedAt)),
    db
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
      .where(isNull(articleComments.deletedAt))
      .orderBy(desc(articleComments.createdAt))
      .limit(100),
  ]);

  return (
    <div className="space-y-6">
      <div className="border-b border-[var(--dash-border)] pb-5">
        <h1 className="text-2xl font-semibold tracking-[-0.02em] text-[var(--dash-text)]">
          Articles &amp; Commentaires
        </h1>
        <p className="mt-1 text-sm text-[var(--dash-muted)]">
          Rédigez vos essais avec hiérarchie typographique, listes, citations, signatures et modérez les réactions visiteurs.
        </p>
      </div>

      <ArticlesManagerClient
        initialArticles={rows}
        initialComments={commentRows.map((c) => ({
          id: c.id,
          articleId: c.articleId,
          articleTitle: c.articleTitle,
          articleSlug: c.articleSlug,
          authorName: c.authorName,
          bodySanitized: c.bodySanitized,
          moderationStatus: c.moderationStatus,
          createdAt: c.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
