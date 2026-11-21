import type { Metadata } from "next";
import { getCmsSnapshot } from "@/lib/cms/repository";
import { getDictionary, localizeCmsSnapshot } from "@/lib/i18n/dictionary";
import { getServerLocale } from "@/lib/i18n/server";
import { MinimalHeader } from "@/components/public/MinimalHeader";
import { AboutAndFooter } from "@/components/public/AboutAndFooter";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mentions Légales & Confidentialité / Legal Notice",
  description:
    "Mentions légales et politique de protection des données (Loi ivoirienne n° 2013-450 / ARTCI et RGPD).",
};

export default async function LegalPage() {
  const locale = await getServerLocale();
  const t = getDictionary(locale).legal;
  const rawCms = await getCmsSnapshot();
  const cms = localizeCmsSnapshot(rawCms, locale);

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#111111]">
      <MinimalHeader header={cms.header} locale={locale} />

      <main className="mx-auto max-w-3xl space-y-8 px-4 py-12 md:px-8 md:py-16">
        <header className="border-b border-[#E2E8F0] pb-6">
          <p className="font-mono-tech text-xs uppercase tracking-[0.06em] text-[#0F2942]">
            {t.eyebrow}
          </p>
          <h1 className="font-display mt-2 text-3xl font-bold tracking-[-0.02em] text-[#111111] md:text-4xl">
            {t.heading}
          </h1>
        </header>

        <section className="space-y-3 text-sm leading-relaxed text-[#2F3437]">
          <h2 className="font-display text-lg font-bold text-[#111111]">
            {t.s1Title}
          </h2>
          <p>
            {t.s1Prefix} <strong>Manu KRA</strong> ({cms.socials.city}).{" "}
            {t.s1Activity} {t.s1Contact} {cms.socials.emailPublic}.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-[#2F3437]">
          <h2 className="font-display text-lg font-bold text-[#111111]">
            {t.s2Title}
          </h2>
          <p>
            {t.s2BodyPrefix} {cms.socials.emailPublic}.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-[#2F3437]">
          <h2 className="font-display text-lg font-bold text-[#111111]">
            {t.s3Title}
          </h2>
          <p>{t.s3Body}</p>
        </section>
      </main>

      <AboutAndFooter about={cms.about} socials={cms.socials} locale={locale} />
    </div>
  );
}

