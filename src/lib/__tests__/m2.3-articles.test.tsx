import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ArticleCreateSchema } from "@/lib/validators/article";
import { ArticleRenderer } from "@/components/public/ArticleRenderer";

describe("Module M2.3 — Articles Éditoriaux Riches", () => {
  it("rejette tout lien javascript: ou protocole non HTTP/HTTPS (XSS T-M2.3-02)", () => {
    const result = ArticleCreateSchema.safeParse({
      title: "Test injection lien",
      slug: "test-injection-lien",
      excerpt: "Vérification stricte du schéma de validation d'article.",
      status: "published",
      blocks: [
        {
          id: "b1",
          type: "paragraph",
          text: "Cliquez ici pour tester.",
          link: {
            label: "Lien malveillant",
            url: "javascript:alert(1)",
          },
        },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("valide et restitue H1-H4, listes à puces, listes à tirets, liens, citations et signature", () => {
    const blocks = [
      { id: "h1", type: "heading" as const, level: 1 as const, text: "Titre Niveau 1" },
      { id: "h2", type: "heading" as const, level: 2 as const, text: "Titre Niveau 2" },
      { id: "h3", type: "heading" as const, level: 3 as const, text: "Titre Niveau 3" },
      { id: "h4", type: "heading" as const, level: 4 as const, text: "Titre Niveau 4" },
      {
        id: "p1",
        type: "paragraph" as const,
        text: "Paragraphe analytique",
        link: { label: "Source UEMOA", url: "https://manukra.ci/projets" },
      },
      {
        id: "bl",
        type: "bullet_list" as const,
        items: ["Puce alpha", "Puce bêta"],
      },
      {
        id: "dl",
        type: "dash_list" as const,
        items: ["Tiret un", "Tiret deux"],
      },
      {
        id: "q1",
        type: "quote" as const,
        text: "La rigueur précède l'influence.",
        author: "Manu KRA",
      },
      {
        id: "s1",
        type: "signature" as const,
        name: "Manu KRA",
        role: "Économiste",
        city: "Abidjan",
        date: "2026",
      },
    ];

    const parsed = ArticleCreateSchema.safeParse({
      title: "Architecture Économique",
      slug: "architecture-economique",
      excerpt: "Synthèse structurée sur la communication économique en Afrique de l'Ouest.",
      status: "published",
      blocks,
    });
    expect(parsed.success).toBe(true);

    render(<ArticleRenderer blocks={blocks} />);
    expect(screen.getByText("Titre Niveau 1")).toHaveAttribute("data-heading-level", "1");
    expect(screen.getByText("Titre Niveau 4")).toHaveAttribute("data-heading-level", "4");
    expect(screen.getByRole("link", { name: /source uemoa/i })).toHaveAttribute(
      "href",
      "https://manukra.ci/projets"
    );
    expect(screen.getByText("Puce alpha")).toBeInTheDocument();
    expect(screen.getByText("Tiret deux")).toBeInTheDocument();
    expect(screen.getByText(/La rigueur précède l'influence/)).toBeInTheDocument();
    expect(screen.getByLabelText("Signature de l'auteur")).toHaveTextContent("Abidjan");
  });
});

