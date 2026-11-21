import { createHash } from "node:crypto";
import sharp from "sharp";

export interface OptimizedImageResult {
  webpBuffer: Buffer;
  width: number;
  height: number;
  sizeBytes: number;
  lqipBase64: string;
  sha256Hash: string;
}

const MAX_IMAGE_WIDTH = 1600;
const WEBP_QUALITY = 80;

/**
 * Optimise une image pour les réseaux 3G en Côte d'Ivoire :
 * - Conversion WebP allégée (max 1600px de large)
 * - Génération d'un micro-placeholder LQIP (< 1 Ko)
 * - Empreinte SHA-256 pour l'intégrité
 */
export async function optimizeImageForLowBandwidth(
  inputBuffer: Buffer
): Promise<OptimizedImageResult> {
  const pipeline = sharp(inputBuffer).rotate();

  const { data: webpBuffer, info } = await pipeline
    .clone()
    .resize({
      width: MAX_IMAGE_WIDTH,
      withoutEnlargement: true,
    })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer({ resolveWithObject: true });

  const lqipBuffer = await pipeline
    .clone()
    .resize({ width: 20, withoutEnlargement: true })
    .webp({ quality: 40 })
    .toBuffer();

  const sha256Hash = createHash("sha256").update(webpBuffer).digest("hex");

  return {
    webpBuffer,
    width: info.width,
    height: info.height,
    sizeBytes: webpBuffer.byteLength,
    lqipBase64: `data:image/webp;base64,${lqipBuffer.toString("base64")}`,
    sha256Hash,
  };
}

