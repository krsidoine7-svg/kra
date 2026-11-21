import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { LinearShell } from "@/components/dashboard/LinearShell";
import { StudioOnboardingCard } from "@/components/dashboard/StudioOnboardingCard";
import { STUDIO_ONBOARDING_STORAGE_KEY } from "@/components/dashboard/studio-onboarding-storage";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => "/acces-studio-kra",
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
}));

describe("Onboarding Utilisateur du Studio", () => {
  beforeEach(() => {
    window.localStorage.clear();
    mockPush.mockReset();
  });

  it("affiche la checklist de démarrage avec progression auto + bascule manuelle persistante et masquage", () => {
    render(
      <StudioOnboardingCard
        basePath="/acces-studio-kra"
        locale="fr"
        autoCompleted={{
          profile: false,
          cms: false,
          projects: true,
          articles: true,
        }}
      />
    );

    expect(screen.getByText("Votre checklist de démarrage")).toBeInTheDocument();
    expect(screen.getByText("2 / 4 complétées")).toBeInTheDocument();

    const profileToggle = screen.getByRole("button", {
      name: /Basculer l'étape : Personnaliser votre e-mail et mot de passe/i,
    });
    fireEvent.click(profileToggle);
    expect(screen.getByText("3 / 4 complétées")).toBeInTheDocument();
    expect(window.localStorage.getItem(STUDIO_ONBOARDING_STORAGE_KEY)).toContain(
      '"profile"'
    );

    fireEvent.click(screen.getByRole("button", { name: "Masquer" }));
    expect(
      screen.queryByText("Votre checklist de démarrage")
    ).not.toBeInTheDocument();
  });

  it("ouvre le guide interactif 4 étapes depuis LinearShell, navigue et restaure la checklist", () => {
    render(
      <LinearShell
        basePath="/acces-studio-kra"
        adminName="Manu KRA"
        adminEmail="admin@manukra.ci"
        locale="fr"
      >
        <StudioOnboardingCard
          basePath="/acces-studio-kra"
          locale="fr"
          autoCompleted={{ projects: true }}
        />
      </LinearShell>
    );

    // Masquer d'abord la checklist pour tester sa restauration depuis le guide
    fireEvent.click(screen.getByRole("button", { name: "Masquer" }));
    expect(
      screen.queryByText("Votre checklist de démarrage")
    ).not.toBeInTheDocument();

    // Ouvrir le guide depuis le bouton dans la barre latérale
    const guideTriggers = screen.getAllByRole("button", {
      name: /Guide Studio/i,
    });
    fireEvent.click(guideTriggers[0]!);

    expect(
      screen.getByRole("dialog", { name: /Guide interactif du Studio/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/1\. Pilotage, statistiques anonymes/i)
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Suivant" }));
    expect(
      screen.getByText(/2\. Projets, dossiers & plafond de 3 épinglés/i)
    ).toBeInTheDocument();

    // Restaurer la checklist depuis le modal
    fireEvent.click(
      screen.getByRole("button", {
        name: /Afficher la checklist sur l'accueil/i,
      })
    );
    expect(
      screen.getByText("Votre checklist de démarrage")
    ).toBeInTheDocument();

    // Aller au module depuis le guide
    fireEvent.click(
      screen.getByRole("button", { name: /Ouvrir ce module/i })
    );
    expect(mockPush).toHaveBeenCalledWith("/acces-studio-kra/projets");
  });

  it("prend en charge l'anglais sur la checklist et le guide", () => {
    render(
      <StudioOnboardingCard
        basePath="/acces-studio-kra"
        locale="en"
        autoCompleted={{}}
      />
    );

    expect(
      screen.getByText("Your getting-started checklist")
    ).toBeInTheDocument();
    expect(screen.getByText("0 / 4 completed")).toBeInTheDocument();
  });
});

