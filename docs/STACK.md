# `STACK.md` — Stack Technologique & Justification

> Chaque outil est choisi pour sa **stabilité en production**, sa **compatibilité avec les réseaux faibles (Côte d'Ivoire)**, le **strict respect de `minimalist-skill`**, et la **sécurité OWASP**.

---

## 1. Tableau Récapitulatif de la Stack

| Couche | Technologie / Package | Rôle | Justification |
| :--- | :--- | :--- | :--- |
| **Framework Full-Stack** | **Next.js (App Router stable, v15/16)** + **React 19** | SSR, RSC, Route Handlers, Metadata/OpenGraph | Rendu serveur instantané en 3G, SEO/GEO natif, optimisation images intégrée. |
| **Langage** | **TypeScript 5+ (`strict: true`)** | Typage statique Front & Back | Garantit l'interdiction absolue de `any` (`@typescript-eslint/no-explicit-any: error`). |
| **Styling** | **Tailwind CSS v4** | Utilitaires CSS + Tokens 3 couches | CSS minimal en production (purge automatique), responsive mobile-first natif. |
| **Composants UI** | **shadcn/ui** (primitives Radix UI) | Modales, Menus `...`, Command `Cmd+K`, Drawers | Code possédé dans le repo, accessible (WAI-ARIA / clavier), personnalisable en N&B pur. |
| **Icônes** | **`@phosphor-icons/react`** + **`@radix-ui/react-icons`** | Système d'icônes unifié | Respect strict de `minimalist-skill` (**Lucide banni**). Trait technique homogène (`weight="bold"` / `regular`). |
| **Validation** | **Zod** | Validation formulaires, API & blocs articles | Contrat unique partagé Front ↔ Back, protection contre les données malformées. |
| **Animations Scroll** | **CSS Scroll-Driven / IntersectionObserver** + **GSAP (`ScrollTrigger`)** (chargé si besoin) | Scène épinglée des 3 projets & transitions | Fluide à 60fps sur `transform`/`opacity` uniquement, respect de `prefers-reduced-motion`. |
| **Base de Données** | **Neon Lakebase Postgres** | Persistance relationnelle + branching dev/prod | Postgres managé serverless, copy-on-write branching, connexion poolée + directe. |
| **ORM & Migrations** | **Drizzle ORM** + **`drizzle-kit`** | Requêtes SQL typées sans `any` & migrations | Empreinte bundle minuscule, performances SQL brutes, support natif Neon. |
| **Stockage Médias** | **Neon Object Storage** (`files-sdk` / `@aws-sdk/client-s3`) | Photos multiples, vidéos, logos | S3-compatible, branchement synchronisé avec la BDD Neon, servi via CDN Edge. |
| **Optimisation Médias** | **Sharp** (côté serveur upload) + **`next/image`** | Conversion WebP/AVIF + génération LQIP | Réduction jusqu'à 75 % du poids image pour les utilisateurs 3G en Côte d'Ivoire. |
| **Sécurité & Crypto** | **`bcryptjs`** + **`node:crypto` (`AES-256-GCM`, `SHA-256`, `HMAC`)** | Auth masquée, chiffrement données perso, intégrité | Respect explicite des exigences cryptographiques & OWASP Top 10. |
| **Sanitisation** | **DOMPurify (`isomorphic-dompurify`)** / Encodeur strict | Nettoyage commentaires & URLs | Bloque tout vecteur XSS sur les commentaires visiteurs sans compte. |
| **Documentation API** | **OpenAPI 3.1 + Scalar (`@scalar/api-reference-nextjs`)** | Explorateur API interactif (MVP 3) | Documentation claire et testable de tous les endpoints REST. |
| **Carte Interactive** | **Leaflet / MapLibre GL** (import dynamique lazy MVP 4) | Carte des projets Côte d'Ivoire & Monde | Chargé uniquement à l'ouverture de la carte (0 Ko sur la page d'accueil). |
| **Tests & Qualité** | **Vitest** + **Testing Library** + **Playwright** | Tests unitaires, crypto, intégration & E2E mobile | Permet de valider chaque feature avant de passer à la suivante. |
| **Hébergement** | **Vercel** + **GitHub Actions** | Déploiement continu Edge + CI | Intégration native Next.js + previews par branche PR. |

---

## 2. Règles d'Installation & Hygiène des Dépendances
- **Zéro dépendance superflue :** Aucun framework CSS tiers, aucune librairie d'icônes en doublon (notamment **zéro `lucide-react`**).
- **Optimisation bundle client :** Les librairies lourdes (`sharp`, `bcryptjs`, `drizzle-orm`, `node:crypto`) restent **100 % côté serveur** et ne sont jamais importées dans un composant `'use client'`.
- **Gestionnaire de paquets :** `pnpm` (sur Windows, selon la règle de l'environnement, les installations `pnpm add`/`install` s'exécutent proprement avec résolution stricte via `pnpm-lock.yaml`).

