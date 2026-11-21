import { describe, expect, it } from "vitest";
import {
  parseAdminCliArgs,
  prepareAdminAccountRecord,
} from "@/lib/db/admin-bootstrap";
import { normalizePostgresUrl } from "@/lib/env/neon";
import { verifyPassword } from "@/lib/security/crypto";

describe("Outils Admin CLI & Normalisation SSL Neon", () => {
  it("normalise les modes SSL Postgres vers verify-full sauf si uselibpqcompat=true", () => {
    expect(
      normalizePostgresUrl(
        "postgresql://user:pass@ep-demo.neon.tech/neondb?channel_binding=require&sslmode=require"
      )
    ).toBe(
      "postgresql://user:pass@ep-demo.neon.tech/neondb?channel_binding=require&sslmode=verify-full"
    );

    expect(
      normalizePostgresUrl(
        "postgresql://user:pass@ep-demo.neon.tech/neondb?sslmode=prefer"
      )
    ).toBe(
      "postgresql://user:pass@ep-demo.neon.tech/neondb?sslmode=verify-full"
    );

    expect(
      normalizePostgresUrl(
        "postgresql://user:pass@ep-demo.neon.tech/neondb?uselibpqcompat=true&sslmode=require"
      )
    ).toBe(
      "postgresql://user:pass@ep-demo.neon.tech/neondb?uselibpqcompat=true&sslmode=require"
    );
  });

  it("analyse les drapeaux CLI et hache un mot de passe admin valide avec bcrypt", async () => {
    const parsed = parseAdminCliArgs([
      "--email",
      "Manu@Kra.CI",
      "--password=MonSuperMotDePasse2026",
      "--first-name",
      "Manu",
      "--last-name",
      "KRA",
    ]);

    expect(parsed.email).toBe("Manu@Kra.CI");
    expect(parsed.password).toBe("MonSuperMotDePasse2026");

    const record = await prepareAdminAccountRecord({
      firstName: parsed.firstName,
      lastName: parsed.lastName,
      email: parsed.email ?? "",
      password: parsed.password ?? "",
    });

    expect(record.email).toBe("manu@kra.ci");
    expect(record.passwordHash).toMatch(/^\$2[aby]\$/);
    await expect(
      verifyPassword("MonSuperMotDePasse2026", record.passwordHash)
    ).resolves.toBe(true);
  });

  it("rejette un mot de passe admin trop faible", async () => {
    await expect(
      prepareAdminAccountRecord({
        email: "admin@manukra.ci",
        password: "short",
      })
    ).rejects.toThrow();
  });
});

