import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { listPublicArticles } from "@/lib/articles/repository";
import { getCmsSnapshot } from "@/lib/cms/repository";
import {
  getDictionary,
  localizeArticleSummary,
  localizeCmsSnapshot,
} from "@/lib/i18n/dictionary";
import { getServerLocale } from "@/lib/i18n/server";
import { AboutAndFooter } from "@/components/public/AboutAndFooter";
import { MinimalHeader } from "@/components/public/MinimalHeader";
import { ProjectShareMenu } from "@/components/public/ProjectShareMenu";

export const metadata: Metadata = {
  title: "Articles",
  description:
    "Notes d'analyse économique, communication institutionnelle et essais de Manu KRA.",
};

interface ArticlesPageProps {
  searchParams?: Promise<{ q?: string; tag?: string; lang?: string }>;
}

export default async function ArticlesIndexPage({
  searchParams,
}: ArticlesPageProps) {
  const params = (await searchParams) ?? {};
  const locale = await getServerLocale(params.lang);
  const t = getDictionary(locale).articlesIndex;
  const dateLocale = locale === "en" ? "en-GB" : "fr-FR";
  const q = params.q?.trim() ?? "";
  const tag = params.tag?.trim() ?? "";

  const [rawCms, rawItems] = await Promise.all([
    getCmsSnapshot(),
    listPublicArticles({ q, tag }),
  ]);

  const cms = localizeCmsSnapshot(rawCms, locale);
  const items = rawItems.map((item) => localizeArticleSummary(item, locale));

  const allTags = Array.from(
    new Set(items.flatMap((article) => article.tags))
  ).slice(0, 8);

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#111111]">
      <MinimalHeader header={cms.header} locale={locale} />

      <main className="mx-auto max-w-4xl px-4 py-12 md:px-8 md:py-16">
        <Link
          href="/"
          className="font-mono-tech inline-flex min-h-[44px] items-center gap-2 text-xs text-[#0F2942] hover:underline"
        >
          <ArrowLeft size={14} weight="bold" aria-hidden="true" />
          {t.backHome}
        </Link>

        <div className="mt-6 border-b border-[#E2E8F0] pb-8">
          <p className="font-mono-tech text-xs uppercase tracking-[0.06em] text-[#0F2942]">
            {t.eyebrow}
          </p>
          <h1 className="font-display mt-2 text-4xl font-bold tracking-[-0.03em] text-[#111111] md:text-5xl">
            {cms.sectionTitles.articlesTitle}
          </h1>
          <p className="mt-3 max-w-xl text-base text-[#525252]">{t.subtitle}</p>

          <form
            action="/articles"
            method="GET"
            className="mt-6 flex flex-wrap items-center gap-2"
          >
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder={t.searchPlaceholder}
              aria-label={t.searchAria}
              className="h-10 min-w-[220px] flex-1 rounded-[4px] border border-[#D5E0EC] bg-[#FFFFFF] px-3 text-sm text-[#111111] placeholder:text-[#6B6B6B] focus:border-[#0F2942] focus:outline-none"
            />
            {tag ? <input type="hidden" name="tag" value={tag} /> : null}
            <button
              type="submit"
              className="inline-flex h-10 items-center rounded-[6px] bg-[#0F2942] px-4 text-sm font-medium text-[#FFFFFF] transition-colors hover:bg-[#183D61]"
            >
              {t.filterBtn}
            </button>
            {(q || tag) ? (
              <Link
                href="/articles"
                className="font-mono-tech inline-flex h-10 items-center px-3 text-xs text-[#0F2942] underline"
              >
                {t.resetFilters}
              </Link>
            ) : null}
          </form>

          {allTags.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {allTags.map((itemTag) => (
                <Link
                  key={itemTag}
                  href={`/articles?tag=${encodeURIComponent(itemTag)}`}
                  className={
                    tag.toLowerCase() === itemTag.toLowerCase()
                      ? "font-mono-tech rounded-[4px] bg-[#0F2942] px-2.5 py-1 text-xs text-[#FFFFFF]"
                      : "font-mono-tech rounded-[4px] border border-[#D5E0EC] bg-[#FFFFFF] px-2.5 py-1 text-xs text-[#111111] hover:border-[#0F2942]"
                  }
                >
                  #{itemTag}
                </Link>
              ))}
            </div>
          ) : null}
        </div>

        <div className="divide-y divide-[#EAEAEA]">
          {items.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-[#525252]">{t.emptyText}</p>
            </div>
          ) : (
            items.map((article) => (
              <article key={article.id} className="py-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono-tech text-xs text-[#6B6B6B]">
                      {article.publishedAt
                        ? new Date(article.publishedAt).toLocaleDateString(
                            dateLocale,
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )
                        : t.recentLabel}
                    </span>
                    <span className="font-mono-tech text-xs text-[#6B6B6B]">
                      · {article.readingMinutes} {t.minRead}
                    </span>
                  </div>
                  <ProjectShareMenu
                    title={article.title}
                    slug={article.slug}
                    summary={article.excerpt}
                    pathPrefix="/articles"
                    locale={locale}
                  />
                </div>

                <h2 className="font-display mt-3 text-2xl font-bold leading-[1.15] tracking-[-0.02em] text-[#111111] md:text-3xl">
                  <Link
                    href={`/articles/${article.slug}`}
                    className="hover:underline"
                  >
                    {article.title}
                  </Link>
                </h2>

                <p className="mt-3 text-base leading-relaxed text-[#525252]">
                  {article.excerpt}
                </p>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((itemTag) => (
                      <span
                        key={itemTag}
                        className="font-mono-tech rounded-[4px] border border-[#EAEAEA] bg-[#FFFFFF] px-2 py-0.5 text-[11px] text-[#525252]"
                      >
                        {itemTag}
                      </span>
                    ))}
                  </div>
                  <Link
                    href={`/articles/${article.slug}`}
                    className="font-mono-tech inline-flex min-h-[44px] items-center gap-1.5 text-xs font-medium text-[#111111] hover:underline"
                  >
                    {t.readArticle}
                    <ArrowRight size={14} weight="bold" aria-hidden="true" />
                  </Link>
                </div>
              </article>
            ))
          )}
        </div>
      </main>

      <AboutAndFooter about={cms.about} socials={cms.socials} locale={locale} />
    </div>
  );
}
