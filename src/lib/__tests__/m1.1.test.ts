import { describe, expect, it } from "vitest";
import sharp from "sharp";
import { slugify } from "@/lib/utils";
import { HeroCmsSchema } from "@/lib/validators/cms";
import { ProjectCreateSchema } from "@/lib/validators/project";
import { optimizeImageForLowBandwidth } from "@/lib/storage/image-optimizer";
import { DEFAULT_HERO_CMS } from "@/lib/cms/defaults";

describe("Module M1.1 — Fondations, Validateurs & Optimisation 3G", () => {
  it("génère des slugs propres sans accents", () => {
    expect(slugify("Observatoire des Marchés — Côte d'Ivoire 2026")).toBe(
      "observatoire-des-marches-cote-d-ivoire-2026"
    );
  });

  it("valide le payload Hero par défaut de Manu KRA", () => {
    const parsed = HeroCmsSchema.safeParse(DEFAULT_HERO_CMS);
    expect(parsed.success).toBe(true);
  });

  it("rejette une URL dangereuse javascript: dans un projet", () => {
    const parsed = ProjectCreateSchema.safeParse({
      title: "Test Projet",
      slug: "test-projet",
      summary: "Une description suffisamment longue pour être valide.",
      externalUrl: "javascript:alert(1)",
    });
    expect(parsed.success).toBe(false);
  });

  it("refuse un featuredOrder supérieur à 3 sur la page d'accueil", () => {
    const parsed = ProjectCreateSchema.safeParse({
      title: "Projet 4",
      slug: "projet-4",
      summary: "Une description suffisamment longue pour être valide.",
      isFeaturedHome: true,
      featuredOrder: 4,
    });
    expect(parsed.success).toBe(false);
  });

  it("compresse une image en WebP avec LQIP < 1 Ko et hash SHA-256", async () => {
    const rawPng = await sharp({
      create: {
        width: 800,
        height: 600,
        channels: 3,
        background: { r: 17, g: 17, b: 17 },
      },
    })
      .png()
      .toBuffer();

    const result = await optimizeImageForLowBandwidth(rawPng);
    expect(result.width).toBe(800);
    expect(result.height).toBe(600);
    expect(result.lqipBase64.startsWith("data:image/webp;base64,")).toBe(true);
    expect(result.lqipBase64.length).toBeLessThan(1024);
    expect(result.sha256Hash).toHaveLength(64);
  });
});
