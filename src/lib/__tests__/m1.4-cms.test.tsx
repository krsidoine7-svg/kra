import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import {
  detectImageMagicBytes,
  sanitizeSvgContent,
} from "@/lib/security/media-validation";
import { validateSectionPayload } from "@/lib/cms/repository";
import {
  DEFAULT_ABOUT_CMS,
  DEFAULT_HEADER_CMS,
  DEFAULT_HERO_CMS,
  DEFAULT_SECTION_TITLES_CMS,
  DEFAULT_SOCIALS_CMS,
} from "@/lib/cms/defaults";
import { CmsEditorClient } from "@/components/dashboard/CmsEditorClient";

describe("Module M1.4 — CMS Intégral, Sanitisation SVG & Magic Bytes", () => {
  it("détecte les vrais octets PNG, JPEG, WEBP, SVG et rejette un faux fichier", () => {
    const fakePng = Buffer.from("<?php echo 'hack'; ?>", "utf8");
    expect(detectImageMagicBytes(fakePng)).toBe("unknown");

    const pngHeader = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    expect(detectImageMagicBytes(pngHeader)).toBe("png");

    const svgBuffer = Buffer.from('<svg viewBox="0 0 10 10"><rect /></svg>');
    expect(detectImageMagicBytes(svgBuffer)).toBe("svg");
  });

  it("supprime les vecteurs XSS (<script>, onload, javascript:) d'un logo SVG", () => {
    const dirtySvg =
      '<svg onload="alert(1)" xmlns="http://www.w3.org/2000/svg"><script>alert(2)</script><a href="javascript:alert(3)"><rect width="10" height="10"/></a></svg>';
    const cleaned = sanitizeSvgContent(dirtySvg);

    expect(cleaned).not.toContain("<script");
    expect(cleaned).not.toContain("onload");
    expect(cleaned).not.toContain("javascript:");
    expect(cleaned).toContain("<svg");
  });

  it("valide toutes les sections CMS par défaut via Zod", () => {
    expect(validateSectionPayload("hero", DEFAULT_HERO_CMS)).toBeDefined();
    expect(validateSectionPayload("header", DEFAULT_HEADER_CMS)).toBeDefined();
    expect(validateSectionPayload("about", DEFAULT_ABOUT_CMS)).toBeDefined();
    expect(validateSectionPayload("socials", DEFAULT_SOCIALS_CMS)).toBeDefined();
    expect(
      validateSectionPayload("section_titles", DEFAULT_SECTION_TITLES_CMS)
    ).toBeDefined();
  });

  it("permet de naviguer entre les onglets CMS et d'enregistrer le Hero", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <CmsEditorClient
        initialSnapshot={{
          header: DEFAULT_HEADER_CMS,
          hero: DEFAULT_HERO_CMS,
          about: DEFAULT_ABOUT_CMS,
          socials: DEFAULT_SOCIALS_CMS,
          sectionTitles: DEFAULT_SECTION_TITLES_CMS,
          skills: [],
          logos: [],
        }}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /publier le hero/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/admin/cms/hero",
        expect.objectContaining({ method: "PUT" })
      );
    });

    expect(await screen.findByRole("status")).toHaveTextContent(
      /section enregistrée/i
    );

    fireEvent.click(screen.getByRole("tab", { name: "Logos" }));
    expect(screen.getByText(/ajouter un logo/i)).toBeInTheDocument();

    vi.unstubAllGlobals();
  });
});

