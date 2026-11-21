import type {
  PublicFolderDTO,
  PublicMediaDTO,
  PublicProjectDTO,
} from "@/lib/projects/repository";
import type { PublicLogoItem, PublicSkillItem } from "@/lib/cms/repository";

export const FALLBACK_FOLDERS: PublicFolderDTO[] = [
  {
    id: "00000000-0000-0000-0000-000000000101",
    name: "Stratégie & Communication",
    slug: "strategie-communication",
    description:
      "Positionnement institutionnel, campagnes d'opinion et direction éditoriale.",
    displayOrder: 1,
    projectCount: 1,
  },
  {
    id: "00000000-0000-0000-0000-000000000102",
    name: "Études & Économie",
    slug: "etudes-economie",
    description:
      "Analyses sectorielles, notes de conjoncture et politiques publiques en Côte d'Ivoire.",
    displayOrder: 2,
    projectCount: 1,
  },
  {
    id: "00000000-0000-0000-0000-000000000103",
    name: "Projets à Venir",
    slug: "projets-a-venir",
    description: "Programmes et publications en cours de préparation.",
    displayOrder: 3,
    projectCount: 1,
  },
];

export const FALLBACK_PROJECTS: PublicProjectDTO[] = [
  {
    id: "00000000-0000-0000-0000-000000000201",
    title: "Observatoire des Marchés Urbains — Abidjan",
    slug: "observatoire-marches-abidjan",
    status: "published",
    summary:
      "Cartographie économique et stratégie de vulgarisation sur les circuits de distribution alimentaire à Abidjan.",
    externalUrl: null,
    year: 2026,
    clientOrContext: "Étude sectorielle — Côte d'Ivoire",
    tags: ["Économie", "Abidjan", "Marchés"],
    isFeaturedHome: true,
    featuredOrder: 1,
    folder: {
      id: "00000000-0000-0000-0000-000000000102",
      name: "Études & Économie",
      slug: "etudes-economie",
    },
    coverMedia: null,
    mediaCount: 0,
  },
  {
    id: "00000000-0000-0000-0000-000000000202",
    title: "Identité & Plaidoyer Horizon Économique CI",
    slug: "plaidoyer-horizon-economique-ci",
    status: "published",
    summary:
      "Refonte du discours institutionnel et kit média bilingue pour un forum économique ouest-africain.",
    externalUrl: null,
    year: 2025,
    clientOrContext: "Communication Institutionnelle",
    tags: ["Communication", "Plaidoyer", "Éditorial"],
    isFeaturedHome: true,
    featuredOrder: 2,
    folder: {
      id: "00000000-0000-0000-0000-000000000101",
      name: "Stratégie & Communication",
      slug: "strategie-communication",
    },
    coverMedia: null,
    mediaCount: 0,
  },
  {
    id: "00000000-0000-0000-0000-000000000203",
    title: "Indice Numérique des PME Ivoiriennes",
    slug: "indice-numerique-pme-ivoiriennes",
    status: "upcoming",
    summary:
      "Baromètre annuel mesurant l'adoption des paiements digitaux et la visibilité économique des PME.",
    externalUrl: null,
    year: 2026,
    clientOrContext: "Initiative Manu KRA — À venir",
    tags: ["PME", "Économie Numérique", "À venir"],
    isFeaturedHome: true,
    featuredOrder: 3,
    folder: {
      id: "00000000-0000-0000-0000-000000000103",
      name: "Projets à Venir",
      slug: "projets-a-venir",
    },
    coverMedia: null,
    mediaCount: 0,
  },
];

export const FALLBACK_SKILLS: PublicSkillItem[] = [
  {
    id: "00000000-0000-0000-0000-000000000301",
    title: "Communication Stratégique",
    description:
      "Positionnement de marque, récits institutionnels et gestion de la prise de parole publique.",
    displayOrder: 1,
    isVisible: true,
  },
  {
    id: "00000000-0000-0000-0000-000000000302",
    title: "Analyse Économique",
    description:
      "Notes de conjoncture, décryptage sectoriel et modélisation d'impact socio-économique.",
    displayOrder: 2,
    isVisible: true,
  },
  {
    id: "00000000-0000-0000-0000-000000000303",
    title: "Direction Éditoriale",
    description:
      "Conception de publications, rapports annuels et tribunes à forte valeur analytique.",
    displayOrder: 3,
    isVisible: true,
  },
  {
    id: "00000000-0000-0000-0000-000000000304",
    title: "Conseil & Plaidoyer",
    description:
      "Accompagnement de projets de développement et dialogue entre acteurs publics et privés.",
    displayOrder: 4,
    isVisible: true,
  },
];

export const FALLBACK_LOGOS: PublicLogoItem[] = [
  {
    id: "00000000-0000-0000-0000-000000000401",
    name: "Horizon Éco CI",
    category: "partner",
    objectKey: "",
    websiteUrl: null,
    displayOrder: 1,
    isVisible: true,
  },
  {
    id: "00000000-0000-0000-0000-000000000402",
    name: "Observatoire UEMOA",
    category: "institution",
    objectKey: "",
    websiteUrl: null,
    displayOrder: 2,
    isVisible: true,
  },
  {
    id: "00000000-0000-0000-0000-000000000403",
    name: "Atelier Abidjan",
    category: "client",
    objectKey: "",
    websiteUrl: null,
    displayOrder: 3,
    isVisible: true,
  },
  {
    id: "00000000-0000-0000-0000-000000000404",
    name: "Revue Émergences",
    category: "partner",
    objectKey: "",
    websiteUrl: null,
    displayOrder: 4,
    isVisible: true,
  },
];

export function getFallbackProjectDetail(slug: string): {
  project: PublicProjectDTO;
  gallery: PublicMediaDTO[];
} | null {
  const found = FALLBACK_PROJECTS.find((p) => p.slug === slug);
  if (!found) return null;
  return { project: found, gallery: [] };
}

