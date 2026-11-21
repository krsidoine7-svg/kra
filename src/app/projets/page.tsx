import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";
import { getCmsSnapshot } from "@/lib/cms/repository";
import {
  getDictionary,
  localizeCmsSnapshot,
  localizePublicFolders,
  localizePublicProjects,
} from "@/lib/i18n/dictionary";
import { getServerLocale } from "@/lib/i18n/server";
import {
  listPublicCatalogProjects,
  listPublicFolders,
} from "@/lib/projects/repository";
import {
  FALLBACK_FOLDERS,
  FALLBACK_PROJECTS,
} from "@/lib/projects/public-fallback";
import { MinimalHeader } from "@/components/public/MinimalHeader";
import { AboutAndFooter } from "@/components/public/AboutAndFooter";
import { ProjectShareMenu } from "@/components/public/ProjectShareMenu";

export const metadata: Metadata = {
  title: "Projets / Projects",
  description:
    "Tous les projets réalisés et futurs projets à venir de Manu KRA en Communication et Économie.",
};

interface ProjectsPageProps {
  searchParams: Promise<{
    q?: string;
    dossier?: string;
    statut?: string;
    tri?: string;
    lang?: string;
  }>;
}

export default async function ProjectsCatalogPage({
  searchParams,
}: ProjectsPageProps) {
  const params = await searchParams;
  const locale = await getServerLocale(params.lang);
  const t = getDictionary(locale).catalog;
  const stDict = getDictionary(locale).projectsStage;
  const query = params.q?.trim() ?? "";
  const folderSlug = params.dossier?.trim() ?? "";
  const statusFilter =
    params.statut === "published" || params.statut === "upcoming"
      ? params.statut
      : "all";
  const sortFilter =
    params.tri === "az" || params.tri === "oldest" ? params.tri : "recent";

  const [rawCms, dbProjects, dbFolders] = await Promise.all([
    getCmsSnapshot(),
    listPublicCatalogProjects({
      q: query,
      folderSlug,
      status: statusFilter,
      sort: sortFilter,
    }),
    listPublicFolders(),
  ]);

  const cms = localizeCmsSnapshot(rawCms, locale);
  const foldersList = localizePublicFolders(
    dbFolders.length > 0 ? dbFolders : FALLBACK_FOLDERS,
    locale
  );

  let projectsList = dbProjects;
  if (projectsList.length === 0 && !process.env.DATABASE_URL) {
    projectsList = FALLBACK_PROJECTS.filter((project) => {
      if (statusFilter !== "all" && project.status !== statusFilter) return false;
      if (folderSlug && project.folder?.slug !== folderSlug) return false;
      if (
        query &&
        !`${project.title} ${project.summary}`
          .toLowerCase()
          .includes(query.toLowerCase())
      ) {
        return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortFilter === "az") return a.title.localeCompare(b.title);
      if (sortFilter === "oldest") return (a.year ?? 0) - (b.year ?? 0);
      return (b.year ?? 0) - (a.year ?? 0);
    });
  }
  projectsList = localizePublicProjects(projectsList, locale);

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#111111]">
      <MinimalHeader header={cms.header} locale={locale} />

      <main className="mx-auto max-w-6xl px-4 py-12 md:px-8 md:py-16">
        <div className="border-b border-[#E2E8F0] pb-8">
          <p className="font-mono-tech text-xs uppercase tracking-[0.06em] text-[#0F2942]">
            {t.eyebrow}
          </p>
          <h1 className="font-display mt-2 text-4xl font-bold tracking-[-0.03em] text-[#111111] md:text-5xl">
            {t.heading}
          </h1>
          <p className="mt-3 max-w-2xl text-base text-[#525252]">{t.subtitle}</p>

          {/* Barre de recherche, dossier, statut et tri */}
          <form
            method="GET"
            action="/projets"
            className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_auto]"
          >
            <div className="relative">
              <MagnifyingGlass
                size={16}
                weight="bold"
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#0F2942]"
              />
              <input
                type="search"
                name="q"
                defaultValue={query}
                placeholder={t.searchPlaceholder}
                className="h-11 w-full rounded-[4px] border border-[#D5E0EC] bg-[#FFFFFF] pl-9 pr-3 text-sm text-[#111111] placeholder:text-[#6B6B6B] focus:border-[#0F2942] focus:outline-none"
              />
            </div>

            <select
              name="dossier"
              defaultValue={folderSlug}
              aria-label={t.folderAria}
              className="h-11 rounded-[4px] border border-[#D5E0EC] bg-[#FFFFFF] px-3 text-sm text-[#111111] focus:border-[#0F2942] focus:outline-none"
            >
              <option value="">{t.allFolders}</option>
              {foldersList.map((folder) => (
                <option key={folder.id} value={folder.slug}>
                  {folder.name}
                </option>
              ))}
            </select>

            <select
              name="statut"
              defaultValue={statusFilter}
              aria-label={t.statusAria}
              className="h-11 rounded-[4px] border border-[#D5E0EC] bg-[#FFFFFF] px-3 text-sm text-[#111111] focus:border-[#0F2942] focus:outline-none"
            >
              <option value="all">{t.statusAll}</option>
              <option value="published">{t.statusPublished}</option>
              <option value="upcoming">{t.statusUpcoming}</option>
            </select>

            <select
              name="tri"
              defaultValue={sortFilter}
              aria-label={t.sortAria}
              className="h-11 rounded-[4px] border border-[#D5E0EC] bg-[#FFFFFF] px-3 text-sm text-[#111111] focus:border-[#0F2942] focus:outline-none"
            >
              <option value="recent">{t.sortRecent}</option>
              <option value="az">{t.sortAz}</option>
              <option value="oldest">{t.sortOldest}</option>
            </select>

            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center rounded-[6px] bg-[#0F2942] px-5 text-sm font-medium text-[#FFFFFF] transition-colors hover:bg-[#183D61]"
            >
              {t.filterBtn}
            </button>
          </form>
        </div>

        {/* Grille des projets */}
        {projectsList.length === 0 ? (
          <div className="my-12 rounded-[8px] border border-dashed border-[#C5D6E6] bg-[#FFFFFF] p-10 text-center">
            <p className="text-sm text-[#525252]">{t.emptyText}</p>
            <Link
              href="/projets"
              className="font-mono-tech mt-3 inline-block text-xs text-[#0F2942] underline"
            >
              {t.resetFilters}
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projectsList.map((project) => (
              <article
                key={project.id}
                className="flex flex-col justify-between rounded-[8px] border border-[#D5E0EC] bg-[#FFFFFF] p-5 transition-colors hover:border-[#0F2942]"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono-tech rounded-full border border-[#C5D6E6] bg-[#EBF1F7] px-2.5 py-0.5 text-[11px] uppercase text-[#0F2942]">
                      {project.status === "upcoming"
                        ? stDict.statusUpcoming
                        : stDict.statusPublished}
                    </span>
                    <ProjectShareMenu
                      title={project.title}
                      slug={project.slug}
                      summary={project.summary}
                      locale={locale}
                    />
                  </div>

                  {project.coverMedia?.url ? (
                    <Link
                      href={`/projets/${project.slug}`}
                      className="relative mt-4 block aspect-[16/10] w-full overflow-hidden rounded-[4px] border border-[#EAEAEA]"
                    >
                      <Image
                        src={project.coverMedia.url}
                        alt={project.coverMedia.altText || project.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        placeholder={
                          project.coverMedia.lqipBase64 ? "blur" : "empty"
                        }
                        blurDataURL={
                          project.coverMedia.lqipBase64 ?? undefined
                        }
                        className="object-cover"
                      />
                    </Link>
                  ) : null}

                  <p className="font-mono-tech mt-4 text-xs text-[#6B6B6B]">
                    {project.folder?.name ?? t.defaultFolder}
                    {project.year ? ` · ${project.year}` : ""}
                  </p>

                  <h2 className="font-display mt-1.5 text-xl font-bold leading-snug text-[#111111]">
                    <Link
                      href={`/projets/${project.slug}`}
                      className="hover:underline"
                    >
                      {project.title}
                    </Link>
                  </h2>

                  <p className="mt-2.5 text-sm leading-relaxed text-[#525252]">
                    {project.summary}
                  </p>
                </div>

                <Link
                  href={`/projets/${project.slug}`}
                  className="font-mono-tech mt-6 inline-flex min-h-[44px] items-center gap-2 text-xs font-medium text-[#111111] hover:underline"
                >
                  {t.viewFolder}
                  <ArrowRight size={14} weight="bold" aria-hidden="true" />
                </Link>
              </article>
            ))}
          </div>
        )}
      </main>

      <AboutAndFooter about={cms.about} socials={cms.socials} locale={locale} />
    </div>
  );
}

