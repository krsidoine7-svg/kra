import { and, desc, eq, ilike, isNull, or } from "drizzle-orm";
import { getDb } from "@/lib/db";
import {
  articleComments,
  articles,
  type ArticleBlockSchemaRecord,
} from "@/lib/db/schema";
import { buildPublicMediaUrl } from "@/lib/storage/s3";

export interface PublicArticleSummaryDTO {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  tags: string[];
  readingMinutes: number;
  coverUrl: string | null;
  coverLqip: string | null;
  publishedAt: string | null;
}

export interface PublicArticleCommentDTO {
  id: string;
  authorName: string;
  bodySanitized: string;
  createdAt: string;
}

export interface PublicArticleDetailDTO extends PublicArticleSummaryDTO {
  blocks: ArticleBlockSchemaRecord[];
  comments: PublicArticleCommentDTO[];
}

export const FALLBACK_ARTICLES: PublicArticleDetailDTO[] = [
  {
    id: "00000000-0000-0000-0000-000000000501",
    title: "Communication publique et lisibilité économique en Côte d'Ivoire",
    slug: "communication-publique-lisibilite-economique-ci",
    excerpt:
      "Pourquoi la pédagogie des indicateurs macroéconomiques renforce la confiance des citoyens, des PME et des investisseurs.",
    tags: ["Économie", "Communication", "Côte d'Ivoire"],
    readingMinutes: 4,
    coverUrl: null,
    coverLqip: null,
    publishedAt: "2026-03-10T09:00:00.000Z",
    blocks: [
      {
        id: "blk-1",
        type: "heading",
        level: 1,
        text: "Traduire la donnée économique en repères concrets",
      },
      {
        id: "blk-2",
        type: "paragraph",
        text: "Un chiffre macroéconomique n'emporte l'adhésion que lorsqu'il éclaire la décision quotidienne des entrepreneurs et des collectivités locales.",
        link: {
          label: "Explorer les travaux associés",
          url: "https://manukra.ci/projets",
        },
      },
      {
        id: "blk-3",
        type: "heading",
        level: 2,
        text: "Trois principes d'architecture éditoriale",
      },
      {
        id: "blk-4",
        type: "bullet_list",
        items: [
          "Hiérarchiser les faits avant le commentaire institutionnel",
          "Contextualiser les tendances UEMOA avec les prix de terrain",
          "Concevoir des synthèses consultables rapidement sur mobile 3G",
        ],
      },
      {
        id: "blk-5",
        type: "quote",
        text: "Nommer avec rigueur les mécanismes d'un marché, c'est déjà réduire l'incertitude des acteurs.",
        author: "Manu KRA",
      },
      {
        id: "blk-6",
        type: "dash_list",
        items: [
          "Clarté méthodologique sur les sources",
          "Régularité des notes de conjoncture",
          "Dialogue ouvert avec les lecteurs",
        ],
      },
      {
        id: "blk-7",
        type: "signature",
        name: "Manu KRA",
        role: "Communication Stratégique & Analyse Économique",
        city: "Abidjan",
        date: "2026",
      },
    ],
    comments: [],
  },
];

export async function listPublicArticles(params?: {
  q?: string;
  tag?: string;
}): Promise<PublicArticleSummaryDTO[]> {
  try {
    const db = getDb();
    const conditions = [
      isNull(articles.deletedAt),
      eq(articles.status, "published"),
    ];

    if (params?.q && params.q.trim().length > 0) {
      const pattern = `%${params.q.trim()}%`;
      conditions.push(
        or(ilike(articles.title, pattern), ilike(articles.excerpt, pattern))!
      );
    }

    const rows = await db
      .select({
        id: articles.id,
        title: articles.title,
        slug: articles.slug,
        excerpt: articles.excerpt,
        tags: articles.tags,
        readingMinutes: articles.readingMinutes,
        coverObjectKey: articles.coverObjectKey,
        coverLqip: articles.coverLqip,
        publishedAt: articles.publishedAt,
      })
      .from(articles)
      .where(and(...conditions))
      .orderBy(desc(articles.publishedAt), desc(articles.createdAt))
      .limit(24);

    const mapped = rows.map((row) => ({
      id: row.id,
      title: row.title,
      slug: row.slug,
      excerpt: row.excerpt,
      tags: row.tags,
      readingMinutes: row.readingMinutes,
      coverUrl: row.coverObjectKey
        ? buildPublicMediaUrl(row.coverObjectKey)
        : null,
      coverLqip: row.coverLqip,
      publishedAt: row.publishedAt ? row.publishedAt.toISOString() : null,
    }));

    if (params?.tag && params.tag.trim().length > 0) {
      const targetTag = params.tag.trim().toLowerCase();
      return mapped.filter((item) =>
        item.tags.some((t) => t.toLowerCase() === targetTag)
      );
    }

    return mapped;
  } catch {
    if (!process.env.DATABASE_URL) {
      return FALLBACK_ARTICLES;
    }
    return [];
  }
}

export async function getPublicArticleBySlug(
  slug: string
): Promise<PublicArticleDetailDTO | null> {
  try {
    const db = getDb();
    const [article] = await db
      .select({
        id: articles.id,
        title: articles.title,
        slug: articles.slug,
        excerpt: articles.excerpt,
        tags: articles.tags,
        readingMinutes: articles.readingMinutes,
        coverObjectKey: articles.coverObjectKey,
        coverLqip: articles.coverLqip,
        publishedAt: articles.publishedAt,
        blocks: articles.blocks,
      })
      .from(articles)
      .where(
        and(
          eq(articles.slug, slug),
          isNull(articles.deletedAt),
          eq(articles.status, "published")
        )
      )
      .limit(1);

    if (!article) {
      return null;
    }

    const commentRows = await db
      .select({
        id: articleComments.id,
        authorName: articleComments.authorName,
        bodySanitized: articleComments.bodySanitized,
        createdAt: articleComments.createdAt,
      })
      .from(articleComments)
      .where(
        and(
          eq(articleComments.articleId, article.id),
          eq(articleComments.moderationStatus, "approved"),
          isNull(articleComments.deletedAt)
        )
      )
      .orderBy(desc(articleComments.createdAt))
      .limit(50);

    return {
      id: article.id,
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      tags: article.tags,
      readingMinutes: article.readingMinutes,
      coverUrl: article.coverObjectKey
        ? buildPublicMediaUrl(article.coverObjectKey)
        : null,
      coverLqip: article.coverLqip,
      publishedAt: article.publishedAt
        ? article.publishedAt.toISOString()
        : null,
      blocks: article.blocks,
      comments: commentRows.map((c) => ({
        id: c.id,
        authorName: c.authorName,
        bodySanitized: c.bodySanitized,
        createdAt: c.createdAt.toISOString(),
      })),
    };
  } catch {
    if (!process.env.DATABASE_URL) {
      return FALLBACK_ARTICLES.find((a) => a.slug === slug) ?? null;
    }
    return null;
  }
}

