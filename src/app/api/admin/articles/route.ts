import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { desc, isNull } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { articles } from "@/lib/db/schema";
import { recordSecurityAuditLog } from "@/lib/security/audit";
import { withAdminAuth } from "@/lib/security/with-admin-auth";
import {
  ArticleCreateSchema,
  estimateReadingMinutes,
} from "@/lib/validators/article";

export const GET = withAdminAuth(async () => {
  const db = getDb();
  const rows = await db
    .select({
      id: articles.id,
      title: articles.title,
      slug: articles.slug,
      excerpt: articles.excerpt,
      status: articles.status,
      blocks: articles.blocks,
      tags: articles.tags,
      readingMinutes: articles.readingMinutes,
      publishedAt: articles.publishedAt,
      updatedAt: articles.updatedAt,
    })
    .from(articles)
    .where(isNull(articles.deletedAt))
    .orderBy(desc(articles.updatedAt));

  return NextResponse.json({ items: rows });
});

export const POST = withAdminAuth(async (request, session) => {
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide." }, { status: 400 });
  }

  const parsed = ArticleCreateSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Données invalides." },
      { status: 400 }
    );
  }

  const db = getDb();
  const readingMinutes =
    parsed.data.readingMinutes ?? estimateReadingMinutes(parsed.data.blocks);

  const [created] = await db
    .insert(articles)
    .values({
      title: parsed.data.title,
      slug: parsed.data.slug,
      excerpt: parsed.data.excerpt,
      status: parsed.data.status,
      blocks: parsed.data.blocks,
      tags: parsed.data.tags,
      readingMinutes,
      coverObjectKey: parsed.data.coverObjectKey ?? null,
      coverLqip: parsed.data.coverLqip ?? null,
      publishedAt: parsed.data.status === "published" ? new Date() : null,
    })
    .returning();

  await recordSecurityAuditLog({
    adminId: session.adminId,
    action: "article_created",
    entityType: "article",
    entityId: created?.id ?? null,
    metadata: { slug: parsed.data.slug, status: parsed.data.status },
  });

  revalidatePath("/articles");
  if (created) {
    revalidatePath(`/articles/${created.slug}`);
  }

  return NextResponse.json({ ok: true, item: created }, { status: 201 });
});

