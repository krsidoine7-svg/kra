import { z } from "zod";

export const HeroLineSchema = z.object({
  text: z.string().trim().min(1, "Ligne requise.").max(60),
  align: z.enum(["left", "center", "right"]),
  thinAmpersand: z.boolean().optional(),
});

export const HeroCmsSchema = z.object({
  brandName: z.string().trim().min(1).max(60),
  label: z.string().trim().max(80).default(""),
  titleLines: z.array(HeroLineSchema).min(1).max(6),
  paragraphs: z.array(z.string().trim().min(1).max(320)).min(1).max(3),
  portraitUrl: z.string().trim().max(500).default(""),
  portraitAlt: z.string().trim().min(1).max(160),
  bottomActions: z
    .array(
      z.object({
        label: z.string().trim().min(1).max(40),
        href: z.string().trim().min(1).max(200),
      })
    )
    .max(3),
});

export const HeaderCmsSchema = z.object({
  wordmark: z.string().trim().min(1).max(60),
  links: z
    .array(
      z.object({
        label: z.string().trim().min(1).max(40),
        href: z.string().trim().min(1).max(200),
      })
    )
    .min(1)
    .max(6),
});

export const AboutCmsSchema = z.object({
  sectionTitle: z.string().trim().min(2).max(160),
  lead: z.string().trim().min(2).max(200),
  paragraphs: z.array(z.string().trim().min(1).max(600)).min(1).max(4),
});

export const SocialsCmsSchema = z.object({
  emailPublic: z.string().trim().email("E-mail public invalide.").max(180),
  city: z.string().trim().min(1).max(100),
  links: z.array(
    z.object({
      label: z.string().trim().min(1).max(40),
      url: z
        .string()
        .trim()
        .url("URL invalide.")
        .refine((u) => u.startsWith("https://") || u.startsWith("http://"), {
          message: "Protocole http/https requis.",
        }),
    })
  ),
  copyright: z.string().trim().min(1).max(160),
});

export const SectionTitlesCmsSchema = z.object({
  projectsTitle: z.string().trim().min(1).max(120),
  projectsSubtitle: z.string().trim().min(1).max(280),
  foldersTitle: z.string().trim().min(1).max(120),
  skillsTitle: z.string().trim().min(1).max(120),
  logosTitle: z.string().trim().min(1).max(120),
  articlesTitle: z.string().trim().min(1).max(120).default("ARTICLES & NOTES"),
});

export const CmsSectionKeySchema = z.enum([
  "header",
  "hero",
  "about",
  "socials",
  "section_titles",
]);

export const LogoCreateSchema = z.object({
  name: z.string().trim().min(1, "Nom requis.").max(120),
  category: z.enum(["client", "partner", "institution", "tool"]).default("partner"),
  objectKey: z.string().trim().max(500).default(""),
  websiteUrl: z
    .union([
      z
        .string()
        .trim()
        .url()
        .refine((u) => u.startsWith("https://") || u.startsWith("http://")),
      z.literal(""),
    ])
    .optional()
    .default(""),
  displayOrder: z.number().int().min(0).default(0),
  isVisible: z.boolean().default(true),
});

export const SkillCreateSchema = z.object({
  title: z.string().trim().min(2, "Titre requis.").max(120),
  description: z.string().trim().min(5, "Description requise.").max(280),
  displayOrder: z.number().int().min(0).default(0),
  isVisible: z.boolean().default(true),
});

export type HeroCms = z.infer<typeof HeroCmsSchema>;
export type HeaderCms = z.infer<typeof HeaderCmsSchema>;
export type AboutCms = z.infer<typeof AboutCmsSchema>;
export type SocialsCms = z.infer<typeof SocialsCmsSchema>;
export type SectionTitlesCms = z.infer<typeof SectionTitlesCmsSchema>;
export type CmsSectionKey = z.infer<typeof CmsSectionKeySchema>;
export type LogoCreateInput = z.infer<typeof LogoCreateSchema>;
export type SkillCreateInput = z.infer<typeof SkillCreateSchema>;
