"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "@phosphor-icons/react";
import { getDictionary, type Locale } from "@/lib/i18n/dictionary";
import type { PublicProjectDTO } from "@/lib/projects/repository";
import { ProjectShareMenu } from "@/components/public/ProjectShareMenu";
import { cn } from "@/lib/utils";

interface StickyProjectStageProps {
  title: string;
  subtitle: string;
  projects: PublicProjectDTO[];
  locale?: Locale;
}

export function StickyProjectStage({
  title,
  subtitle,
  projects,
  locale = "fr",
}: StickyProjectStageProps) {
  const t = getDictionary(locale).projectsStage;
  const cappedProjects = projects.slice(0, 3);
  const count = cappedProjects.length;

  const stageWrapperRef = React.useRef<HTMLDivElement | null>(null);
  const [progress, setProgress] = React.useState(0);
  const [activeIndex, setActiveIndex] = React.useState(0);

  React.useEffect(() => {
    if (count <= 1) return;

    let rafId = 0;

    function updateProgress() {
      const container = stageWrapperRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const scrollableDistance = rect.height - window.innerHeight;

      if (scrollableDistance <= 0) {
        setProgress(0);
        setActiveIndex(0);
        return;
      }

      const raw = Math.min(1, Math.max(0, -rect.top / scrollableDistance));
      setProgress(raw);
      setActiveIndex(
        Math.min(count - 1, Math.max(0, Math.round(raw * (count - 1))))
      );
    }

    function onScroll() {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateProgress);
    }

    updateProgress();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [count]);

  function scrollToProject(targetIdx: number) {
    const container = stageWrapperRef.current;
    if (!container || count <= 1) return;

    const clamped = Math.min(count - 1, Math.max(0, targetIdx));
    const rect = container.getBoundingClientRect();
    const scrollableDistance = rect.height - window.innerHeight;
    const containerTop = window.scrollY + rect.top;
    const targetY =
      containerTop + (clamped / (count - 1)) * Math.max(0, scrollableDistance);

    window.scrollTo({ top: targetY, behavior: "smooth" });
  }

  if (count === 0) {
    return null;
  }

  return (
    <section
      id="projets"
      aria-label={t.sectionAria}
      className="bg-[#0F2942] text-[#FFFFFF]"
    >
      {/* VERSION DESKTOP : Scène Scroll-Pinned (on scrolle sans quitter la section) */}
      <div
        ref={stageWrapperRef}
        className="hidden lg:block motion-reduce:hidden"
        style={{ height: `${Math.max(1, count) * 90}svh` }}
      >
        <div className="sticky top-0 flex h-[100svh] flex-col justify-between overflow-hidden px-8 py-10">
          {/* En-tête fixe dans la scène */}
          <div className="mx-auto flex w-full max-w-6xl items-end justify-between gap-6 border-b border-[#244C73] pb-5">
            <div>
              <p className="font-mono-tech text-xs tracking-[0.06em] text-[#9CCBE3]">
                [ 0{activeIndex + 1} / 0{count} ]
              </p>
              <h2 className="font-display mt-1.5 text-3xl font-bold tracking-[-0.02em]">
                {title}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <p className="hidden max-w-xs text-right text-xs text-[#C6DAE9] xl:block">
                {subtitle}
              </p>
              <button
                type="button"
                aria-label={t.prevProjectAria}
                disabled={activeIndex === 0}
                onClick={() => scrollToProject(activeIndex - 1)}
                className="flex h-10 w-10 items-center justify-center rounded-[4px] border border-[#2B547B] text-[#FFFFFF] transition-colors hover:bg-[#183D61] disabled:opacity-30"
              >
                <ArrowLeft size={16} weight="bold" aria-hidden="true" />
              </button>
              <button
                type="button"
                aria-label={t.nextProjectAria}
                disabled={activeIndex === count - 1}
                onClick={() => scrollToProject(activeIndex + 1)}
                className="flex h-10 w-10 items-center justify-center rounded-[4px] border border-[#2B547B] text-[#FFFFFF] transition-colors hover:bg-[#183D61] disabled:opacity-30"
              >
                <ArrowRight size={16} weight="bold" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Piste horizontale pilotée par la progression du scroll */}
          <div className="mx-auto my-auto w-full max-w-6xl overflow-hidden">
            <div
              className="flex transition-transform duration-150 ease-out will-change-transform"
              style={{
                transform: `translate3d(-${progress * Math.max(0, count - 1) * 100}%, 0, 0)`,
              }}
            >
              {cappedProjects.map((project, index) => (
                <article
                  key={project.id}
                  className="grid w-full shrink-0 grid-cols-[1.2fr_1fr] items-center gap-10 pr-2"
                >
                  {/* Visuel WebP + LQIP ou bloc éditorial Bleu Marine */}
                  <Link
                    href={`/projets/${project.slug}`}
                    className="group relative aspect-[16/10] w-full overflow-hidden rounded-[8px] border border-[#244C73] bg-[#143554]"
                  >
                    {project.coverMedia?.url ? (
                      <Image
                        src={project.coverMedia.url}
                        alt={project.coverMedia.altText || project.title}
                        fill
                        sizes="(min-width: 1024px) 60vw, 100vw"
                        placeholder={
                          project.coverMedia.lqipBase64 ? "blur" : "empty"
                        }
                        blurDataURL={
                          project.coverMedia.lqipBase64 ?? undefined
                        }
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="flex h-full flex-col justify-between p-8">
                        <span className="font-mono-tech text-xs text-[#9CCBE3]">
                          [ {project.folder?.name ?? t.defaultFolderTag} · 0{index + 1} ]
                        </span>
                        <p className="font-display text-3xl font-bold tracking-[-0.02em] text-[#FFFFFF]">
                          {project.title}
                        </p>
                      </div>
                    )}
                  </Link>

                  {/* Fiche éditoriale du projet */}
                  <div className="space-y-5">
                    <div className="flex items-center gap-3">
                      <span className="font-mono-tech rounded-[4px] border border-[#2B547B] bg-[#183D61] px-2.5 py-1 text-[11px] uppercase tracking-[0.05em] text-[#FFFFFF]">
                        {project.status === "upcoming" ? t.statusUpcoming : t.statusPublished}
                      </span>
                      {project.folder ? (
                        <span className="font-mono-tech text-xs text-[#C6DAE9]">
                          {project.folder.name}
                        </span>
                      ) : null}
                      {project.year ? (
                        <span className="font-mono-tech text-xs text-[#C6DAE9]">
                          · {project.year}
                        </span>
                      ) : null}
                    </div>

                    <h3 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em]">
                      <Link
                        href={`/projets/${project.slug}`}
                        className="hover:underline"
                      >
                        {project.title}
                      </Link>
                    </h3>

                    <p className="text-sm leading-relaxed text-[#E2EDF7]">
                      {project.summary}
                    </p>

                    <div className="flex items-center gap-3 pt-2">
                      <Link
                        href={`/projets/${project.slug}`}
                        className="inline-flex h-11 items-center gap-2 rounded-[6px] bg-[#FFFFFF] px-5 text-sm font-medium text-[#111111] transition-colors hover:bg-[#EBF1F7]"
                      >
                        {t.exploreProject}
                        <ArrowRight size={15} weight="bold" aria-hidden="true" />
                      </Link>

                      <ProjectShareMenu
                        title={project.title}
                        slug={project.slug}
                        summary={project.summary}
                        locale={locale}
                        variant="dark"
                      />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* Barre de progression & Bouton Voir plus de projets */}
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 border-t border-[#244C73] pt-5">
            <div className="h-[2px] flex-1 bg-[#244C73]">
              <div
                className="h-full bg-[#FFFFFF] transition-all duration-150"
                style={{
                  width: `${Math.max(12, ((activeIndex + 1) / count) * 100)}%`,
                }}
              />
            </div>

            <Link
              href="/projets"
              className="inline-flex h-11 shrink-0 items-center gap-2 rounded-[6px] border border-[#FFFFFF] px-5 text-sm font-medium text-[#FFFFFF] transition-colors hover:bg-[#FFFFFF] hover:text-[#111111]"
            >
              {t.seeMoreProjects}
              <ArrowRight size={15} weight="bold" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>

      {/* VERSION MOBILE / TABLETTE & REDUCED MOTION : Carrousel tactile fluide (zéro sticky bloquant) */}
      <div className="px-4 py-14 md:px-8 lg:hidden motion-reduce:lg:block">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="flex flex-col gap-2 border-b border-[#244C73] pb-4">
            <p className="font-mono-tech text-xs tracking-[0.06em] text-[#9CCBE3]">
              [ {count} {t.featuredPlural} ]
            </p>
            <h2 className="font-display text-2xl font-bold tracking-[-0.02em] md:text-3xl">
              {title}
            </h2>
          </div>

          <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4">
            {cappedProjects.map((project, index) => (
              <article
                key={project.id}
                className={cn(
                  "flex w-[86vw] max-w-[440px] shrink-0 snap-start flex-col justify-between rounded-[8px] border border-[#244C73] bg-[#143554] p-5"
                )}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono-tech text-xs text-[#9CCBE3]">
                      0{index + 1} ·{" "}
                      {project.status === "upcoming" ? t.statusUpcoming : t.statusPublished}
                    </span>
                    <ProjectShareMenu
                      title={project.title}
                      slug={project.slug}
                      summary={project.summary}
                      locale={locale}
                      variant="dark"
                    />
                  </div>

                  {project.coverMedia?.url ? (
                    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[6px] border border-[#244C73]">
                      <Image
                        src={project.coverMedia.url}
                        alt={project.coverMedia.altText || project.title}
                        fill
                        sizes="(max-width: 768px) 86vw, 440px"
                        placeholder={
                          project.coverMedia.lqipBase64 ? "blur" : "empty"
                        }
                        blurDataURL={
                          project.coverMedia.lqipBase64 ?? undefined
                        }
                        className="object-cover"
                      />
                    </div>
                  ) : null}

                  <h3 className="font-display text-xl font-bold leading-snug">
                    <Link
                      href={`/projets/${project.slug}`}
                      className="hover:underline"
                    >
                      {project.title}
                    </Link>
                  </h3>

                  <p className="text-sm leading-relaxed text-[#E2EDF7]">
                    {project.summary}
                  </p>
                </div>

                <div className="mt-5 pt-3">
                  <Link
                    href={`/projets/${project.slug}`}
                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[6px] bg-[#FFFFFF] px-4 text-sm font-medium text-[#111111]"
                  >
                    {t.exploreProject}
                    <ArrowRight size={15} weight="bold" aria-hidden="true" />
                  </Link>
                </div>
              </article>
            ))}
          </div>

          <div className="pt-2">
            <Link
              href="/projets"
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[6px] border border-[#FFFFFF] px-5 text-sm font-medium text-[#FFFFFF] transition-colors hover:bg-[#FFFFFF] hover:text-[#111111] sm:w-auto"
            >
              {t.seeMoreProjects}
              <ArrowRight size={15} weight="bold" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

