# `KPI.md` — Indicateurs Clés, Budget 3G Côte d'Ivoire, SEO & GEO

> **Objectif :** Mesurer concrètement la qualité technique (vitesse sur réseau faible CI), la visibilité (SEO & GEO) et l'utilité réelle du portfolio de **Manu KRA**.

---

## 1. Budget Performance Réseau Faible (Côte d'Ivoire — Slow 3G / Mobile-First)

| Indicateur | Cible Maximale | Méthode de Mesure |
| :--- | :--- | :--- |
| **Poids JS + CSS initial (`/`)** | **≤ 180 Ko gzippé** | Bundle analyzer / Network DevTools |
| **LCP (Largest Contentful Paint)** | **≤ 2.5 s** (4G) / **≤ 4.0 s** (Slow 3G) | Lighthouse Mobile Emulation |
| **CLS (Cumulative Layout Shift)** | **≤ 0.05** | Lighthouse (garanti via LQIP + dimensions fixes) |
| **INP (Interaction to Next Paint)** | **≤ 150 ms** | Ouverture menu `...`, copie lien, scroll |
| **Poids Vidéo au chargement initial** | **0 octet** (`preload="none"` + poster WebP ≤ 40 Ko) | Onglet Network au chargement `/projets/[slug]` |
| **Requêtes DB par page d'accueil** | **≤ 3 requêtes** (ou 0 si hit cache ISR taggé) | Logs Drizzle / Neon |
| **Accessibilité Contrastes & Cibles** | WCAG AA ≥ **4.5:1**, cibles tactiles ≥ **44×44 px** | Audit Lighthouse Accessibility ≥ **95/100** |

---

## 2. KPI Produit & Engagement (Dashboard Statistiques)

*Données mesurées sans traceurs intrusifs via `analytics_events` :*

| KPI | Définition | Utilité pour Manu KRA |
| :--- | :--- | :--- |
| **Vues par Projet & Dossier** | Nombre de consultations distinctes sur `/projets/[slug]` | Identifier les thématiques Communication vs Économie qui attirent le plus |
| **Taux de Partage (`...`)** | `(link_copy + project_share) / project_view` | Mesurer la viralité réelle d'un projet ou d'une étude |
| **Lectures d'Articles & Commentaires** | Vues sur `/articles/[slug]` + ratio de commentaires publiés | Suivre l'impact des prises de position économiques |
| **Répartition Appareils** | % Mobile vs Tablette vs Desktop | Confirmer l'optimisation terrain en Côte d'Ivoire (mobile majoritaire) |

---

## 3. KPI SEO & GEO (Generative Engine Optimization)

| Pilier | Exigence & Mesure |
| :--- | :--- |
| **SEO Classique** | Score Lighthouse SEO **100/100**, URLs sémantiques propres (`/projets/observatoire-marches-abidjan`), balises `<title>`/`description` dynamiques via CMS, `sitemap.xml` dynamique, `robots.txt` excluant strictement la route admin masquée. |
| **Partage Social (WhatsApp / LinkedIn)** | OpenGraph complet (`og:title`, `og:description`, `og:image` 1200×630 générée dynamiquement) vérifié sur chaque projet et article. |
| **GEO (Visibilité IA : ChatGPT, Claude, Perplexity, Gemini)** | Fichier `/llms.txt` généré dynamiquement listant l'expertise de **Manu KRA** (Communication & Économie), ses dossiers, projets phares et articles ; balisage JSON-LD `Schema.org` (`Person`, `CreativeWork`, `Article`) riche et factuel. |

