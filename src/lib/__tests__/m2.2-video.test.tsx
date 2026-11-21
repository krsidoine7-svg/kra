import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { detectVideoMagicBytes } from "@/lib/security/media-validation";
import { LazyVideoPlayer } from "@/components/public/LazyVideoPlayer";

describe("Module M2.2 — Vidéos Optimisées Réseau Faible (3G)", () => {
  it("détecte les magic bytes MP4 et WebM réels et rejette tout binaire usurpé", () => {
    // MP4 box ftyp
    const mp4Buffer = Buffer.from([
      0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70, 0x6d, 0x70, 0x34, 0x32,
    ]);
    expect(detectVideoMagicBytes(mp4Buffer)).toBe("mp4");

    // WebM EBML
    const webmBuffer = Buffer.from([0x1a, 0x45, 0xdf, 0xa3, 0x9f, 0x42]);
    expect(detectVideoMagicBytes(webmBuffer)).toBe("webm");

    // Faux fichier texte renommé en .mp4
    const fakeBuffer = Buffer.from("MZ<script>alert(1)</script>");
    expect(detectVideoMagicBytes(fakeBuffer)).toBe("unknown");
  });

  it("n'affiche aucun élément <video> ni requête média avant le clic utilisateur", () => {
    const { container } = render(
      <LazyVideoPlayer
        src="https://cdn.example.ci/projects/demo.mp4"
        posterUrl="https://cdn.example.ci/projects/demo-poster.webp"
        lqipBase64={null}
        title="Présentation Économie CI"
      />
    );

    // 0 vidéo chargée avant interaction
    expect(container.querySelector("video")).toBeNull();
    expect(screen.getByAltText(/présentation économie ci/i)).toBeInTheDocument();

    const playBtn = screen.getByRole("button", {
      name: /lire la vidéo/i,
    });
    fireEvent.click(playBtn);

    const videoEl = container.querySelector("video");
    expect(videoEl).not.toBeNull();
    expect(videoEl).toHaveAttribute("preload", "metadata");
    expect(videoEl).toHaveAttribute(
      "src",
      "https://cdn.example.ci/projects/demo.mp4"
    );
  });
});

