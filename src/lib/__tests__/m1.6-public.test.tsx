import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import {
  DEFAULT_HEADER_CMS,
  DEFAULT_HERO_CMS,
} from "@/lib/cms/defaults";
import { FALLBACK_PROJECTS } from "@/lib/projects/public-fallback";
import { MinimalHeader } from "@/components/public/MinimalHeader";
import { AltennisHero } from "@/components/public/AltennisHero";
import { StickyProjectStage } from "@/components/public/StickyProjectStage";
import { ProjectShareMenu } from "@/components/public/ProjectShareMenu";

describe("Module M1.6 — Vitrine Publique, Hero ALTENNIS, Scroll 3 Projets & Partage '...'", () => {
  it("n'expose aucun bouton Connexion ou Admin dans le header public", () => {
    render(<MinimalHeader header={DEFAULT_HEADER_CMS} />);

    expect(screen.getByText("MANU KRA")).toBeInTheDocument();
    expect(screen.queryByText(/connexion/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/admin/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/login/i)).not.toBeInTheDocument();
  });

  it("affiche le Hero raffiné avec titre réduit et boutons minimalistes pour Manu KRA", () => {
    render(<AltennisHero hero={DEFAULT_HERO_CMS} />);

    expect(
      screen.queryByText("[ COMMUNICATION & ÉCONOMIE ]")
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("[ PORTRAIT · ABIDJAN ]")
    ).not.toBeInTheDocument();
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent(/STRATÉGIE DE/i);
    expect(heading.className).toContain("2.6rem");
    expect(heading.innerHTML).not.toContain("lg:text-right");

    const primaryCta = screen.getByRole("link", { name: /voir les projets/i });
    const secondaryCta = screen.getByRole("link", { name: /à propos/i });
    expect(primaryCta.className).toContain("bg-[#0F2942]");
    expect(primaryCta.className).not.toContain("bg-[#111111]");
    expect(secondaryCta.className).toContain("border-[#D5E0EC]");
    expect(heading.className).toContain("text-[#111111]");

    // Compatibilité avec d'anciennes données CMS entre crochets
    render(
      <AltennisHero
        hero={{
          ...DEFAULT_HERO_CMS,
          bottomActions: [
            { label: "[ VOIR LES PROJETS ]", href: "#projets" },
            { label: "[ À PROPOS ]", href: "#a-propos" },
          ],
        }}
      />
    );
    expect(screen.queryByText("[ VOIR LES PROJETS ]")).not.toBeInTheDocument();
    expect(screen.getAllByText("Voir les projets").length).toBeGreaterThan(1);
  });

  it("plafonne strictement la section scroll-pinned à 3 projets max et propose 'Voir plus de projets'", () => {
    const fourProjects = [
      ...FALLBACK_PROJECTS,
      {
        ...FALLBACK_PROJECTS[0]!,
        id: "extra-4",
        title: "Quatrième Projet Interdit Sur Accueil",
        slug: "quatrieme-interdit",
      },
    ];

    render(
      <StickyProjectStage
        title="PROJETS SÉLECTIONNÉS"
        subtitle="Sous-titre"
        projects={fourProjects}
      />
    );

    expect(
      screen.queryByText("Quatrième Projet Interdit Sur Accueil")
    ).not.toBeInTheDocument();
    expect(
      screen.getAllByText("Observatoire des Marchés Urbains — Abidjan").length
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByRole("link", { name: /voir plus de projets/i }).length
    ).toBeGreaterThan(0);
  });

  it("copie le lien canonique et propose le partage fallback dans le menu '...'", async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: writeTextMock },
      configurable: true,
    });
    Object.defineProperty(navigator, "share", {
      value: undefined,
      configurable: true,
    });

    render(
      <ProjectShareMenu
        title="Observatoire des Marchés"
        slug="observatoire-marches-abidjan"
      />
    );

    const trigger = screen.getByRole("button", {
      name: /options de partage pour observatoire des marchés/i,
    });
    fireEvent.keyDown(trigger, { key: "Enter" });

    const copyBtn = await screen.findByText("Copier le lien");
    fireEvent.click(copyBtn);

    await waitFor(() => {
      expect(writeTextMock).toHaveBeenCalledWith(
        expect.stringContaining("/projets/observatoire-marches-abidjan")
      );
    });

    // Réouverture pour tester Partager fallback (WhatsApp / LinkedIn / X)
    fireEvent.keyDown(trigger, { key: "Enter" });
    const shareBtn = await screen.findByText("Partager le lien");
    fireEvent.click(shareBtn);

    expect(await screen.findByText("WhatsApp")).toBeInTheDocument();
    expect(screen.getByText("LinkedIn")).toBeInTheDocument();
  });
});

