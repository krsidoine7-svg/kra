export type DetectedMediaKind = "png" | "jpeg" | "webp" | "svg" | "unknown";
export type DetectedVideoKind = "mp4" | "webm" | "unknown";

/**
 * Inspecte les premiers octets réels (magic bytes) d'un buffer pour éviter le spoofing d'extension.
 */
export function detectImageMagicBytes(buffer: Buffer): DetectedMediaKind {
  if (buffer.length >= 8) {
    // PNG: 89 50 4E 47 0D 0A 1A 0A
    if (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47
    ) {
      return "png";
    }
    // JPEG: FF D8 FF
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
      return "jpeg";
    }
    // WEBP: RIFF....WEBP
    if (
      buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
      buffer.subarray(8, 12).toString("ascii") === "WEBP"
    ) {
      return "webp";
    }
  }

  const head = buffer.subarray(0, 512).toString("utf8").trimStart();
  if (head.startsWith("<svg") || (head.startsWith("<?xml") && head.includes("<svg"))) {
    return "svg";
  }

  return "unknown";
}

/**
 * Nettoie un SVG uploadé comme logo contre toute injection XSS (OWASP A03/A08).
 */
export function sanitizeSvgContent(rawSvg: string): string {
  const withoutScripts = rawSvg
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<foreignObject[\s\S]*?>[\s\S]*?<\/foreignObject>/gi, "")
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/javascript\s*:/gi, "blocked:")
    .trim();

  if (!withoutScripts.toLowerCase().includes("<svg")) {
    throw new Error("Contenu SVG invalide.");
  }

  return withoutScripts;
}

/**
 * Inspecte les magic bytes MP4 (`ftyp`) et WebM (`EBML 1A 45 DF A3`).
 */
export function detectVideoMagicBytes(buffer: Buffer): DetectedVideoKind {
  if (buffer.length >= 12) {
    // ISO Base Media File Format (MP4) : box size (4 octets) + "ftyp"
    if (buffer.subarray(4, 8).toString("ascii") === "ftyp") {
      return "mp4";
    }
  }

  if (buffer.length >= 4) {
    // WebM / Matroska EBML header : 1A 45 DF A3
    if (
      buffer[0] === 0x1a &&
      buffer[1] === 0x45 &&
      buffer[2] === 0xdf &&
      buffer[3] === 0xa3
    ) {
      return "webm";
    }
  }

  return "unknown";
}

