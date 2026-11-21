import { createHash, randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { sha256Hex } from "@/lib/security/crypto";
import {
  detectImageMagicBytes,
  detectVideoMagicBytes,
  sanitizeSvgContent,
} from "@/lib/security/media-validation";
import { withAdminAuth } from "@/lib/security/with-admin-auth";
import { optimizeImageForLowBandwidth } from "@/lib/storage/image-optimizer";
import { buildPublicMediaUrl, uploadObjectToNeon } from "@/lib/storage/s3";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 Mo brut max avant compression WebP
const DEFAULT_MAX_VIDEO_MB = 25;

function getMaxVideoBytes(): number {
  const configuredMb = Number(process.env.MAX_VIDEO_UPLOAD_MB ?? DEFAULT_MAX_VIDEO_MB);
  const safeMb =
    Number.isFinite(configuredMb) && configuredMb >= 5 && configuredMb <= 100
      ? configuredMb
      : DEFAULT_MAX_VIDEO_MB;
  return safeMb * 1024 * 1024;
}

export const POST = withAdminAuth(async (request) => {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Format multipart/form-data requis." },
      { status: 400 }
    );
  }

  const file = formData.get("file");
  const folderPrefix = String(formData.get("scope") ?? "cms")
    .replace(/[^a-z0-9-]/gi, "")
    .toLowerCase() || "cms";

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Fichier manquant." }, { status: 400 });
  }

  if (file.size === 0) {
    return NextResponse.json({ error: "Fichier vide." }, { status: 400 });
  }

  const rawBuffer = Buffer.from(await file.arrayBuffer());
  const detectedVideoKind = detectVideoMagicBytes(rawBuffer);
  const detectedKind =
    detectedVideoKind === "unknown"
      ? detectImageMagicBytes(rawBuffer)
      : "unknown";

  if (detectedVideoKind !== "unknown") {
    const maxVideoBytes = getMaxVideoBytes();
    if (file.size > maxVideoBytes) {
      return NextResponse.json(
        {
          error: `Vidéo trop volumineuse (max ${Math.round(maxVideoBytes / (1024 * 1024))} Mo pour le streaming 3G).`,
        },
        { status: 400 }
      );
    }

    const mediaId = randomUUID();
    const videoExt = detectedVideoKind === "webm" ? "webm" : "mp4";
    const videoMime =
      detectedVideoKind === "webm" ? "video/webm" : "video/mp4";
    const objectKey = `${folderPrefix}/${mediaId}.${videoExt}`;

    await uploadObjectToNeon({
      objectKey,
      body: rawBuffer,
      contentType: videoMime,
    });

    let posterKey: string | null = null;
    let posterUrl: string | null = null;
    let lqipBase64 = "";
    let width: number | null = null;
    let height: number | null = null;

    const posterFile = formData.get("poster");
    if (posterFile instanceof File && posterFile.size > 0 && posterFile.size <= MAX_IMAGE_BYTES) {
      const posterRaw = Buffer.from(await posterFile.arrayBuffer());
      const posterKind = detectImageMagicBytes(posterRaw);
      if (posterKind === "png" || posterKind === "jpeg" || posterKind === "webp") {
        const optimizedPoster = await optimizeImageForLowBandwidth(posterRaw);
        posterKey = `${folderPrefix}/${mediaId}-poster.webp`;
        await uploadObjectToNeon({
          objectKey: posterKey,
          body: optimizedPoster.webpBuffer,
          contentType: "image/webp",
        });
        posterUrl = buildPublicMediaUrl(posterKey);
        lqipBase64 = optimizedPoster.lqipBase64;
        width = optimizedPoster.width;
        height = optimizedPoster.height;
      }
    }

    const videoSha256 = createHash("sha256").update(rawBuffer).digest("hex");

    return NextResponse.json({
      ok: true,
      mediaType: "video",
      mimeType: videoMime,
      objectKey,
      url: buildPublicMediaUrl(objectKey),
      posterKey,
      posterUrl,
      lqipBase64,
      width,
      height,
      sizeBytes: rawBuffer.byteLength,
      sha256Hash: videoSha256,
    });
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return NextResponse.json(
      { error: "Taille d'image invalide (max 10 Mo)." },
      { status: 400 }
    );
  }

  if (detectedKind === "unknown") {
    return NextResponse.json(
      {
        error:
          "Type de fichier non autorisé. Formats acceptés : PNG, JPEG, WebP, SVG, MP4, WebM.",
      },
      { status: 400 }
    );
  }

  const mediaId = randomUUID();

  if (detectedKind === "svg") {
    let cleanSvg: string;
    try {
      cleanSvg = sanitizeSvgContent(rawBuffer.toString("utf8"));
    } catch {
      return NextResponse.json(
        { error: "Le fichier SVG est corrompu ou invalide." },
        { status: 400 }
      );
    }

    const svgBuffer = Buffer.from(cleanSvg, "utf8");
    const objectKey = `${folderPrefix}/${mediaId}.svg`;

    await uploadObjectToNeon({
      objectKey,
      body: svgBuffer,
      contentType: "image/svg+xml",
    });

    return NextResponse.json({
      ok: true,
      mediaType: "image",
      mimeType: "image/svg+xml",
      objectKey,
      url: buildPublicMediaUrl(objectKey),
      lqipBase64: "",
      width: null,
      height: null,
      sizeBytes: svgBuffer.byteLength,
      sha256Hash: sha256Hex(cleanSvg),
    });
  }

  const optimized = await optimizeImageForLowBandwidth(rawBuffer);
  const objectKey = `${folderPrefix}/${mediaId}.webp`;

  await uploadObjectToNeon({
    objectKey,
    body: optimized.webpBuffer,
    contentType: "image/webp",
  });

  return NextResponse.json({
    ok: true,
    mediaType: "image",
    mimeType: "image/webp",
    objectKey,
    url: buildPublicMediaUrl(objectKey),
    lqipBase64: optimized.lqipBase64,
    width: optimized.width,
    height: optimized.height,
    sizeBytes: optimized.sizeBytes,
    sha256Hash: optimized.sha256Hash,
  });
});

