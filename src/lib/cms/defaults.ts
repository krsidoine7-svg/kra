import type {
  AboutCms,
  HeaderCms,
  HeroCms,
  SectionTitlesCms,
  SocialsCms,
} from "@/lib/validators/cms";

export const DEFAULT_HERO_CMS: HeroCms = {
  brandName: "MANU KRA",
  label: "",
  titleLines: [
    { text: "STRATÉGIE DE", align: "left" },
    { text: "COMMUNICATION &", align: "left", thinAmpersand: true },
    { text: "ANALYSE ÉCONOMIQUE", align: "left" },
    { text: "AU SERVICE DE", align: "left" },
    { text: "L'IMPACT.", align: "left" },
  ],
  paragraphs: [
    "Je conçois des récits stratégiques et des analyses économiques lisibles qui transforment des données complexes en décisions claires.",
    "Basé en Côte d'Ivoire, j'accompagne institutions, dirigeants et initiatives émergentes entre Abidjan et l'international.",
  ],
  portraitUrl: "",
  portraitAlt: "Portrait de Manu KRA",
  bottomActions: [
    { label: "Voir les projets", href: "#projets" },
    { label: "À propos", href: "#a-propos" },
  ],
};

export const DEFAULT_HEADER_CMS: HeaderCms = {
  wordmark: "MANU KRA",
  links: [
    { label: "Accueil", href: "/" },
    { label: "Projets", href: "/projets" },
    { label: "Articles", href: "/articles" },
    { label: "À propos", href: "/#a-propos" },
  ],
};

export const DEFAULT_ABOUT_CMS: AboutCms = {
  sectionTitle: "DONNER DU SENS AUX MARCHÉS ET AUX IDÉES",
  lead: "Manu KRA — Stratège en Communication & Économiste",
  paragraphs: [
    "À l'intersection de l'intelligence économique et de la communication institutionnelle, chaque projet cherche la justesse du mot et la rigueur du chiffre.",
    "Ce portfolio rassemble mes travaux réalisés, les chantiers stratégiques à venir et mes notes d'analyse sur les dynamiques économiques ouest-africaines.",
  ],
};

export const DEFAULT_SOCIALS_CMS: SocialsCms = {
  emailPublic: "contact@manukra.ci",
  city: "Abidjan, Côte d'Ivoire",
  links: [
    { label: "LinkedIn", url: "https://www.linkedin.com" },
    { label: "X / Twitter", url: "https://x.com" },
  ],
  copyright: "Manu KRA — Tous droits réservés.",
};

export const DEFAULT_SECTION_TITLES_CMS: SectionTitlesCms = {
  projectsTitle: "PROJETS SÉLECTIONNÉS",
  projectsSubtitle:
    "Trois projets phares à parcourir au fil du scroll, entre travaux livrés et chantiers à venir.",
  foldersTitle: "DOSSIERS & THÉMATIQUES",
  skillsTitle: "CHAMPS D'INTERVENTION",
  logosTitle: "PARTENAIRES & OUTILS",
  articlesTitle: "ARTICLES & NOTES",
};
