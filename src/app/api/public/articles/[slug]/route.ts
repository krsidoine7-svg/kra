import { NextResponse } from "next/server";
import { getPublicArticleBySlug } from "@/lib/articles/repository";

interface ArticleSlugContext {
  params: Promise<{ slug: string }>;
}

export async function GET(
  _request: Request,
  context: ArticleSlugContext
) {
  const { slug } = await context.params;
  const article = await getPublicArticleBySlug(slug);
  if (!article) {
    return NextResponse.json({ error: "Article introuvable." }, { status: 404 });
  }
  return NextResponse.json({ item: article });
}

