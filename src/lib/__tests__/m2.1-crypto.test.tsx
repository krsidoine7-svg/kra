import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { decryptAES256GCM, encryptAES256GCM } from "@/lib/security/aes";
import {
  buildSignedAuditPayload,
  verifyAuditSignature,
} from "@/lib/security/audit";
import {
  DELETE_ACCOUNT_PHRASE,
  DeleteAccountSchema,
} from "@/lib/validators/profile";
import { ProfileSettingsForm } from "@/components/dashboard/ProfileSettingsForm";

describe("Module M2.1 — Cryptographie Complète & Suppression Compte", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("produit un format iv:tag:cipher opaque et rejette toute altération du tag GCM", () => {
    const phone = "+225 07 88 99 00 11";
    const encrypted = encryptAES256GCM(phone);
    expect(encrypted).not.toContain("+225");
    expect(encrypted).not.toContain(" ");
    expect(encrypted).toMatch(/^[a-f0-9]{24}:[a-f0-9]{32}:[a-f0-9]+$/);

    const parts = encrypted.split(":");
    expect(parts).toHaveLength(3);
    expect(parts[0]).toHaveLength(24);
    expect(parts[1]).toHaveLength(32);

    const lastChar = parts[1]?.slice(-1) === "a" ? "b" : "a";
    const alteredTag = `${parts[0]}:${parts[1]?.slice(0, -1)}${lastChar}:${parts[2]}`;
    expect(() => decryptAES256GCM(alteredTag)).toThrow();
    expect(decryptAES256GCM(encrypted)).toBe(phone);
  });

  it("signe les entrées audit_logs en HMAC-SHA256 et détecte toute falsification", () => {
    const entry = {
      adminId: "00000000-0000-0000-0000-000000000001",
      action: "admin_account_deleted",
      entityType: "admin_profile",
      entityId: "00000000-0000-0000-0000-000000000001",
      metadata: { mode: "soft_delete" },
    };
    const signed = buildSignedAuditPayload(entry);
    expect(signed.integrityHmac).toMatch(/^[a-f0-9]{64}$/);
    expect(verifyAuditSignature(entry, signed.integrityHmac)).toBe(true);

    expect(
      verifyAuditSignature(
        { ...entry, metadata: { mode: "purge" } },
        signed.integrityHmac
      )
    ).toBe(false);
  });

  it("valide la confirmation textuelle et refuse la suppression en cas d'erreur 401", async () => {
    expect(
      DeleteAccountSchema.safeParse({
        currentPassword: "ManuKra#2026!ChangeMe",
        confirmationText: "autre texte",
        mode: "soft_delete",
      }).success
    ).toBe(false);

    expect(
      DeleteAccountSchema.safeParse({
        currentPassword: "ManuKra#2026!ChangeMe",
        confirmationText: DELETE_ACCOUNT_PHRASE,
        mode: "soft_delete",
      }).success
    ).toBe(true);

    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ error: "Mot de passe actuel incorrect." }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <ProfileSettingsForm
        initialProfile={{
          firstName: "Manu",
          lastName: "KRA",
          email: "admin@manukra.ci",
          phone: "",
          recoveryEmail: "",
        }}
      />
    );

    fireEvent.change(
      screen.getByLabelText(/mot de passe actuel \(vérification\)/i),
      { target: { value: "WrongPassword1" } }
    );
    fireEvent.change(screen.getByPlaceholderText(DELETE_ACCOUNT_PHRASE), {
      target: { value: DELETE_ACCOUNT_PHRASE },
    });
    fireEvent.click(
      screen.getByRole("button", { name: /supprimer le compte/i })
    );

    await waitFor(() => {
      expect(
        screen.getByText(/mot de passe actuel incorrect/i)
      ).toBeInTheDocument();
    });
  });
});

