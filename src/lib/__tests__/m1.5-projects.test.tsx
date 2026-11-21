import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { evaluateHomeFeaturedQuota } from "@/lib/projects/quota";
import { FoldersManagerClient } from "@/components/dashboard/FoldersManagerClient";
import {
  ProjectsManagerClient,
  type DashboardProjectRow,
} from "@/components/dashboard/ProjectsManagerClient";

describe("Module M1.5 — Dossiers, Projets & Plafond 3 Projets Accueil", () => {
  it("autorise l'ajout tant que moins de 3 projets sont sur l'accueil", () => {
    const decision = evaluateHomeFeaturedQuota({
      currentlyFeatured: [
        { id: "p1", title: "P1", featuredOrder: 1 },
        { id: "p2", title: "P2", featuredOrder: 2 },
      ],
      targetProjectId: null,
      wantFeatured: true,
    });

    expect(decision).toEqual({
      allowed: true,
      assignedOrder: 3,
      replaceId: null,
    });
  });

  it("refuse le 4e projet sur l'accueil sans remplacement et retourne la liste des 3 actuels", () => {
    const current = [
      { id: "p1", title: "P1", featuredOrder: 1 },
      { id: "p2", title: "P2", featuredOrder: 2 },
      { id: "p3", title: "P3", featuredOrder: 3 },
    ];

    const blocked = evaluateHomeFeaturedQuota({
      currentlyFeatured: current,
      targetProjectId: "p4",
      wantFeatured: true,
    });

    expect(blocked).toEqual({
      allowed: false,
      currentFeatured: current,
    });

    const swapped = evaluateHomeFeaturedQuota({
      currentlyFeatured: current,
      targetProjectId: "p4",
      wantFeatured: true,
      replaceProjectId: "p2",
    });

    expect(swapped).toEqual({
      allowed: true,
      assignedOrder: 2,
      replaceId: "p2",
    });
  });

  it("génère automatiquement le slug lors de la création d'un dossier", () => {
    render(<FoldersManagerClient initialFolders={[]} />);

    const nameInput = screen.getByPlaceholderText(/études & économie/i);
    fireEvent.change(nameInput, {
      target: { value: "Études Économiques CI" },
    });

    expect(screen.getByPlaceholderText("etudes-economie")).toHaveValue(
      "etudes-economiques-ci"
    );
  });

  it("affiche la modale de remplacement lorsque le serveur renvoie 409 HOME_QUOTA_EXCEEDED", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      status: 409,
      ok: false,
      json: async () => ({
        code: "HOME_QUOTA_EXCEEDED",
        currentFeatured: [
          { id: "p1", title: "Projet Un", featuredOrder: 1 },
          { id: "p2", title: "Projet Deux", featuredOrder: 2 },
          { id: "p3", title: "Projet Trois", featuredOrder: 3 },
        ],
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const initialProjects: DashboardProjectRow[] = [
      {
        id: "p4",
        title: "Projet Quatre",
        slug: "projet-quatre",
        status: "published",
        summary: "Un quatrième projet complet.",
        folderId: null,
        folderName: null,
        year: 2026,
        clientOrContext: null,
        isFeaturedHome: false,
        featuredOrder: null,
      },
    ];

    render(
      <ProjectsManagerClient initialProjects={initialProjects} folders={[]} />
    );

    fireEvent.click(
      screen.getByRole("button", { name: /épingler projet quatre/i })
    );

    await waitFor(() => {
      expect(
        screen.getByText(/maximum 3 projets sur la page d'accueil atteint/i)
      ).toBeInTheDocument();
    });

    expect(screen.getByText("Remplacer : Projet Un")).toBeInTheDocument();
    vi.unstubAllGlobals();
  });
});

