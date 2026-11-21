import { ImageResponse } from "next/og";
import { getPublicProjectBySlug } from "@/lib/projects/repository";
import { getFallbackProjectDetail } from "@/lib/projects/public-fallback";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

interface OgProps {
  params: Promise<{ slug: string }>;
}

export default async function ProjectOpenGraphImage({ params }: OgProps) {
  const { slug } = await params;
  const fromDb = await getPublicProjectBySlug(slug);
  const detail =
    fromDb ?? (!process.env.DATABASE_URL ? getFallbackProjectDetail(slug) : null);

  const title = detail?.project.title ?? "Projet — Manu KRA";
  const folderName = detail?.project.folder?.name ?? "Communication & Économie";
  const statusLabel =
    detail?.project.status === "upcoming" ? "À VENIR" : "RÉALISÉ";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#0A0A0A",
          color: "#FFFFFF",
          padding: "64px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 22,
            letterSpacing: "0.08em",
            color: "#A3A3A3",
          }}
        >
          <span>MANU KRA · {folderName.toUpperCase()}</span>
          <span>[ {statusLabel} ]</span>
        </div>

        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
          }}
        >
          {title}
        </div>

        <div
          style={{
            fontSize: 22,
            color: "#D4D4D4",
          }}
        >
          Communication Stratégique & Analyse Économique
        </div>
      </div>
    ),
    { ...size }
  );
}

