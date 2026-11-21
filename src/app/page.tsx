import { getCmsSnapshot } from "@/lib/cms/repository";
import {
  localizeCmsSnapshot,
  localizePublicFolders,
  localizePublicProjects,
} from "@/lib/i18n/dictionary";
import { getServerLocale } from "@/lib/i18n/server";
import {
  listPublicFolders,
  listPublicHomeProjects,
} from "@/lib/projects/repository";
import {
  FALLBACK_FOLDERS,
  FALLBACK_LOGOS,
  FALLBACK_PROJECTS,
  FALLBACK_SKILLS,
} from "@/lib/projects/public-fallback";
import { MinimalHeader } from "@/components/public/MinimalHeader";
import { AltennisHero } from "@/components/public/AltennisHero";
import { StickyProjectStage } from "@/components/public/StickyProjectStage";
import { FoldersSection } from "@/components/public/FoldersSection";
import { SkillsAndLogosSection } from "@/components/public/SkillsAndLogosSection";
import { AboutAndFooter } from "@/components/public/AboutAndFooter";

export const dynamic = "force-dynamic";

interface HomePageProps {
  searchParams?: Promise<{ lang?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = (await searchParams) ?? {};
  const locale = await getServerLocale(params.lang);

  const [rawCms, dbProjects, dbFolders] = await Promise.all([
    getCmsSnapshot(),
    listPublicHomeProjects(),
    listPublicFolders(),
  ]);

  const cms = localizeCmsSnapshot(
    {
      ...rawCms,
      skills: rawCms.skills.length > 0 ? rawCms.skills : FALLBACK_SKILLS,
      logos: rawCms.logos.length > 0 ? rawCms.logos : FALLBACK_LOGOS,
    },
    locale
  );

  const homeProjects = localizePublicProjects(
    dbProjects.length > 0 ? dbProjects.slice(0, 3) : FALLBACK_PROJECTS.slice(0, 3),
    locale
  );
  const publicFolders = localizePublicFolders(
    dbFolders.length > 0 ? dbFolders : FALLBACK_FOLDERS,
    locale
  );
  const publicSkills = cms.skills;
  const publicLogos = cms.logos;

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#111111]">
      <MinimalHeader header={cms.header} locale={locale} />

      <main>
        <AltennisHero hero={cms.hero} locale={locale} />

        <StickyProjectStage
          title={cms.sectionTitles.projectsTitle}
          subtitle={cms.sectionTitles.projectsSubtitle}
          projects={homeProjects}
          locale={locale}
        />

        <FoldersSection
          title={cms.sectionTitles.foldersTitle}
          folders={publicFolders}
          locale={locale}
        />

        <SkillsAndLogosSection
          skillsTitle={cms.sectionTitles.skillsTitle}
          skills={publicSkills}
          logosTitle={cms.sectionTitles.logosTitle}
          logos={publicLogos}
        />
      </main>

      <AboutAndFooter about={cms.about} socials={cms.socials} locale={locale} />
    </div>
  );
}
