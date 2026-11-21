import type {
  PublicArticleDetailDTO,
  PublicArticleSummaryDTO,
} from "@/lib/articles/repository";
import type { CmsSnapshot } from "@/lib/cms/repository";
import {
  DEFAULT_ABOUT_CMS,
  DEFAULT_HEADER_CMS,
  DEFAULT_HERO_CMS,
  DEFAULT_SECTION_TITLES_CMS,
  DEFAULT_SOCIALS_CMS,
} from "@/lib/cms/defaults";
import type {
  PublicFolderDTO,
  PublicProjectDTO,
} from "@/lib/projects/repository";

export type Locale = "fr" | "en";

export const LOCALE_COOKIE_NAME = "kra_locale";

export function normalizeLocale(value: string | null | undefined): Locale {
  return value === "en" ? "en" : "fr";
}

export interface UiDictionary {
  header: {
    navAria: string;
    menuOpenAria: string;
    menuCloseAria: string;
    drawerAria: string;
    drawerTagline: string;
  };
  hero: {
    sectionAria: string;
  };
  projectsStage: {
    sectionAria: string;
    prevProjectAria: string;
    nextProjectAria: string;
    statusPublished: string;
    statusUpcoming: string;
    exploreProject: string;
    seeMoreProjects: string;
    featuredPlural: string;
    defaultFolderTag: string;
  };
  foldersSection: {
    sectionAria: string;
    eyebrow: string;
    allFolders: string;
    projectSingular: string;
    projectPlural: string;
    openFolder: string;
  };
  aboutFooter: {
    sectionAria: string;
    eyebrow: string;
    legalNotice: string;
  };
  shareMenu: {
    optionsAriaPrefix: string;
    copyLink: string;
    copiedLink: string;
    shareLink: string;
    openProject: string;
    openArticle: string;
    quickShareAria: string;
    shareVia: string;
  };
  gallery: {
    sectionAria: string;
    videosSingular: string;
    videosPlural: string;
    onDemandTag: string;
    photosSingular: string;
    photosPlural: string;
    closePreviewAria: string;
    previewDialogAria: string;
  };
  videoPlayer: {
    modeBadge: string;
    playButton: string;
    streamingHint: string;
    loadingWeakNetwork: string;
    errorText: string;
    retry: string;
    previewAltPrefix: string;
    playAriaPrefix: string;
  };
  catalog: {
    eyebrow: string;
    heading: string;
    subtitle: string;
    searchPlaceholder: string;
    folderAria: string;
    allFolders: string;
    statusAria: string;
    statusAll: string;
    statusPublished: string;
    statusUpcoming: string;
    sortAria: string;
    sortRecent: string;
    sortAz: string;
    sortOldest: string;
    filterBtn: string;
    emptyText: string;
    resetFilters: string;
    viewFolder: string;
    defaultFolder: string;
  };
  projectDetail: {
    backToProjects: string;
    statusUpcomingLong: string;
    statusPublishedLong: string;
    folderPrefix: string;
    externalLink: string;
  };
  articlesIndex: {
    backHome: string;
    eyebrow: string;
    subtitle: string;
    searchPlaceholder: string;
    searchAria: string;
    filterBtn: string;
    resetFilters: string;
    emptyText: string;
    recentLabel: string;
    minRead: string;
    readArticle: string;
  };
  articleDetail: {
    backToArticles: string;
    defaultType: string;
    minRead: string;
    signatureAria: string;
  };
  comments: {
    sectionAria: string;
    eyebrow: string;
    heading: string;
    emptyText: string;
    formHeading: string;
    privacyNotice: string;
    nameLabel: string;
    namePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    bodyLabel: string;
    bodyPlaceholder: string;
    submitBtn: string;
    submittingBtn: string;
    networkError: string;
    sendError: string;
    defaultSuccess: string;
  };
  legal: {
    eyebrow: string;
    heading: string;
    s1Title: string;
    s1Prefix: string;
    s1Activity: string;
    s1Contact: string;
    s2Title: string;
    s2BodyPrefix: string;
    s3Title: string;
    s3Body: string;
  };
  notFound: {
    eyebrow: string;
    heading: string;
    description: string;
    backHome: string;
  };
  studioShell: {
    groupStudio: string;
    groupSystem: string;
    overview: string;
    projects: string;
    folders: string;
    articles: string;
    cms: string;
    trash: string;
    memory: string;
    settings: string;
    viewSite: string;
    quickSearch: string;
    guideBtn: string;
    signOut: string;
  };
  studioOverview: {
    heading: string;
    subtitle: string;
    manageProjectsBtn: string;
    metricProjects: string;
    metricFeatured: string;
    metricFoldersArticles: string;
    metricLogosSkills: string;
  };
  studioOnboarding: {
    eyebrow: string;
    title: string;
    subtitle: string;
    completedOf: string;
    completedAllBadge: string;
    openTourBtn: string;
    dismissBtn: string;
    openStepBtn: string;
    markDoneAriaPrefix: string;
    steps: {
      profile: { title: string; description: string };
      cms: { title: string; description: string };
      projects: { title: string; description: string };
      articles: { title: string; description: string };
    };
    tour: {
      dialogAria: string;
      eyebrow: string;
      title: string;
      stepLabel: string;
      ofLabel: string;
      closeAria: string;
      prevBtn: string;
      nextBtn: string;
      finishBtn: string;
      goToModuleBtn: string;
      restoreChecklistBtn: string;
      restoredFeedback: string;
      slides: Array<{
        id: "overview" | "projects" | "articles" | "cms";
        title: string;
        summary: string;
        tip: string;
        subPath: string;
      }>;
    };
  };
}

const FR_DICTIONARY: UiDictionary = {
  header: {
    navAria: "Navigation principale",
    menuOpenAria: "Ouvrir le menu",
    menuCloseAria: "Fermer le menu",
    drawerAria: "Menu de navigation",
    drawerTagline: "[ COMMUNICATION & ÉCONOMIE — ABIDJAN ]",
  },
  hero: {
    sectionAria: "Présentation principale",
  },
  projectsStage: {
    sectionAria: "Projets sélectionnés",
    prevProjectAria: "Projet précédent",
    nextProjectAria: "Projet suivant",
    statusPublished: "Réalisé",
    statusUpcoming: "À venir",
    exploreProject: "Explorer le projet",
    seeMoreProjects: "Voir plus de projets",
    featuredPlural: "PROJETS PHARES",
    defaultFolderTag: "PROJET",
  },
  foldersSection: {
    sectionAria: "Dossiers de projets",
    eyebrow: "[ ARCHIVES & PROJETS RÉALISÉS ]",
    allFolders: "Tous les dossiers",
    projectSingular: "projet",
    projectPlural: "projets",
    openFolder: "Ouvrir le dossier",
  },
  aboutFooter: {
    sectionAria: "À propos",
    eyebrow: "[ À PROPOS ]",
    legalNotice: "Mentions légales",
  },
  shareMenu: {
    optionsAriaPrefix: "Options de partage pour",
    copyLink: "Copier le lien",
    copiedLink: "Lien copié !",
    shareLink: "Partager le lien",
    openProject: "Ouvrir le projet",
    openArticle: "Ouvrir l'article",
    quickShareAria: "Partage rapide",
    shareVia: "Partager via",
  },
  gallery: {
    sectionAria: "Galerie médias",
    videosSingular: "VIDÉO",
    videosPlural: "VIDÉOS",
    onDemandTag: "CHARGÉE À LA DEMANDE",
    photosSingular: "PHOTO",
    photosPlural: "PHOTOS",
    closePreviewAria: "Fermer l'aperçu",
    previewDialogAria: "Aperçu de la photo",
  },
  videoPlayer: {
    modeBadge: "[ VIDÉO · MODE ÉCONOMIE 3G ]",
    playButton: "Lire la vidéo",
    streamingHint: "Streaming progressif à la demande",
    loadingWeakNetwork: "Chargement sur réseau faible...",
    errorText: "La lecture vidéo a été interrompue sur cette connexion.",
    retry: "Réessayer",
    previewAltPrefix: "Aperçu vidéo —",
    playAriaPrefix: "Lire la vidéo :",
  },
  catalog: {
    eyebrow: "[ CATALOGUE COMPLET ]",
    heading: "Tous les projets",
    subtitle:
      "Travaux livrés et chantiers à venir en Communication & Économie. Utilisez les filtres pour parcourir par dossier ou trier.",
    searchPlaceholder: "Rechercher un projet...",
    folderAria: "Filtrer par dossier",
    allFolders: "Tous les dossiers",
    statusAria: "Filtrer par statut",
    statusAll: "Réalisés & À venir",
    statusPublished: "Réalisés uniquement",
    statusUpcoming: "À venir uniquement",
    sortAria: "Trier les projets",
    sortRecent: "Plus récents",
    sortAz: "Ordre A – Z",
    sortOldest: "Plus anciens",
    filterBtn: "Filtrer",
    emptyText: "Aucun projet ne correspond à ces critères.",
    resetFilters: "Réinitialiser les filtres",
    viewFolder: "Consulter le dossier",
    defaultFolder: "Portfolio",
  },
  projectDetail: {
    backToProjects: "Retour aux projets",
    statusUpcomingLong: "Futur projet — À venir",
    statusPublishedLong: "Réalisé",
    folderPrefix: "Dossier :",
    externalLink: "Consulter le lien externe",
  },
  articlesIndex: {
    backHome: "Retour à l'accueil",
    eyebrow: "[ PUBLICATIONS & ESSAIS ]",
    subtitle:
      "Décryptages économiques, notes de stratégie et réflexions sur les dynamiques publiques et privées en Côte d'Ivoire.",
    searchPlaceholder: "Rechercher un article...",
    searchAria: "Rechercher un article",
    filterBtn: "Filtrer",
    resetFilters: "Réinitialiser",
    emptyText: "Aucun article publié ne correspond à ce filtre.",
    recentLabel: "Publication récente",
    minRead: "min de lecture",
    readArticle: "Lire l'article",
  },
  articleDetail: {
    backToArticles: "Retour aux articles",
    defaultType: "Article",
    minRead: "min de lecture",
    signatureAria: "Signature de l'auteur",
  },
  comments: {
    sectionAria: "Commentaires",
    eyebrow: "RÉACTIONS",
    heading: "Commentaires des lecteurs",
    emptyText:
      "Aucun commentaire approuvé pour l'instant. Soyez le premier à réagir sans créer de compte.",
    formHeading: "Laisser un commentaire (sans compte)",
    privacyNotice:
      "Aucune inscription requise. Conforme ARTCI Côte d'Ivoire / RGPD : votre e-mail optionnel reste chiffré et n'est jamais affiché publiquement.",
    nameLabel: "Nom ou pseudonyme *",
    namePlaceholder: "Ex. Kouadio A.",
    emailLabel: "E-mail (optionnel, privé)",
    emailPlaceholder: "vous@exemple.ci",
    bodyLabel: "Votre réaction *",
    bodyPlaceholder: "Partagez votre analyse ou question...",
    submitBtn: "Publier le commentaire",
    submittingBtn: "Envoi en cours...",
    networkError: "Erreur réseau. Vérifiez votre connexion.",
    sendError: "Impossible d'envoyer votre commentaire.",
    defaultSuccess: "Commentaire transmis. Il apparaîtra après modération.",
  },
  legal: {
    eyebrow: "[ CONFORMITÉ CÔTE D'IVOIRE & INTERNATIONAL ]",
    heading: "Mentions Légales & Données Personnelles",
    s1Title: "1. Éditeur du site",
    s1Prefix: "Ce portfolio est édité par",
    s1Activity: "Domaine d'activité : Communication Stratégique & Analyse Économique.",
    s1Contact: "Contact :",
    s2Title: "2. Protection des données (Loi CI n° 2013-450 & RGPD)",
    s2BodyPrefix:
      "Ce site n'utilise aucun cookie publicitaire ni traceur commercial tiers. Les statistiques de consultation sont strictement anonymisées par empreinte cryptographique salée (SHA-256). Les données fournies volontairement dans les commentaires publics sont chiffrées au repos lorsque confidentielles et peuvent être supprimées à tout moment sur simple demande à",
    s3Title: "3. Propriété intellectuelle",
    s3Body:
      "L'ensemble des études, textes éditoriaux, visuels de projets et éléments graphiques présentés sur ce site restent la propriété intellectuelle de Manu KRA ou de leurs partenaires respectifs.",
  },
  notFound: {
    eyebrow: "[ 404 — INTROUVABLE ]",
    heading: "Cette page n'existe pas.",
    description:
      "Le lien suivi est peut-être expiré ou l'adresse est incorrecte.",
    backHome: "Retour à l'accueil",
  },
  studioShell: {
    groupStudio: "Studio",
    groupSystem: "Site & Système",
    overview: "Vue d'ensemble",
    projects: "Projets",
    folders: "Dossiers",
    articles: "Articles",
    cms: "CMS Site",
    trash: "Corbeille",
    memory: "Mémoire",
    settings: "Paramètres",
    viewSite: "Voir le site",
    quickSearch: "Recherche rapide...",
    guideBtn: "Guide Studio",
    signOut: "Déconnexion",
  },
  studioOverview: {
    heading: "Vue d'ensemble",
    subtitle: "Pilotage du portfolio Manu KRA — Communication & Économie.",
    manageProjectsBtn: "Gérer les projets",
    metricProjects: "Projets actifs",
    metricFeatured: "Épinglés Accueil",
    metricFoldersArticles: "Dossiers & Articles",
    metricLogosSkills: "Logos & Compétences",
  },
  studioOnboarding: {
    eyebrow: "[ PRISE EN MAIN STUDIO ]",
    title: "Votre checklist de démarrage",
    subtitle:
      "Quatre repères simples pour sécuriser votre accès et configurer votre vitrine publique.",
    completedOf: "complétées",
    completedAllBadge: "Studio configuré",
    openTourBtn: "Visite guidée (4 étapes)",
    dismissBtn: "Masquer",
    openStepBtn: "Ouvrir",
    markDoneAriaPrefix: "Basculer l'étape :",
    steps: {
      profile: {
        title: "Personnaliser votre e-mail et mot de passe",
        description:
          "Remplacez l'identifiant initial dans Paramètres et activez un mot de passe robuste (données de secours chiffrées en AES-256-GCM).",
      },
      cms: {
        title: "Mettre à jour le portrait et les textes du site",
        description:
          "Importez votre photo WebP/PNG, ajustez la section À propos, vos compétences et les logos partenaires sans toucher au code.",
      },
      projects: {
        title: "Épingler jusqu'à 3 projets phares en accueil",
        description:
          "Activez l'option Accueil sur vos 3 projets prioritaires : la scène scroll-pinned respecte ce plafond avec remplacement guidé.",
      },
      articles: {
        title: "Publier un article et modérer les réactions",
        description:
          "Rédigez en blocs structurés (H1–H4, listes, citations, signature) et approuvez les commentaires lecteurs (sans compte requis).",
      },
    },
    tour: {
      dialogAria: "Guide interactif du Studio Manu KRA",
      eyebrow: "[ GUIDE RAPIDE DU STUDIO ]",
      title: "Prendre en main l'administration",
      stepLabel: "Étape",
      ofLabel: "sur",
      closeAria: "Fermer le guide",
      prevBtn: "Précédent",
      nextBtn: "Suivant",
      finishBtn: "Terminer",
      goToModuleBtn: "Ouvrir ce module",
      restoreChecklistBtn: "Afficher la checklist sur l'accueil",
      restoredFeedback: "Checklist réaffichée sur la Vue d'ensemble.",
      slides: [
        {
          id: "overview",
          title: "1. Pilotage, statistiques anonymes & raccourci ⌘K",
          summary:
            "La Vue d'ensemble mesure les vues sans traceurs publicitaires (empreinte SHA-256) et reflète en direct vos projets via Neon Realtime.",
          tip: "Astuce : appuyez sur Ctrl+K (ou ⌘K) n'importe où dans le Studio pour sauter directement d'un onglet à l'autre.",
          subPath: "",
        },
        {
          id: "projects",
          title: "2. Projets, dossiers & plafond de 3 épinglés",
          summary:
            "Organisez vos études par dossiers, publiez des travaux réalisés ou « À venir », et épinglez exactement 3 projets sur la scène d'accueil.",
          tip: "Astuce 3G : les vidéos ne téléchargent aucun octet avant le clic du visiteur grâce aux miniatures légères (LQIP).",
          subPath: "/projets",
        },
        {
          id: "articles",
          title: "3. Éditeur d'articles & modération sans compte",
          summary:
            "Composez vos notes avec titres H1–H4, listes, liens sécurisés, citations et signature. Les visiteurs commentent sans créer de compte.",
          tip: "Sécurité : tout nouveau commentaire reste en attente jusqu'à votre approbation manuelle dans l'onglet Articles.",
          subPath: "/articles",
        },
        {
          id: "cms",
          title: "4. CMS Site, Corbeille & Paramètres chiffrés",
          summary:
            "Modifiez textes, portrait et partenaires dans CMS Site. Toute suppression passe d'abord en Corbeille (restauration possible à tout moment).",
          tip: "Pensez à changer le mot de passe initial et votre e-mail dans Paramètres avant la mise en ligne publique.",
          subPath: "/cms",
        },
      ],
    },
  },
};

const EN_DICTIONARY: UiDictionary = {
  header: {
    navAria: "Primary navigation",
    menuOpenAria: "Open menu",
    menuCloseAria: "Close menu",
    drawerAria: "Navigation menu",
    drawerTagline: "[ COMMUNICATION & ECONOMICS — ABIDJAN ]",
  },
  hero: {
    sectionAria: "Main introduction",
  },
  projectsStage: {
    sectionAria: "Featured projects",
    prevProjectAria: "Previous project",
    nextProjectAria: "Next project",
    statusPublished: "Completed",
    statusUpcoming: "Upcoming",
    exploreProject: "Explore project",
    seeMoreProjects: "See more projects",
    featuredPlural: "FEATURED PROJECTS",
    defaultFolderTag: "PROJECT",
  },
  foldersSection: {
    sectionAria: "Project folders",
    eyebrow: "[ ARCHIVES & COMPLETED WORK ]",
    allFolders: "All folders",
    projectSingular: "project",
    projectPlural: "projects",
    openFolder: "Open folder",
  },
  aboutFooter: {
    sectionAria: "About",
    eyebrow: "[ ABOUT ]",
    legalNotice: "Legal notice",
  },
  shareMenu: {
    optionsAriaPrefix: "Share options for",
    copyLink: "Copy link",
    copiedLink: "Link copied!",
    shareLink: "Share link",
    openProject: "Open project",
    openArticle: "Open article",
    quickShareAria: "Quick share",
    shareVia: "Share via",
  },
  gallery: {
    sectionAria: "Media gallery",
    videosSingular: "VIDEO",
    videosPlural: "VIDEOS",
    onDemandTag: "LOADED ON DEMAND",
    photosSingular: "PHOTO",
    photosPlural: "PHOTOS",
    closePreviewAria: "Close preview",
    previewDialogAria: "Photo preview",
  },
  videoPlayer: {
    modeBadge: "[ VIDEO · 3G DATA SAVER ]",
    playButton: "Play video",
    streamingHint: "Progressive on-demand streaming",
    loadingWeakNetwork: "Buffering on low-bandwidth connection...",
    errorText: "Video playback was interrupted on this connection.",
    retry: "Retry",
    previewAltPrefix: "Video preview —",
    playAriaPrefix: "Play video:",
  },
  catalog: {
    eyebrow: "[ FULL CATALOG ]",
    heading: "All projects",
    subtitle:
      "Delivered work and upcoming initiatives in Communication & Economics. Use the filters to browse by folder or sort.",
    searchPlaceholder: "Search projects...",
    folderAria: "Filter by folder",
    allFolders: "All folders",
    statusAria: "Filter by status",
    statusAll: "Completed & Upcoming",
    statusPublished: "Completed only",
    statusUpcoming: "Upcoming only",
    sortAria: "Sort projects",
    sortRecent: "Newest first",
    sortAz: "A – Z order",
    sortOldest: "Oldest first",
    filterBtn: "Filter",
    emptyText: "No projects match these criteria.",
    resetFilters: "Reset filters",
    viewFolder: "View project",
    defaultFolder: "Portfolio",
  },
  projectDetail: {
    backToProjects: "Back to projects",
    statusUpcomingLong: "Upcoming project — In progress",
    statusPublishedLong: "Completed",
    folderPrefix: "Folder:",
    externalLink: "Visit external link",
  },
  articlesIndex: {
    backHome: "Back to home",
    eyebrow: "[ PUBLICATIONS & ESSAYS ]",
    subtitle:
      "Economic briefings, strategic notes, and reflections on public and private dynamics in Côte d'Ivoire.",
    searchPlaceholder: "Search articles...",
    searchAria: "Search articles",
    filterBtn: "Filter",
    resetFilters: "Reset",
    emptyText: "No published articles match this filter.",
    recentLabel: "Recent publication",
    minRead: "min read",
    readArticle: "Read article",
  },
  articleDetail: {
    backToArticles: "Back to articles",
    defaultType: "Article",
    minRead: "min read",
    signatureAria: "Author signature",
  },
  comments: {
    sectionAria: "Comments",
    eyebrow: "RESPONSES",
    heading: "Reader comments",
    emptyText:
      "No approved comments yet. Be the first to respond—no account required.",
    formHeading: "Leave a comment (no account required)",
    privacyNotice:
      "No sign-up needed. Compliant with ARTCI Côte d'Ivoire / GDPR: your optional email stays encrypted and is never displayed publicly.",
    nameLabel: "Name or handle *",
    namePlaceholder: "e.g. Kouadio A.",
    emailLabel: "Email (optional, private)",
    emailPlaceholder: "you@example.com",
    bodyLabel: "Your comment *",
    bodyPlaceholder: "Share your thoughts or question...",
    submitBtn: "Post comment",
    submittingBtn: "Sending...",
    networkError: "Network error. Please check your connection.",
    sendError: "Unable to submit your comment.",
    defaultSuccess: "Comment received. It will appear after moderation.",
  },
  legal: {
    eyebrow: "[ CÔTE D'IVOIRE & INTERNATIONAL COMPLIANCE ]",
    heading: "Legal Notice & Data Privacy",
    s1Title: "1. Publisher",
    s1Prefix: "This portfolio is published by",
    s1Activity: "Practice: Strategic Communication & Economic Analysis.",
    s1Contact: "Contact:",
    s2Title: "2. Data Protection (Ivorian Law No. 2013-450 & GDPR)",
    s2BodyPrefix:
      "This site uses zero advertising cookies or third-party trackers. Traffic analytics are strictly anonymized using salted cryptographic hashes (SHA-256). Data voluntarily provided in public comments is encrypted at rest when sensitive and can be erased upon request to",
    s3Title: "3. Intellectual Property",
    s3Body:
      "All research notes, editorial essays, project visuals, and graphic materials on this site remain the intellectual property of Manu KRA or their respective partners.",
  },
  notFound: {
    eyebrow: "[ 404 — NOT FOUND ]",
    heading: "This page does not exist.",
    description:
      "The link you followed may have expired or the address is incorrect.",
    backHome: "Back to home",
  },
  studioShell: {
    groupStudio: "Studio",
    groupSystem: "Site & System",
    overview: "Overview",
    projects: "Projects",
    folders: "Folders",
    articles: "Articles",
    cms: "Site CMS",
    trash: "Trash",
    memory: "Memory",
    settings: "Settings",
    viewSite: "View site",
    quickSearch: "Quick search...",
    guideBtn: "Studio Guide",
    signOut: "Sign out",
  },
  studioOverview: {
    heading: "Overview",
    subtitle: "Manage the Manu KRA portfolio — Communication & Economics.",
    manageProjectsBtn: "Manage projects",
    metricProjects: "Active projects",
    metricFeatured: "Pinned on Home",
    metricFoldersArticles: "Folders & Articles",
    metricLogosSkills: "Logos & Skills",
  },
  studioOnboarding: {
    eyebrow: "[ STUDIO ONBOARDING ]",
    title: "Your getting-started checklist",
    subtitle:
      "Four quick steps to secure your admin access and configure your public showcase.",
    completedOf: "completed",
    completedAllBadge: "Studio ready",
    openTourBtn: "Quick tour (4 steps)",
    dismissBtn: "Hide",
    openStepBtn: "Open",
    markDoneAriaPrefix: "Toggle step:",
    steps: {
      profile: {
        title: "Customize your email and password",
        description:
          "Replace the seeded credentials in Settings and set a strong password (recovery contact details are encrypted with AES-256-GCM).",
      },
      cms: {
        title: "Update your portrait and showcase copy",
        description:
          "Upload your WebP/PNG portrait, refine the About section, skills, and partner logos without touching code.",
      },
      projects: {
        title: "Pin up to 3 featured projects on Home",
        description:
          "Toggle Home featured status on your top 3 commissions: the scroll-pinned stage enforces this cap with guided replacement.",
      },
      articles: {
        title: "Publish an article and review comments",
        description:
          "Author structured essays (H1–H4, lists, quotes, signature) and approve reader comments (no visitor login required).",
      },
    },
    tour: {
      dialogAria: "Interactive Manu KRA Studio Guide",
      eyebrow: "[ STUDIO QUICK GUIDE ]",
      title: "Getting around your Studio",
      stepLabel: "Step",
      ofLabel: "of",
      closeAria: "Close guide",
      prevBtn: "Previous",
      nextBtn: "Next",
      finishBtn: "Done",
      goToModuleBtn: "Open this module",
      restoreChecklistBtn: "Show checklist on Overview",
      restoredFeedback: "Checklist restored on the Overview page.",
      slides: [
        {
          id: "overview",
          title: "1. Overview, privacy-first analytics & ⌘K",
          summary:
            "Overview tracks visits without ad trackers (salted SHA-256 hashes) and streams live project changes via Neon Realtime.",
          tip: "Tip: press Ctrl+K (or ⌘K) anywhere in the Studio to jump directly between sections.",
          subPath: "",
        },
        {
          id: "projects",
          title: "2. Projects, folders & 3-project Home cap",
          summary:
            "Organize studies by folder, manage Completed or Upcoming projects, and curate up to 3 featured projects on the Home stage.",
          tip: "3G optimization: videos never download bytes until clicked thanks to lightweight blur previews (LQIP).",
          subPath: "/projets",
        },
        {
          id: "articles",
          title: "3. Rich article editor & zero-login comments",
          summary:
            "Write structured notes with H1–H4 headings, lists, safe links, quotes, and author signature. Readers comment without creating accounts.",
          tip: "Safety: new comments stay pending until you manually approve or reject them inside Articles.",
          subPath: "/articles",
        },
        {
          id: "cms",
          title: "4. Site CMS, Trash & encrypted Settings",
          summary:
            "Edit Hero, About, skills, and logos inside Site CMS. Deleted items move to Trash first so you can restore them anytime.",
          tip: "Remember to change the initial email and password inside Settings before public launch.",
          subPath: "/cms",
        },
      ],
    },
  },
};

export function getDictionary(locale: Locale): UiDictionary {
  return locale === "en" ? EN_DICTIONARY : FR_DICTIONARY;
}

const DEFAULT_HERO_EN = {
  brandName: "MANU KRA",
  label: "",
  titleLines: [
    { text: "STRATEGIC", align: "left" as const },
    { text: "COMMUNICATION &", align: "left" as const, thinAmpersand: true },
    { text: "ECONOMIC ANALYSIS", align: "left" as const },
    { text: "DRIVING REAL", align: "left" as const },
    { text: "IMPACT.", align: "left" as const },
  ],
  paragraphs: [
    "I craft strategic narratives and clear economic analyses that turn complex data into actionable decisions.",
    "Based in Côte d'Ivoire, I advise institutions, leaders, and emerging initiatives between Abidjan and international markets.",
  ],
  portraitAlt: "Portrait of Manu KRA",
  bottomActions: [
    { label: "View projects", href: "#projets" },
    { label: "About", href: "#a-propos" },
  ],
};

const NAV_LINK_EN_BY_HREF: Record<string, string> = {
  "/": "Home",
  "/projets": "Projects",
  "/articles": "Articles",
  "/#a-propos": "About",
};

const FOLDER_EN_BY_SLUG: Record<string, { name: string; description: string }> = {
  "strategie-communication": {
    name: "Strategy & Communication",
    description:
      "Institutional positioning, public opinion campaigns, and editorial direction.",
  },
  "etudes-economie": {
    name: "Research & Economics",
    description:
      "Sectoral studies, macroeconomic briefings, and public policy in Côte d'Ivoire.",
  },
  "projets-a-venir": {
    name: "Upcoming Projects",
    description: "Initiatives and publications currently in preparation.",
  },
};

const SKILL_EN_BY_FR_TITLE: Record<string, { title: string; description: string }> = {
  "Communication Stratégique": {
    title: "Strategic Communication",
    description:
      "Brand positioning, institutional narratives, and executive public speaking.",
  },
  "Analyse Économique": {
    title: "Economic Analysis",
    description:
      "Macroeconomic notes, sector insights, and socio-economic impact modeling.",
  },
  "Direction Éditoriale": {
    title: "Editorial Direction",
    description:
      "Design of publications, annual reports, and high-value analytical essays.",
  },
  "Conseil & Plaidoyer": {
    title: "Advisory & Advocacy",
    description:
      "Support for development initiatives and public-private stakeholder dialogue.",
  },
};

const PROJECT_EN_BY_SLUG: Record<
  string,
  { title: string; summary: string; clientOrContext?: string }
> = {
  "observatoire-marches-abidjan": {
    title: "Urban Markets Observatory — Abidjan",
    summary:
      "Economic mapping and accessible communication strategy on food distribution chains in Abidjan.",
    clientOrContext: "Sector study — Côte d'Ivoire",
  },
  "plaidoyer-horizon-economique-ci": {
    title: "Identity & Advocacy — Horizon Économique CI",
    summary:
      "Institutional messaging overhaul and bilingual media kit for a West African economic forum.",
    clientOrContext: "Institutional Communication",
  },
  "indice-numerique-pme-ivoiriennes": {
    title: "Digital Index of Ivorian SMEs",
    summary:
      "Annual barometer measuring digital payment adoption and economic visibility across SMEs.",
    clientOrContext: "Manu KRA Initiative — Upcoming",
  },
};

const ARTICLE_EN_BY_SLUG: Record<
  string,
  { title: string; excerpt: string }
> = {
  "communication-publique-lisibilite-economique-ci": {
    title: "Public Communication and Economic Clarity in Côte d'Ivoire",
    excerpt:
      "Why clear macroeconomic storytelling strengthens trust among citizens, SMEs, and investors.",
  },
  "pme-ivoiriennes-recit-croissance-financement": {
    title: "Ivorian SMEs: Structuring the Growth Narrative Before Financing",
    excerpt:
      "Beyond financial statements, strategic coherence and documented governance drive access to capital.",
  },
};

export function localizeCmsSnapshot(cms: CmsSnapshot, locale: Locale): CmsSnapshot {
  if (locale === "fr") return cms;

  const isDefaultHeroLabel = cms.hero.label === DEFAULT_HERO_CMS.label;
  const isDefaultTitle =
    cms.hero.titleLines[0]?.text === DEFAULT_HERO_CMS.titleLines[0]?.text;
  const isDefaultAboutTitle =
    cms.about.sectionTitle === DEFAULT_ABOUT_CMS.sectionTitle;

  return {
    header: {
      wordmark: cms.header.wordmark,
      links: cms.header.links.map((link) => ({
        href: link.href,
        label:
          cms.header.wordmark === DEFAULT_HEADER_CMS.wordmark
            ? NAV_LINK_EN_BY_HREF[link.href] ?? link.label
            : link.label,
      })),
    },
    hero: {
      ...cms.hero,
      label: isDefaultHeroLabel ? DEFAULT_HERO_EN.label : cms.hero.label,
      titleLines: isDefaultTitle
        ? DEFAULT_HERO_EN.titleLines
        : cms.hero.titleLines,
      paragraphs:
        cms.hero.paragraphs[0] === DEFAULT_HERO_CMS.paragraphs[0]
          ? DEFAULT_HERO_EN.paragraphs
          : cms.hero.paragraphs,
      portraitAlt:
        cms.hero.portraitAlt === DEFAULT_HERO_CMS.portraitAlt
          ? DEFAULT_HERO_EN.portraitAlt
          : cms.hero.portraitAlt,
      bottomActions:
        cms.hero.bottomActions[0]?.label === DEFAULT_HERO_CMS.bottomActions[0]?.label ||
        cms.hero.bottomActions[0]?.label === "[ VOIR LES PROJETS ]"
          ? DEFAULT_HERO_EN.bottomActions
          : cms.hero.bottomActions,
    },
    about: isDefaultAboutTitle
      ? {
          sectionTitle: "GIVING MEANING TO MARKETS AND IDEAS",
          lead: "Manu KRA — Strategic Communicator & Economist",
          paragraphs: [
            "At the intersection of economic intelligence and institutional communication, every initiative balances precision of language with rigor of numbers.",
            "This portfolio brings together completed commissions, upcoming strategic programs, and analytical notes on West African economic dynamics.",
          ],
        }
      : cms.about,
    socials: {
      ...cms.socials,
      copyright:
        cms.socials.copyright === DEFAULT_SOCIALS_CMS.copyright
          ? "Manu KRA — All rights reserved."
          : cms.socials.copyright,
    },
    sectionTitles: {
      projectsTitle:
        cms.sectionTitles.projectsTitle === DEFAULT_SECTION_TITLES_CMS.projectsTitle
          ? "FEATURED PROJECTS"
          : cms.sectionTitles.projectsTitle,
      projectsSubtitle:
        cms.sectionTitles.projectsSubtitle ===
        DEFAULT_SECTION_TITLES_CMS.projectsSubtitle
          ? "Three flagship initiatives to explore on scroll, from delivered mandates to upcoming work."
          : cms.sectionTitles.projectsSubtitle,
      foldersTitle:
        cms.sectionTitles.foldersTitle === DEFAULT_SECTION_TITLES_CMS.foldersTitle
          ? "FOLDERS & PRACTICE AREAS"
          : cms.sectionTitles.foldersTitle,
      skillsTitle:
        cms.sectionTitles.skillsTitle === DEFAULT_SECTION_TITLES_CMS.skillsTitle
          ? "AREAS OF EXPERTISE"
          : cms.sectionTitles.skillsTitle,
      logosTitle:
        cms.sectionTitles.logosTitle === DEFAULT_SECTION_TITLES_CMS.logosTitle
          ? "PARTNERS & TOOLS"
          : cms.sectionTitles.logosTitle,
      articlesTitle:
        cms.sectionTitles.articlesTitle === DEFAULT_SECTION_TITLES_CMS.articlesTitle
          ? "ARTICLES & NOTES"
          : cms.sectionTitles.articlesTitle,
    },
    skills: cms.skills.map((skill) => {
      const translated = SKILL_EN_BY_FR_TITLE[skill.title];
      return translated
        ? {
            ...skill,
            title: translated.title,
            description: translated.description,
          }
        : skill;
    }),
    logos: cms.logos,
  };
}

export function localizePublicFolders(
  folders: PublicFolderDTO[],
  locale: Locale
): PublicFolderDTO[] {
  if (locale === "fr") return folders;
  return folders.map((folder) => {
    const translated = FOLDER_EN_BY_SLUG[folder.slug];
    return translated
      ? {
          ...folder,
          name: translated.name,
          description: translated.description,
        }
      : folder;
  });
}

export function localizePublicProject(
  project: PublicProjectDTO,
  locale: Locale
): PublicProjectDTO {
  if (locale === "fr") return project;
  const translated = PROJECT_EN_BY_SLUG[project.slug];
  const translatedFolder = project.folder
    ? FOLDER_EN_BY_SLUG[project.folder.slug]
    : undefined;

  return {
    ...project,
    title: translated ? translated.title : project.title,
    summary: translated ? translated.summary : project.summary,
    clientOrContext:
      translated?.clientOrContext ?? project.clientOrContext,
    folder: project.folder
      ? {
          ...project.folder,
          name: translatedFolder?.name ?? project.folder.name,
        }
      : null,
  };
}

export function localizePublicProjects(
  projects: PublicProjectDTO[],
  locale: Locale
): PublicProjectDTO[] {
  return projects.map((item) => localizePublicProject(item, locale));
}

export function localizeArticleSummary(
  article: PublicArticleSummaryDTO,
  locale: Locale
): PublicArticleSummaryDTO {
  if (locale === "fr") return article;
  const translated = ARTICLE_EN_BY_SLUG[article.slug];
  return translated
    ? { ...article, title: translated.title, excerpt: translated.excerpt }
    : article;
}

export function localizeArticleDetail(
  article: PublicArticleDetailDTO,
  locale: Locale
): PublicArticleDetailDTO {
  if (locale === "fr") return article;
  const translated = ARTICLE_EN_BY_SLUG[article.slug];
  return translated
    ? { ...article, title: translated.title, excerpt: translated.excerpt }
    : article;
}

