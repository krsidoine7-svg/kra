import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import {
  PublicCommentCreateSchema,
  sanitizeCommentText,
} from "@/lib/validators/comment";
import { SlidingWindowRateLimiter } from "@/lib/security/rate-limit";
import { ArticleCommentsSection } from "@/components/public/ArticleCommentsSection";

describe("Module M2.4 — Commentaires Sans Compte & Modération", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("nettoie les balises <script> et HTML lors de la validation d'un commentaire (T-M2.4-01)", () => {
    const cleaned = sanitizeCommentText(
      'Analyse pertinente <script>alert("xss")</script> sur le marché.'
    );
    expect(cleaned).not.toContain("<script");
    expect(cleaned).toBe("Analyse pertinente sur le marché.");

    const parsed = PublicCommentCreateSchema.safeParse({
      authorName: "Koffi <b>M.</b>",
      authorEmail: "koffi@example.ci",
      body: 'Super note <script>alert(1)</script>!',
      website: "",
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.authorName).toBe("Koffi M.");
      expect(parsed.data.body).toBe("Super note !");
    }

    // Contenu uniquement script -> rejeté après nettoyage
    const pureScript = PublicCommentCreateSchema.safeParse({
      authorName: "Bot",
      body: "<script>alert(1)</script>",
      website: "",
    });
    expect(pureScript.success).toBe(false);
  });

  it("applique le rate-limit anti-spam à 3 commentaires par tranche de 10 minutes", () => {
    const limiter = new SlidingWindowRateLimiter(3, 10 * 60 * 1000);
    const key = "hashed-ip-comment-test";
    expect(limiter.consume(key, 1000).allowed).toBe(true);
    expect(limiter.consume(key, 2000).allowed).toBe(true);
    expect(limiter.consume(key, 3000).allowed).toBe(true);
    const fourth = limiter.consume(key, 4000);
    expect(fourth.allowed).toBe(false);
    expect(fourth.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("permet de soumettre un commentaire sans compte et n'expose jamais d'email public (T-M2.4-02)", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({
        ok: true,
        message: "Commentaire enregistré. Il sera visible publiquement après validation.",
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <ArticleCommentsSection
        slug="communication-publique-lisibilite-economique-ci"
        initialComments={[
          {
            id: "c1",
            authorName: "Awa Traoré",
            bodySanitized: "Très éclairant pour les PME de Yopougon.",
            createdAt: "2026-04-01T10:00:00.000Z",
          },
        ]}
      />
    );

    expect(
      screen.getByText(/laisser un commentaire \(sans compte\)/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText("Très éclairant pour les PME de Yopougon.")
    ).toBeInTheDocument();
    expect(screen.getByText(/ARTCI Côte d'Ivoire/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/nom ou pseudonyme/i), {
      target: { value: "Konan Yao" },
    });
    fireEvent.change(screen.getByLabelText(/votre réaction/i), {
      target: { value: "Merci pour cette synthèse claire." },
    });
    fireEvent.click(
      screen.getByRole("button", { name: /publier le commentaire/i })
    );

    await waitFor(() => {
      expect(
        screen.getByText(/visible publiquement après validation/i)
      ).toBeInTheDocument();
    });
  });
});

