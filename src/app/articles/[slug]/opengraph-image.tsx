import { ImageResponse } from "next/og";
import { getPublicArticleBySlug } from "@/lib/articles/repository";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

interface ArticleOgProps {
  params: Promise<{ slug: string }>;
}

export default async function ArticleOpenGraphImage({ params }: ArticleOgProps) {
  const { slug } = await params;
  const article = await getPublicArticleBySlug(slug);

  const title = article?.title ?? "Article — Manu KRA";
  const reading = article ? `${article.readingMinutes} MIN DE LECTURE` : "ESSAI";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#F7F5F2",
          color: "#111111",
          padding: "64px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 22,
            letterSpacing: "0.08em",
            color: "#525252",
          }}
        >
          <span>MANU KRA · ARTICLES</span>
          <span>[ {reading} ]</span>
        </div>

        <div
          style={{
            fontSize: 58,
            fontWeight: 700,
            lineHeight: 1.08,
            letterSpacing: "-0.03em",
          }}
        >
          {title}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 20,
            color: "#6B6B6B",
          }}
        >
          <span>Communication &amp; Économie · Côte d&apos;Ivoire</span>
          <span>/articles/{slug}</span>
        </div>
      </div>
    ),
    size
  );
}

