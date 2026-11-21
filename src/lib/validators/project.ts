import { z } from "zod";

export const ProjectStatusSchema = z.enum([
  "draft",
  "upcoming",
  "published",
  "archived",
]);

export const ProjectMediaItemInputSchema = z.object({
  id: z.string().uuid().optional(),
  mediaType: z.enum(["image", "video"]).default("image"),
  objectKey: z.string().trim().min(1).max(600),
  posterKey: z.string().trim().max(600).nullable().optional(),
  lqipBase64: z.string().trim().max(2048).nullable().optional(),
  altText: z.string().trim().max(255).default(""),
  mimeType: z.string().trim().max(100).default("image/webp"),
  width: z.number().int().positive().nullable().optional(),
  height: z.number().int().positive().nullable().optional(),
  sizeBytes: z.number().int().nonnegative().default(0),
  sha256Hash: z.string().trim().max(64).default(""),
  isCover: z.boolean().default(false),
  sortOrder: z.number().int().min(0).default(0),
});

export const ProjectCreateSchema = z.object({
  title: z.string().trim().min(2, "Titre requis (min 2 caractères).").max(180),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(200)
    .regex(
      /^[a-z0-9-]+$/,
      "Le slug doit contenir uniquement minuscules, chiffres et tirets."
    ),
  folderId: z.string().uuid().nullable().optional(),
  status: ProjectStatusSchema.default("draft"),
  summary: z
    .string()
    .trim()
    .min(10, "Résumé requis (min 10 caractères).")
    .max(500),
  externalUrl: z
    .union([
      z
        .string()
        .trim()
        .url("URL externe invalide.")
        .refine(
          (u) => u.startsWith("http://") || u.startsWith("https://"),
          "Protocole http/https uniquement."
        ),
      z.literal(""),
    ])
    .nullable()
    .optional(),
  year: z.number().int().min(1990).max(2100).nullable().optional(),
  clientOrContext: z.string().trim().max(160).nullable().optional(),
  tags: z.array(z.string().trim().min(1).max(40)).max(12).default([]),
  isFeaturedHome: z.boolean().default(false),
  featuredOrder: z.number().int().min(1).max(3).nullable().optional(),
  replaceProjectId: z.string().uuid().optional(),
  mediaItems: z.array(ProjectMediaItemInputSchema).max(30).default([]),
});

export const FolderCreateSchema = z.object({
  name: z.string().trim().min(2, "Nom du dossier requis.").max(120),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(140)
    .regex(/^[a-z0-9-]+$/, "Slug invalide."),
  description: z.string().trim().max(500).nullable().optional(),
  displayOrder: z.number().int().min(0).default(0),
  isVisiblePublic: z.boolean().default(true),
});

export type ProjectCreateInput = z.infer<typeof ProjectCreateSchema>;
export type ProjectMediaItemInput = z.infer<typeof ProjectMediaItemInputSchema>;
export type FolderCreateInput = z.infer<typeof FolderCreateSchema>;
