import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowSquareOut } from "@phosphor-icons/react/dist/ssr";
import { getCmsSnapshot } from "@/lib/cms/repository";
import {
  getDictionary,
  localizeCmsSnapshot,
  localizePublicProject,
} from "@/lib/i18n/dictionary";
import { getServerLocale } from "@/lib/i18n/server";
import { getPublicProjectBySlug } from "@/lib/projects/repository";
import { getFallbackProjectDetail } from "@/lib/projects/public-fallback";
import { MinimalHeader } from "@/components/public/MinimalHeader";
import { AboutAndFooter } from "@/components/public/AboutAndFooter";
import { ProjectShareMenu } from "@/components/public/ProjectShareMenu";
import { ProjectGallery } from "@/components/public/ProjectGallery";
import { ViewBeacon } from "@/components/public/ViewBeacon";

interface ProjectDetailProps {
  params: Promise<{ slug: string }>;
}

async function resolveProject(slug: string) {
  const fromDb = await getPublicProjectBySlug(slug);
  if (fromDb) return fromDb;
  if (!process.env.DATABASE_URL) {
    return getFallbackProjectDetail(slug);
  }
  return null;
}

export async function generateMetadata({
  params,
}: ProjectDetailProps): Promise<Metadata> {
  const { slug } = await params;
  const detail = await resolveProject(slug);
  if (!detail) {
    return { title: "Projet introuvable" };
  }
  return {
    title: detail.project.title,
    description: detail.project.summary,
    openGraph: {
      title: `${detail.project.title} — Manu KRA`,
      description: detail.project.summary,
      type: "article",
    },
  };
}

export default async function ProjectDetailPage({ params }: ProjectDetailProps) {
  const { slug } = await params;
  const locale = await getServerLocale();
  const t = getDictionary(locale).projectDetail;
  const [rawCms, detail] = await Promise.all([
    getCmsSnapshot(),
    resolveProject(slug),
  ]);

  if (!detail) {
    notFound();
  }

  const cms = localizeCmsSnapshot(rawCms, locale);
  const project = localizePublicProject(detail.project, locale);
  const { gallery } = detail;

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#111111]">
      <MinimalHeader header={cms.header} locale={locale} />

      <main className="mx-auto max-w-4xl px-4 py-12 md:px-8 md:py-16">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E2E8F0] pb-6">
          <Link
            href="/projets"
            className="font-mono-tech inline-flex min-h-[44px] items-center gap-2 text-xs text-[#0F2942] hover:underline"
          >
            <ArrowLeft size={14} weight="bold" aria-hidden="true" />
            {t.backToProjects}
          </Link>

          <ProjectShareMenu
            title={project.title}
            slug={project.slug}
            summary={project.summary}
            locale={locale}
          />
        </div>

        <header className="mt-8 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono-tech rounded-full border border-[#C5D6E6] bg-[#EBF1F7] px-3 py-0.5 text-xs uppercase text-[#0F2942]">
              {project.status === "upcoming"
                ? t.statusUpcomingLong
                : t.statusPublishedLong}
            </span>
            {project.folder ? (
              <Link
                href={`/projets?dossier=${project.folder.slug}`}
                className="font-mono-tech text-xs text-[#0F2942] hover:underline"
              >
                {t.folderPrefix} {project.folder.name}
              </Link>
            ) : null}
            {project.year ? (
              <span className="font-mono-tech text-xs text-[#6B6B6B]">
                · {project.year}
              </span>
            ) : null}
          </div>

          <h1 className="font-display text-3xl font-bold leading-[1.05] tracking-[-0.03em] text-[#111111] md:text-5xl">
            {project.title}
          </h1>

          {project.clientOrContext ? (
            <p className="font-mono-tech text-xs text-[#6B6B6B]">
              {project.clientOrContext}
            </p>
          ) : null}

          <p className="pt-2 text-base leading-[1.7] text-[#2F3437] md:text-lg">
            {project.summary}
          </p>

          {project.tags.length > 0 ? (
            <div className="flex flex-wrap gap-2 pt-2">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="font-mono-tech rounded-[4px] border border-[#D5E0EC] bg-[#F7F9FC] px-2.5 py-1 text-xs text-[#111111]"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}

          {project.externalUrl ? (
            <div className="pt-3">
              <a
                href={project.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center gap-2 rounded-[6px] bg-[#0F2942] px-5 text-sm font-medium text-[#FFFFFF] transition-colors hover:bg-[#183D61]"
              >
                {t.externalLink}
                <ArrowSquareOut size={15} weight="bold" aria-hidden="true" />
              </a>
            </div>
          ) : null}
        </header>

        <ProjectGallery title={project.title} media={gallery} locale={locale} />
        <ViewBeacon
          eventType="project_view"
          targetSlug={project.slug}
          targetId={project.id}
        />
      </main>

      <AboutAndFooter about={cms.about} socials={cms.socials} locale={locale} />
    </div>
  );
}

