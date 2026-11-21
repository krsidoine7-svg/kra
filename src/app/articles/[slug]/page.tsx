import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { getPublicArticleBySlug } from "@/lib/articles/repository";
import { getCmsSnapshot } from "@/lib/cms/repository";
import {
  getDictionary,
  localizeArticleDetail,
  localizeCmsSnapshot,
} from "@/lib/i18n/dictionary";
import { getServerLocale } from "@/lib/i18n/server";
import { AboutAndFooter } from "@/components/public/AboutAndFooter";
import { ArticleCommentsSection } from "@/components/public/ArticleCommentsSection";
import { ArticleRenderer } from "@/components/public/ArticleRenderer";
import { MinimalHeader } from "@/components/public/MinimalHeader";
import { ProjectShareMenu } from "@/components/public/ProjectShareMenu";
import { ViewBeacon } from "@/components/public/ViewBeacon";

interface ArticleDetailProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ArticleDetailProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getPublicArticleBySlug(slug);
  if (!article) {
    return { title: "Article introuvable" };
  }
  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: `${article.title} — Manu KRA`,
      description: article.excerpt,
      type: "article",
    },
  };
}

export default async function ArticleDetailPage({ params }: ArticleDetailProps) {
  const { slug } = await params;
  const locale = await getServerLocale();
  const t = getDictionary(locale).articleDetail;
  const dateLocale = locale === "en" ? "en-GB" : "fr-FR";

  const [rawCms, rawArticle] = await Promise.all([
    getCmsSnapshot(),
    getPublicArticleBySlug(slug),
  ]);

  if (!rawArticle) {
    notFound();
  }

  const cms = localizeCmsSnapshot(rawCms, locale);
  const article = localizeArticleDetail(rawArticle, locale);

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#111111]">
      <MinimalHeader header={cms.header} locale={locale} />

      <main className="mx-auto max-w-3xl px-4 py-12 md:px-8 md:py-16">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E2E8F0] pb-6">
          <Link
            href="/articles"
            className="font-mono-tech inline-flex min-h-[44px] items-center gap-2 text-xs text-[#0F2942] hover:underline"
          >
            <ArrowLeft size={14} weight="bold" aria-hidden="true" />
            {t.backToArticles}
          </Link>

          <ProjectShareMenu
            title={article.title}
            slug={article.slug}
            summary={article.excerpt}
            pathPrefix="/articles"
            locale={locale}
          />
        </div>

        <article className="mt-8">
          <header className="space-y-4 border-b border-[#EAEAEA] pb-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-mono-tech text-xs text-[#6B6B6B]">
                {article.publishedAt
                  ? new Date(article.publishedAt).toLocaleDateString(dateLocale, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : t.defaultType}
              </span>
              <span className="font-mono-tech text-xs text-[#6B6B6B]">
                · {article.readingMinutes} {t.minRead}
              </span>
            </div>

            <h1 className="font-display text-3xl font-bold leading-[1.08] tracking-[-0.03em] text-[#111111] md:text-5xl">
              {article.title}
            </h1>

            <p className="text-base leading-relaxed text-[#525252] md:text-lg">
              {article.excerpt}
            </p>

            {article.tags.length > 0 ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {article.tags.map((itemTag) => (
                  <span
                    key={itemTag}
                    className="font-mono-tech rounded-[4px] border border-[#EAEAEA] bg-[#FFFFFF] px-2.5 py-0.5 text-xs text-[#525252]"
                  >
                    #{itemTag}
                  </span>
                ))}
              </div>
            ) : null}
          </header>

          <div className="pt-8">
            <ArticleRenderer blocks={article.blocks} locale={locale} />
          </div>
        </article>

        <ArticleCommentsSection
          slug={article.slug}
          initialComments={article.comments}
          locale={locale}
        />
        <ViewBeacon
          eventType="article_view"
          targetSlug={article.slug}
          targetId={article.id}
        />
      </main>

      <AboutAndFooter about={cms.about} socials={cms.socials} locale={locale} />
    </div>
  );
}

