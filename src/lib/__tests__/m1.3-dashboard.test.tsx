import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { decryptAES256GCM, encryptAES256GCM } from "@/lib/security/aes";
import {
  PasswordChangeSchema,
  ProfileUpdateSchema,
} from "@/lib/validators/profile";
import { LinearShell } from "@/components/dashboard/LinearShell";
import { ProfileSettingsForm } from "@/components/dashboard/ProfileSettingsForm";

const mockPush = vi.fn();
const mockReplace = vi.fn();
const mockRefresh = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => "/acces-studio-kra",
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    refresh: mockRefresh,
  }),
}));

describe("Module M1.3 — Shell Linear, Profil & AES-256-GCM", () => {
  it("chiffre et déchiffre les données sensibles en AES-256-GCM et rejette toute altération", () => {
    const secretPhone = "+225 07 01 02 03 04";
    const cipher1 = encryptAES256GCM(secretPhone);
    const cipher2 = encryptAES256GCM(secretPhone);

    expect(cipher1).not.toBe(cipher2); // IV unique à chaque chiffrement
    expect(decryptAES256GCM(cipher1)).toBe(secretPhone);

    const parts = cipher1.split(":");
    const tampered = `${parts[0]}:${parts[1]?.slice(0, -2)}00:${parts[2]}`;
    expect(() => decryptAES256GCM(tampered)).toThrow();
  });

  it("valide les règles Zod du profil et du mot de passe fort", () => {
    expect(
      ProfileUpdateSchema.safeParse({
        firstName: "Manu",
        lastName: "KRA",
        email: "admin@manukra.ci",
        phone: "+225 07 00 00 00",
        recoveryEmail: "",
      }).success
    ).toBe(true);

    expect(
      PasswordChangeSchema.safeParse({
        currentPassword: "OldPassword1",
        newPassword: "weak",
        confirmPassword: "weak",
      }).success
    ).toBe(false);

    expect(
      PasswordChangeSchema.safeParse({
        currentPassword: "OldPassword1",
        newPassword: "StrongPassword2026",
        confirmPassword: "DifferentPassword2026",
      }).success
    ).toBe(false);

    expect(
      PasswordChangeSchema.safeParse({
        currentPassword: "OldPassword1",
        newPassword: "StrongPassword2026",
        confirmPassword: "StrongPassword2026",
      }).success
    ).toBe(true);
  });

  it("affiche la navigation Linear, ouvre la palette Cmd+K et bascule le thème", () => {
    Element.prototype.scrollIntoView = vi.fn();

    render(
      <LinearShell
        basePath="/acces-studio-kra"
        adminName="Manu KRA"
        adminEmail="admin@manukra.ci"
      >
        <div>Contenu Studio</div>
      </LinearShell>
    );

    expect(screen.getAllByText("Projets").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Dossiers").length).toBeGreaterThan(0);
    expect(screen.getAllByText("CMS Site").length).toBeGreaterThan(0);

    fireEvent.keyDown(window, { key: "k", ctrlKey: true });
    expect(
      screen.getByRole("dialog", { name: /palette de commandes rapides/i })
    ).toBeInTheDocument();

    const themeBtn = screen.getByRole("button", {
      name: /passer en thème sombre/i,
    });
    fireEvent.click(themeBtn);
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("affiche une erreur si les nouveaux mots de passe ne correspondent pas et envoie le profil", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <ProfileSettingsForm
        initialProfile={{
          firstName: "Manu",
          lastName: "KRA",
          email: "admin@manukra.ci",
          phone: "+225 07 00 00 00",
          recoveryEmail: "",
        }}
      />
    );

    fireEvent.click(
      screen.getByRole("button", { name: /enregistrer le profil/i })
    );

    expect(await screen.findByRole("status")).toHaveTextContent(/AES-256-GCM/i);

    fireEvent.change(screen.getByLabelText("Mot de passe actuel"), {
      target: { value: "CurrentPass123" },
    });
    fireEvent.change(screen.getByLabelText("Nouveau mot de passe"), {
      target: { value: "NewStrongPass2026" },
    });
    fireEvent.change(screen.getByLabelText("Confirmer le mot de passe"), {
      target: { value: "MismatchPass2026" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: /changer le mot de passe/i })
    );

    await waitFor(() => {
      expect(
        screen.getByText(/ne correspondent pas/i)
      ).toBeInTheDocument();
    });

    vi.unstubAllGlobals();
  });
});

