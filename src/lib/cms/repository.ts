import { revalidatePath } from "next/cache";
import { asc, eq, isNull } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { cmsSections, logos, skills } from "@/lib/db/schema";
import { sha256Hex } from "@/lib/security/crypto";
import {
  DEFAULT_ABOUT_CMS,
  DEFAULT_HEADER_CMS,
  DEFAULT_HERO_CMS,
  DEFAULT_SECTION_TITLES_CMS,
  DEFAULT_SOCIALS_CMS,
} from "@/lib/cms/defaults";
import {
  AboutCmsSchema,
  HeaderCmsSchema,
  HeroCmsSchema,
  SectionTitlesCmsSchema,
  SocialsCmsSchema,
  type AboutCms,
  type CmsSectionKey,
  type HeaderCms,
  type HeroCms,
  type SectionTitlesCms,
  type SocialsCms,
} from "@/lib/validators/cms";

export interface PublicLogoItem {
  id: string;
  name: string;
  category: string;
  objectKey: string;
  websiteUrl: string | null;
  displayOrder: number;
  isVisible: boolean;
}

export interface PublicSkillItem {
  id: string;
  title: string;
  description: string;
  displayOrder: number;
  isVisible: boolean;
}

export interface CmsSnapshot {
  header: HeaderCms;
  hero: HeroCms;
  about: AboutCms;
  socials: SocialsCms;
  sectionTitles: SectionTitlesCms;
  skills: PublicSkillItem[];
  logos: PublicLogoItem[];
}

export function validateSectionPayload(
  key: CmsSectionKey,
  rawPayload: unknown
): Record<string, unknown> {
  switch (key) {
    case "header":
      return HeaderCmsSchema.parse(rawPayload);
    case "hero":
      return HeroCmsSchema.parse(rawPayload);
    case "about":
      return AboutCmsSchema.parse(rawPayload);
    case "socials":
      return SocialsCmsSchema.parse(rawPayload);
    case "section_titles":
      return SectionTitlesCmsSchema.parse(rawPayload);
  }
}

export async function getCmsSnapshot(options?: {
  includeHidden?: boolean;
}): Promise<CmsSnapshot> {
  const includeHidden = options?.includeHidden ?? false;

  try {
    const db = getDb();
    const [sectionRows, skillRows, logoRows] = await Promise.all([
      db
        .select({
          sectionKey: cmsSections.sectionKey,
          payload: cmsSections.payload,
        })
        .from(cmsSections),
      db
        .select({
          id: skills.id,
          title: skills.title,
          description: skills.description,
          displayOrder: skills.displayOrder,
          isVisible: skills.isVisible,
        })
        .from(skills)
        .where(isNull(skills.deletedAt))
        .orderBy(asc(skills.displayOrder)),
      db
        .select({
          id: logos.id,
          name: logos.name,
          category: logos.category,
          objectKey: logos.objectKey,
          websiteUrl: logos.websiteUrl,
          displayOrder: logos.displayOrder,
          isVisible: logos.isVisible,
        })
        .from(logos)
        .where(isNull(logos.deletedAt))
        .orderBy(asc(logos.displayOrder)),
    ]);

    const byKey = new Map(sectionRows.map((r) => [r.sectionKey, r.payload]));

    const parsedHeader = HeaderCmsSchema.safeParse(byKey.get("header"));
    const parsedHero = HeroCmsSchema.safeParse(byKey.get("hero"));
    const parsedAbout = AboutCmsSchema.safeParse(byKey.get("about"));
    const parsedSocials = SocialsCmsSchema.safeParse(byKey.get("socials"));
    const parsedTitles = SectionTitlesCmsSchema.safeParse(
      byKey.get("section_titles")
    );

    return {
      header: parsedHeader.success ? parsedHeader.data : DEFAULT_HEADER_CMS,
      hero: parsedHero.success ? parsedHero.data : DEFAULT_HERO_CMS,
      about: parsedAbout.success ? parsedAbout.data : DEFAULT_ABOUT_CMS,
      socials: parsedSocials.success ? parsedSocials.data : DEFAULT_SOCIALS_CMS,
      sectionTitles: parsedTitles.success
        ? parsedTitles.data
        : DEFAULT_SECTION_TITLES_CMS,
      skills: includeHidden ? skillRows : skillRows.filter((s) => s.isVisible),
      logos: includeHidden ? logoRows : logoRows.filter((l) => l.isVisible),
    };
  } catch {
    return {
      header: DEFAULT_HEADER_CMS,
      hero: DEFAULT_HERO_CMS,
      about: DEFAULT_ABOUT_CMS,
      socials: DEFAULT_SOCIALS_CMS,
      sectionTitles: DEFAULT_SECTION_TITLES_CMS,
      skills: [],
      logos: [],
    };
  }
}

export async function saveCmsSection(params: {
  sectionKey: CmsSectionKey;
  payload: unknown;
  adminId: string;
}): Promise<{ checksumSha256: string; payload: Record<string, unknown> }> {
  const validated = validateSectionPayload(params.sectionKey, params.payload);
  const checksumSha256 = sha256Hex(JSON.stringify(validated));
  const db = getDb();

  const existing = await db
    .select({ id: cmsSections.id })
    .from(cmsSections)
    .where(eq(cmsSections.sectionKey, params.sectionKey))
    .limit(1);

  if (existing[0]) {
    await db
      .update(cmsSections)
      .set({
        payload: validated,
        checksumSha256,
        updatedBy: params.adminId,
        updatedAt: new Date(),
      })
      .where(eq(cmsSections.id, existing[0].id));
  } else {
    await db.insert(cmsSections).values({
      sectionKey: params.sectionKey,
      payload: validated,
      checksumSha256,
      updatedBy: params.adminId,
    });
  }

  revalidatePath("/");
  revalidatePath("/projets");
  revalidatePath("/articles");

  return { checksumSha256, payload: validated };
}

