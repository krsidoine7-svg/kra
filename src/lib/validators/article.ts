import { z } from "zod";
import type { ArticleBlockSchemaRecord } from "@/lib/db/schema";

const SafeHttpUrlSchema = z
  .string()
  .trim()
  .max(600, "URL trop longue.")
  .refine((value) => {
    try {
      const parsed = new URL(value);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  }, "Seules les URL http:// ou https:// sont autorisées.");

export const ArticleHeadingBlockSchema = z.object({
  id: z.string().trim().min(1).max(64),
  type: z.literal("heading"),
  level: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  text: z.string().trim().min(1, "Titre de bloc requis.").max(240),
});

export const ArticleParagraphBlockSchema = z.object({
  id: z.string().trim().min(1).max(64),
  type: z.literal("paragraph"),
  text: z.string().trim().min(1, "Texte de paragraphe requis.").max(4000),
  link: z
    .object({
      label: z.string().trim().min(1, "Libellé du lien requis.").max(120),
      url: SafeHttpUrlSchema,
    })
    .optional(),
});

export const ArticleBulletListBlockSchema = z.object({
  id: z.string().trim().min(1).max(64),
  type: z.literal("bullet_list"),
  items: z
    .array(z.string().trim().min(1, "Élément vide interdit.").max(500))
    .min(1, "Ajoutez au moins un point.")
    .max(40),
});

export const ArticleDashListBlockSchema = z.object({
  id: z.string().trim().min(1).max(64),
  type: z.literal("dash_list"),
  items: z
    .array(z.string().trim().min(1, "Élément vide interdit.").max(500))
    .min(1, "Ajoutez au moins une ligne.")
    .max(40),
});

export const ArticleQuoteBlockSchema = z.object({
  id: z.string().trim().min(1).max(64),
  type: z.literal("quote"),
  text: z.string().trim().min(1, "Texte de citation requis.").max(1200),
  author: z.string().trim().max(120).optional(),
});

export const ArticleSignatureBlockSchema = z.object({
  id: z.string().trim().min(1).max(64),
  type: z.literal("signature"),
  name: z.string().trim().min(1, "Nom de signature requis.").max(120),
  role: z.string().trim().max(160).default(""),
  city: z.string().trim().max(100).default(""),
  date: z.string().trim().max(40).default(""),
});

export const ArticleBlockSchema = z.discriminatedUnion("type", [
  ArticleHeadingBlockSchema,
  ArticleParagraphBlockSchema,
  ArticleBulletListBlockSchema,
  ArticleDashListBlockSchema,
  ArticleQuoteBlockSchema,
  ArticleSignatureBlockSchema,
]);

export const ArticleStatusSchema = z.enum(["draft", "published", "archived"]);

export const ArticleCreateSchema = z.object({
  title: z.string().trim().min(3, "Titre requis (min 3 caractères).").max(200),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(220)
    .regex(
      /^[a-z0-9-]+$/,
      "Le slug doit contenir uniquement minuscules, chiffres et tirets."
    ),
  excerpt: z
    .string()
    .trim()
    .min(10, "Résumé requis (min 10 caractères).")
    .max(600),
  status: ArticleStatusSchema.default("draft"),
  blocks: z
    .array(ArticleBlockSchema)
    .min(1, "Ajoutez au moins un bloc de contenu.")
    .max(120),
  tags: z.array(z.string().trim().min(1).max(40)).max(12).default([]),
  readingMinutes: z.number().int().min(1).max(60).optional(),
  coverObjectKey: z.string().trim().max(600).nullable().optional(),
  coverLqip: z.string().trim().max(2048).nullable().optional(),
});

export type ArticleCreateInput = z.infer<typeof ArticleCreateSchema>;
export type ArticleBlock = z.infer<typeof ArticleBlockSchema>;

export function estimateReadingMinutes(
  blocks: readonly ArticleBlockSchemaRecord[]
): number {
  let words = 0;
  for (const block of blocks) {
    if (block.type === "heading" || block.type === "paragraph" || block.type === "quote") {
      words += block.text.split(/\s+/).filter(Boolean).length;
    } else if (block.type === "bullet_list" || block.type === "dash_list") {
      for (const item of block.items) {
        words += item.split(/\s+/).filter(Boolean).length;
      }
    } else if (block.type === "signature") {
      words += block.name.split(/\s+/).filter(Boolean).length;
    }
  }
  return Math.max(1, Math.min(60, Math.ceil(words / 200)));
}

