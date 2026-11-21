import Link from "next/link";
import { getDictionary, type Locale } from "@/lib/i18n/dictionary";
import type { AboutCms, SocialsCms } from "@/lib/validators/cms";

interface AboutAndFooterProps {
  about: AboutCms;
  socials: SocialsCms;
  locale?: Locale;
}

export function AboutAndFooter({
  about,
  socials,
  locale = "fr",
}: AboutAndFooterProps) {
  const t = getDictionary(locale).aboutFooter;
  return (
    <>
      {/* À propos en 2 colonnes */}
      <section
        id="a-propos"
        aria-label={t.sectionAria}
        className="mx-auto max-w-6xl px-4 py-14 md:px-8 md:py-20"
      >
        <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <p className="font-mono-tech text-xs uppercase tracking-[0.06em] text-[#0F2942]">
              {t.eyebrow}
            </p>
            <h2 className="font-display mt-2 text-2xl font-bold leading-[1.08] tracking-[-0.02em] text-[#111111] md:text-4xl">
              {about.sectionTitle}
            </h2>
          </div>

          <div className="space-y-4">
            <p className="font-editorial border-l-2 border-[#0F2942] pl-4 text-xl italic text-[#111111] md:text-2xl">
              {about.lead}
            </p>
            {about.paragraphs.map((paragraph, index) => (
              <p
                key={index}
                className="text-sm leading-[1.7] text-[#525252] md:text-base"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Bleu Marine & Blanc (aucun lien de connexion admin) */}
      <footer className="border-t border-[#E2E8F0] bg-[#F7F9FC]">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 md:flex-row md:items-center md:justify-between md:px-8">
          <div className="space-y-1">
            <p className="font-display text-sm font-bold uppercase text-[#111111]">
              {socials.city}
            </p>
            <a
              href={`mailto:${socials.emailPublic}`}
              className="font-mono-tech text-xs text-[#0F2942] hover:underline"
            >
              {socials.emailPublic}
            </a>
          </div>

          <div className="flex flex-wrap items-center gap-5">
            {socials.links.map((link) => (
              <a
                key={link.label + link.url}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono-tech inline-flex min-h-[44px] items-center text-xs text-[#111111] transition-colors hover:text-[#0F2942] hover:underline"
              >
                {link.label}
              </a>
            ))}
            <Link
              href="/mentions-legales"
              className="font-mono-tech inline-flex min-h-[44px] items-center text-xs text-[#6B6B6B] hover:text-[#111111] hover:underline"
            >
              {t.legalNotice}
            </Link>
          </div>

          <p className="font-mono-tech text-xs text-[#6B6B6B]">
            {socials.copyright}
          </p>
        </div>
      </footer>
    </>
  );
}

