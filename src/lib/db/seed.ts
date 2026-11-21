import { createHash } from "node:crypto";
import bcrypt from "bcryptjs";
import { config as loadEnv } from "dotenv";
import { getDb, getDbPool } from "./index";

loadEnv({ path: ".env.local" });
loadEnv();
import {
  adminProfiles,
  articles,
  cmsSections,
  folders,
  logos,
  projects,
  skills,
} from "./schema";

import {
  DEFAULT_ABOUT_CMS,
  DEFAULT_HEADER_CMS,
  DEFAULT_HERO_CMS,
  DEFAULT_SOCIALS_CMS,
} from "@/lib/cms/defaults";

function sha256(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

async function seed() {
  const db = getDb();

  const initialPassword =
    process.env.INITIAL_ADMIN_PASSWORD ?? "ManuKra#2026!ChangeMe";
  const passwordHash = await bcrypt.hash(initialPassword, 12);

  await db
    .insert(adminProfiles)
    .values({
      firstName: "Manu",
      lastName: "KRA",
      email: process.env.INITIAL_ADMIN_EMAIL ?? "admin@manukra.ci",
      passwordHash,
    })
    .onConflictDoNothing({ target: adminProfiles.email });

  const cmsEntries: Array<{ key: string; payload: Record<string, unknown> }> = [
    { key: "header", payload: DEFAULT_HEADER_CMS },
    { key: "hero", payload: DEFAULT_HERO_CMS },
    { key: "about", payload: DEFAULT_ABOUT_CMS },
    { key: "socials", payload: DEFAULT_SOCIALS_CMS },
    {
      key: "section_titles",
      payload: {
        projectsTitle: "PROJETS SÉLECTIONNÉS",
        projectsSubtitle:
          "Trois projets phares à parcourir au fil du scroll, entre travaux livrés et chantiers à venir.",
        foldersTitle: "DOSSIERS & THÉMATIQUES",
        skillsTitle: "CHAMPS D'INTERVENTION",
        logosTitle: "PARTENAIRES & OUTILS",
      },
    },
  ];

  for (const entry of cmsEntries) {
    await db
      .insert(cmsSections)
      .values({
        sectionKey: entry.key,
        payload: entry.payload,
        checksumSha256: sha256(entry.payload),
      })
      .onConflictDoNothing({ target: cmsSections.sectionKey });
  }

  const insertedFolders = await db
    .insert(folders)
    .values([
      {
        name: "Stratégie & Communication",
        slug: "strategie-communication",
        description:
          "Positionnement institutionnel, campagnes d'opinion et direction éditoriale.",
        displayOrder: 1,
        isVisiblePublic: true,
      },
      {
        name: "Études & Économie",
        slug: "etudes-economie",
        description:
          "Analyses sectorielles, notes de conjoncture et politiques publiques en Côte d'Ivoire.",
        displayOrder: 2,
        isVisiblePublic: true,
      },
      {
        name: "Projets à Venir",
        slug: "projets-a-venir",
        description:
          "Programmes et publications en cours de préparation.",
        displayOrder: 3,
        isVisiblePublic: true,
      },
    ])
    .onConflictDoNothing({ target: folders.slug })
    .returning({ id: folders.id, slug: folders.slug });

  const folderMap = new Map(insertedFolders.map((f) => [f.slug, f.id]));

  await db
    .insert(projects)
    .values([
      {
        folderId: folderMap.get("etudes-economie") ?? null,
        title: "Observatoire des Marchés Urbains — Abidjan",
        slug: "observatoire-marches-abidjan",
        status: "published",
        summary:
          "Cartographie économique et stratégie de vulgarisation sur les circuits de distribution alimentaire à Abidjan.",
        year: 2026,
        clientOrContext: "Étude sectorielle — Côte d'Ivoire",
        tags: ["Économie", "Abidjan", "Marchés"],
        isFeaturedHome: true,
        featuredOrder: 1,
        locationCity: "Abidjan",
        locationCountry: "Côte d'Ivoire",
        publishedAt: new Date(),
      },
      {
        folderId: folderMap.get("strategie-communication") ?? null,
        title: "Identité & Plaidoyer Horizon Économique CI",
        slug: "plaidoyer-horizon-economique-ci",
        status: "published",
        summary:
          "Refonte du discours institutionnel et kit média bilingue pour un forum économique ouest-africain.",
        year: 2025,
        clientOrContext: "Communication Institutionnelle",
        tags: ["Communication", "Plaidoyer", "Éditorial"],
        isFeaturedHome: true,
        featuredOrder: 2,
        locationCity: "Yamoussoukro",
        locationCountry: "Côte d'Ivoire",
        publishedAt: new Date(),
      },
      {
        folderId: folderMap.get("projets-a-venir") ?? null,
        title: "Indice Numérique des PME Ivoiriennes",
        slug: "indice-numerique-pme-ivoiriennes",
        status: "upcoming",
        summary:
          "Baromètre annuel mesurant l'adoption des paiements digitaux et la visibilité économique des PME.",
        year: 2026,
        clientOrContext: "Initiative Manu KRA — À venir",
        tags: ["PME", "Économie Numérique", "À venir"],
        isFeaturedHome: true,
        featuredOrder: 3,
        locationCity: "Abidjan",
        locationCountry: "Côte d'Ivoire",
        publishedAt: null,
      },
    ])
    .onConflictDoNothing({ target: projects.slug });

  const existingSkills = await db.select({ id: skills.id }).from(skills).limit(1);
  if (existingSkills.length === 0) {
    await db.insert(skills).values([
      {
        title: "Communication Stratégique",
        description:
          "Positionnement de marque, récits institutionnels et gestion de la prise de parole publique.",
        displayOrder: 1,
      },
      {
        title: "Analyse Économique",
        description:
          "Notes de conjoncture, décryptage sectoriel et modélisation d'impact socio-économique.",
        displayOrder: 2,
      },
      {
        title: "Direction Éditoriale",
        description:
          "Conception de publications, rapports annuels et tribunes à forte valeur analytique.",
        displayOrder: 3,
      },
      {
        title: "Conseil & Plaidoyer",
        description:
          "Accompagnement de projets de développement et dialogue entre acteurs publics et privés.",
        displayOrder: 4,
      },
    ]);
  }

  const existingLogos = await db.select({ id: logos.id }).from(logos).limit(1);
  if (existingLogos.length === 0) {
    await db.insert(logos).values([
      { name: "Horizon Éco CI", category: "partner", objectKey: "", displayOrder: 1 },
      { name: "Observatoire UEMOA", category: "institution", objectKey: "", displayOrder: 2 },
      { name: "Atelier Abidjan", category: "client", objectKey: "", displayOrder: 3 },
      { name: "Revue Émergences", category: "partner", objectKey: "", displayOrder: 4 },
    ]);
  }

  await db
    .insert(articles)
    .values([
      {
        title: "Communication publique et lisibilité économique en Côte d'Ivoire",
        slug: "communication-publique-lisibilite-economique-ci",
        excerpt:
          "Pourquoi la pédagogie des indicateurs macroéconomiques renforce la confiance des citoyens, des PME et des investisseurs.",
        status: "published",
        tags: ["Économie", "Communication", "Côte d'Ivoire"],
        readingMinutes: 4,
        publishedAt: new Date(),
        blocks: [
          {
            id: "blk-1",
            type: "heading",
            level: 1,
            text: "Traduire la donnée économique en repères concrets",
          },
          {
            id: "blk-2",
            type: "paragraph",
            text: "Un chiffre macroéconomique n'emporte l'adhésion que lorsqu'il éclaire la décision quotidienne des entrepreneurs et des collectivités locales.",
            link: {
              label: "Explorer les travaux associés",
              url: "https://manukra.ci/projets",
            },
          },
          {
            id: "blk-3",
            type: "heading",
            level: 2,
            text: "Trois principes d'architecture éditoriale",
          },
          {
            id: "blk-4",
            type: "bullet_list",
            items: [
              "Hiérarchiser les faits avant le commentaire institutionnel",
              "Contextualiser les tendances UEMOA avec les prix de terrain",
              "Concevoir des synthèses consultables rapidement sur mobile 3G",
            ],
          },
          {
            id: "blk-5",
            type: "quote",
            text: "Nommer avec rigueur les mécanismes d'un marché, c'est déjà réduire l'incertitude des acteurs.",
            author: "Manu KRA",
          },
          {
            id: "blk-6",
            type: "dash_list",
            items: [
              "Clarté méthodologique sur les sources",
              "Régularité des notes de conjoncture",
              "Dialogue ouvert avec les lecteurs",
            ],
          },
          {
            id: "blk-7",
            type: "signature",
            name: "Manu KRA",
            role: "Communication Stratégique & Analyse Économique",
            city: "Abidjan",
            date: "2026",
          },
        ],
      },
      {
        title: "PME ivoiriennes : structurer le récit de croissance avant le financement",
        slug: "pme-ivoiriennes-recit-croissance-financement",
        excerpt:
          "Au-delà des états financiers, la cohérence stratégique et la gouvernance documentée conditionnent l'accès au capital.",
        status: "published",
        tags: ["PME", "Stratégie", "UEMOA"],
        readingMinutes: 3,
        publishedAt: new Date(),
        blocks: [
          {
            id: "blk-21",
            type: "heading",
            level: 2,
            text: "Ce que mesurent réellement les partenaires financiers",
          },
          {
            id: "blk-22",
            type: "paragraph",
            text: "Entre Abidjan, Bouaké et San-Pédro, les dirigeants de PME gagnent en crédibilité dès qu'ils relient leurs flux de trésorerie à un positionnement lisible.",
          },
          {
            id: "blk-23",
            type: "heading",
            level: 3,
            text: "Points d'attention immédiats",
          },
          {
            id: "blk-24",
            type: "bullet_list",
            items: [
              "Documenter la marge unitaire par segment client",
              "Formaliser les risques d'approvisionnement",
            ],
          },
          {
            id: "blk-25",
            type: "signature",
            name: "Manu KRA",
            role: "Conseil & Économie Appliquée",
            city: "Abidjan",
            date: "2026",
          },
        ],
      },
    ])
    .onConflictDoNothing({ target: articles.slug });

  console.log("Seed Manu KRA terminé avec succès.");
}

seed()
  .catch((err) => {
    console.error("Erreur seed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await getDbPool().end();
  });
