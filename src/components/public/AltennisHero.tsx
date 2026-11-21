import Image from "next/image";
import Link from "next/link";
import { ArrowDownRight, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { getDictionary, type Locale } from "@/lib/i18n/dictionary";
import type { HeroCms } from "@/lib/validators/cms";
import { cn } from "@/lib/utils";

interface AltennisHeroProps {
  hero: HeroCms;
  locale?: Locale;
}

const LEGACY_BRACKET_LABELS: Record<string, string> = {
  "[ VOIR LES PROJETS ]": "Voir les projets",
  "[ À PROPOS ]": "À propos",
  "[ VIEW PROJECTS ]": "View projects",
  "[ ABOUT ]": "About",
};

function formatHeroActionLabel(rawLabel: string): string {
  const trimmed = rawLabel.trim();
  const mapped = LEGACY_BRACKET_LABELS[trimmed.toUpperCase()];
  if (mapped) return mapped;
  return trimmed.replace(/^\[\s*|\s*\]$/g, "");
}

function renderTitleTextWithThinAmpersand(text: string, thinAmpersand?: boolean) {
  if (!thinAmpersand || !text.includes("&")) {
    return text;
  }
  const parts = text.split("&");
  return parts.map((part, idx) => (
    <span key={idx}>
      {part}
      {idx < parts.length - 1 ? (
        <span className="font-light text-[#0F2942]">&amp;</span>
      ) : null}
    </span>
  ));
}

export function AltennisHero({ hero, locale = "fr" }: AltennisHeroProps) {
  const t = getDictionary(locale).hero;
  return (
    <section
      aria-label={t.sectionAria}
      className="relative mx-auto max-w-6xl overflow-hidden px-4 pb-16 pt-8 md:px-8 md:pb-24 md:pt-12"
    >
      {/* Profondeur lumineuse très douce conforme minimalist-skill (opacité 0.04) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-[radial-gradient(circle,#0F2942_0%,transparent_70%)] opacity-[0.04]"
      />

      {/* Grille asymétrique parfaitement alignée : colonne éditoriale à gauche, portrait à droite */}
      <div className="grid items-center gap-10 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {/* Titre H1 éditorial aligné nettement à gauche, taille réduite */}
          <h1 className="font-display max-w-2xl text-left text-[clamp(1.25rem,3.6vw,2.6rem)] font-bold uppercase leading-[1.1] tracking-[-0.025em] text-[#111111]">
            {hero.titleLines.map((line, index) => (
              <span
                key={`${line.text}-${index}`}
                className={cn(
                  "block text-left",
                  line.align === "center" && "lg:text-center",
                  line.align === "right" && "lg:text-right"
                )}
              >
                {renderTitleTextWithThinAmpersand(line.text, line.thinAmpersand)}
              </span>
            ))}
          </h1>

          <div className="max-w-lg space-y-4">
            {hero.paragraphs.map((paragraph, idx) => (
              <p
                key={idx}
                className="text-base leading-[1.65] text-[#2F3437]"
              >
                {paragraph}
              </p>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            {hero.bottomActions.map((action, index) => {
              const label = formatHeroActionLabel(action.label);
              const isPrimary = index === 0;
              return (
                <Link
                  key={action.label + action.href}
                  href={action.href}
                  className={cn(
                    "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[6px] px-5 py-2.5 text-sm font-medium tracking-[-0.01em] transition-all duration-200 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F2942]",
                    isPrimary
                      ? "bg-[#0F2942] text-[#FFFFFF] hover:bg-[#183D61]"
                      : "border border-[#D5E0EC] bg-[#FFFFFF] text-[#111111] hover:border-[#0F2942] hover:bg-[#EBF1F7] hover:shadow-[0_2px_8px_rgba(15,41,66,0.08)]"
                  )}
                >
                  <span>{label}</span>
                  {isPrimary ? (
                    <ArrowDownRight size={16} weight="bold" aria-hidden="true" />
                  ) : (
                    <ArrowRight
                      size={15}
                      weight="bold"
                      aria-hidden="true"
                      className="text-[#0F2942]"
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Bloc Portrait (WebP CMS ou monogramme éditorial Bleu Marine) */}
        <div className="w-full max-w-[320px] justify-self-start lg:justify-self-end">
          {hero.portraitUrl ? (
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[8px] border border-[#D5E0EC] bg-[#0F2942]">
              <Image
                src={hero.portraitUrl}
                alt={hero.portraitAlt}
                fill
                priority
                sizes="(max-width: 1024px) 320px, 320px"
                className="object-cover"
              />
            </div>
          ) : (
            <div
              aria-label={hero.portraitAlt}
              className="flex aspect-[4/5] w-full flex-col justify-end rounded-[8px] border border-[#0F2942] bg-[#0F2942] p-6 text-[#FFFFFF]"
            >
              <div>
                <p className="font-display text-5xl font-bold tracking-[-0.04em]">
                  MK<span className="text-[#9CCBE3]">.</span>
                </p>
                <p className="font-mono-tech mt-2 text-xs text-[#D5E3F0]">
                  {hero.brandName}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

