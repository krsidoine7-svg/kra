import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import {
  generateOpaqueToken,
  hashIpAddress,
  hashPassword,
  hmacSha256Hex,
  sha256Hex,
  verifyPassword,
} from "@/lib/security/crypto";
import { SlidingWindowRateLimiter } from "@/lib/security/rate-limit";
import { resolveAdminRouteDecision } from "@/lib/security/admin-path";
import { LoginRequestSchema } from "@/lib/validators/auth";
import { HiddenLoginForm } from "@/components/auth/HiddenLoginForm";

const mockReplace = vi.fn();
const mockRefresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mockReplace,
    refresh: mockRefresh,
  }),
}));

describe("Module M1.2 — Authentification Masquée, bcrypt & Rate Limit", () => {
  it("valide le contrat Zod LoginRequestSchema", () => {
    expect(
      LoginRequestSchema.safeParse({
        email: "admin@manukra.ci",
        password: "SuperPassword123",
      }).success
    ).toBe(true);

    expect(
      LoginRequestSchema.safeParse({
        email: "pas-un-email",
        password: "short",
      }).success
    ).toBe(false);
  });

  it("hache et vérifie un mot de passe avec bcrypt", async () => {
    const hash = await hashPassword("SecretManuKra2026!");
    expect(hash.startsWith("$2")).toBe(true);
    expect(await verifyPassword("SecretManuKra2026!", hash)).toBe(true);
    expect(await verifyPassword("MauvaisMotDePasse", hash)).toBe(false);
    expect(await verifyPassword("SecretManuKra2026!", null)).toBe(false);
  });

  it("génère des empreintes SHA-256, HMAC et IP salées déterministes", () => {
    const token = generateOpaqueToken();
    expect(token).toHaveLength(64);
    expect(sha256Hex("abc")).toHaveLength(64);
    expect(hmacSha256Hex("audit", "secret-1")).not.toBe(
      hmacSha256Hex("audit", "secret-2")
    );
    expect(hashIpAddress("197.159.10.2")).toHaveLength(64);
  });

  it("bloque les tentatives excessives puis autorise après réinitialisation", () => {
    const limiter = new SlidingWindowRateLimiter(5, 60_000);
    const start = 1_000_000;

    for (let i = 0; i < 5; i += 1) {
      expect(limiter.consume("ip-1", start).allowed).toBe(true);
    }

    const blocked = limiter.consume("ip-1", start + 1_000);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);

    expect(limiter.consume("ip-1", start + 61_000).allowed).toBe(true);
  });

  it("masque /admin, /login, /dashboard et protège la route secrète", () => {
    expect(
      resolveAdminRouteDecision({ pathname: "/login", hasSessionCookie: false })
    ).toEqual({ action: "not_found" });

    expect(
      resolveAdminRouteDecision({ pathname: "/admin", hasSessionCookie: true })
    ).toEqual({ action: "not_found" });

    expect(
      resolveAdminRouteDecision({
        pathname: "/studio-internal",
        hasSessionCookie: true,
      })
    ).toEqual({ action: "not_found" });

    expect(
      resolveAdminRouteDecision({
        pathname: "/acces-studio-kra",
        hasSessionCookie: false,
      })
    ).toEqual({
      action: "redirect_login",
      targetPath: "/acces-studio-kra/login",
    });

    expect(
      resolveAdminRouteDecision({
        pathname: "/acces-studio-kra",
        hasSessionCookie: true,
      })
    ).toEqual({
      action: "rewrite_internal",
      internalPath: "/studio-internal",
    });
  });

  it("affiche une erreur claire si les champs du formulaire sont invalides et bascule la visibilité du mot de passe", async () => {
    render(<HiddenLoginForm redirectPath="/acces-studio-kra" />);

    const submitBtn = screen.getByRole("button", {
      name: /accéder au studio/i,
    });
    fireEvent.click(submitBtn);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /e-mail valide/i
    );

    const passwordInput = screen.getByLabelText("Mot de passe");
    expect(passwordInput).toHaveAttribute("type", "password");

    const toggleBtn = screen.getByRole("button", {
      name: /afficher le mot de passe/i,
    });
    fireEvent.click(toggleBtn);
    expect(passwordInput).toHaveAttribute("type", "text");
  });

  it("redirige vers le studio après une connexion API réussie", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<HiddenLoginForm redirectPath="/acces-studio-kra" />);

    fireEvent.change(screen.getByLabelText("Adresse e-mail"), {
      target: { value: "admin@manukra.ci" },
    });
    fireEvent.change(screen.getByLabelText("Mot de passe"), {
      target: { value: "SuperPassword123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /accéder au studio/i }));

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/acces-studio-kra");
    });

    vi.unstubAllGlobals();
  });
});

