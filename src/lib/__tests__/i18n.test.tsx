import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import {
  DEFAULT_ABOUT_CMS,
  DEFAULT_HEADER_CMS,
  DEFAULT_HERO_CMS,
  DEFAULT_SECTION_TITLES_CMS,
  DEFAULT_SOCIALS_CMS,
} from "@/lib/cms/defaults";
import {
  LOCALE_COOKIE_NAME,
  localizeCmsSnapshot,
  localizePublicFolders,
  localizePublicProjects,
} from "@/lib/i18n/dictionary";
import { FALLBACK_FOLDERS, FALLBACK_PROJECTS } from "@/lib/projects/public-fallback";
import { MinimalHeader } from "@/components/public/MinimalHeader";
import { StickyProjectStage } from "@/components/public/StickyProjectStage";
import { ArticleCommentsSection } from "@/components/public/ArticleCommentsSection";

describe("Bilingue FR / EN", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    document.cookie = `${LOCALE_COOKIE_NAME}=fr; path=/`;
  });

  it("traduit le CMS, les dossiers et les projets par défaut en anglais tout en gardant le français intact", () => {
    const baseSnapshot = {
      header: DEFAULT_HEADER_CMS,
      hero: DEFAULT_HERO_CMS,
      about: DEFAULT_ABOUT_CMS,
      socials: DEFAULT_SOCIALS_CMS,
      sectionTitles: DEFAULT_SECTION_TITLES_CMS,
      skills: [
        {
          id: "sk1",
          title: "Analyse Économique",
          description: "Notes de conjoncture",
          displayOrder: 1,
          isVisible: true,
        },
      ],
      logos: [],
    };

    const fr = localizeCmsSnapshot(baseSnapshot, "fr");
    expect(fr.hero.titleLines[0]?.text).toBe("STRATÉGIE DE");
    expect(fr.header.links[0]?.label).toBe("Accueil");

    const en = localizeCmsSnapshot(baseSnapshot, "en");
    expect(en.hero.titleLines[0]?.text).toBe("STRATEGIC");
    expect(en.hero.bottomActions[0]?.label).toBe("View projects");
    expect(en.header.links.map((l) => l.label)).toEqual([
      "Home",
      "Projects",
      "Articles",
      "About",
    ]);
    expect(en.skills[0]?.title).toBe("Economic Analysis");

    const enFolders = localizePublicFolders(FALLBACK_FOLDERS, "en");
    expect(enFolders[0]?.name).toBe("Strategy & Communication");

    const enProjects = localizePublicProjects(FALLBACK_PROJECTS, "en");
    expect(enProjects[0]?.title).toContain("Urban Markets Observatory");
  });

  it("bascule entre FR et EN dans MinimalHeader et persiste le cookie kra_locale", () => {
    render(<MinimalHeader header={DEFAULT_HEADER_CMS} locale="fr" />);

    const enBtn = screen.getByRole("button", { name: "EN" });
    const frBtn = screen.getByRole("button", { name: "FR" });

    expect(frBtn).toHaveAttribute("aria-pressed", "true");
    expect(enBtn).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(enBtn);
    expect(document.cookie).toContain(`${LOCALE_COOKIE_NAME}=en`);
    expect(document.documentElement.lang).toBe("en");
  });

  it("affiche les composants publics clés en anglais quand locale='en'", () => {
    render(
      <>
        <StickyProjectStage
          title="FEATURED PROJECTS"
          subtitle="Explore"
          projects={FALLBACK_PROJECTS}
          locale="en"
        />
        <ArticleCommentsSection
          slug="communication-publique-lisibilite-economique-ci"
          initialComments={[]}
          locale="en"
        />
      </>
    );

    expect(
      screen.getAllByRole("link", { name: /see more projects/i }).length
    ).toBeGreaterThan(0);
    expect(
      screen.getByText(/Leave a comment \(no account required\)/i)
    ).toBeInTheDocument();
  });
});

