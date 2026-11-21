import { z } from "zod";

/**
 * Supprime les balises script/style et toute balise HTML pour stocker un texte pur sûr.
 */
export function sanitizeCommentText(raw: string): string {
  return raw
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/javascript\s*:/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

export const PublicCommentCreateSchema = z.object({
  authorName: z
    .string()
    .transform((val) => sanitizeCommentText(val))
    .refine(
      (val) => val.length >= 2 && val.length <= 80,
      "Votre nom doit contenir entre 2 et 80 caractères."
    ),
  authorEmail: z
    .union([
      z.string().trim().email("Adresse e-mail invalide.").max(255),
      z.literal(""),
    ])
    .optional()
    .default(""),
  body: z
    .string()
    .transform((val) => sanitizeCommentText(val))
    .refine(
      (val) => val.length >= 3 && val.length <= 1500,
      "Le commentaire doit contenir entre 3 et 1500 caractères valides."
    ),
  // Champ honeypot invisible : doit rester vide
  website: z.string().max(200).optional().default(""),
});

export const CommentModerationUpdateSchema = z.object({
  moderationStatus: z.enum(["pending", "approved", "rejected"]),
});

export type PublicCommentCreateInput = z.infer<typeof PublicCommentCreateSchema>;

