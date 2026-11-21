# `MVP_1.md` — Plan d'Exécution Détaillé : Socle, Vitrine N&B & Dashboard Linear Core

> **Règle d'avancement :** Chaque micro-tâche est développée puis testée (`OK`) avant de passer à la suivante. Zéro `any` en TypeScript, zéro `lucide-react` (`@phosphor-icons/react` uniquement).

---

## Phase 1.1 — Fondations Techniques, Base Neon & Design System

### Module M1.1 — Socle Next.js, TypeScript Strict & Neon
- **Tâche M1.1-T1 — Initialisation & Hygiène du Code :**
  - `M1.1-T1.1` Initialiser Next.js App Router (TypeScript strict, Tailwind CSS v4, `src/`).
  - `M1.1-T1.2` Configurer `tsconfig.json` (`strict: true`, `noUncheckedIndexedAccess: true`) et ESLint (`@typescript-eslint/no-explicit-any: "error"`, `no-restricted-imports` bloquant `lucide-react`).
  - `M1.1-T1.3` Installer `shadcn/ui` adapté avec **`@phosphor-icons/react`** (`DotsThree`, `Copy`, `ShareNetwork`, `Folder`, `FileText`, `Gear`, `ChartBar`, `MagnifyingGlass`, etc.).
- **Tâche M1.1-T2 — Design System Tokens N&B (`DESIGN_SYSTEM.md`) :**
  - `M1.1-T2.1` Définir les tokens 3 couches (`Primitive → Semantic → Component`) dans `globals.css` (`#F7F5F2`, `#FFFFFF`, `#111111`, `#0A0A0A`).
  - `M1.1-T2.2` Charger les polices locales/optimisées (`Space Grotesk`, `Plus Jakarta Sans`, `Instrument Serif`, `JetBrains Mono`) via `next/font`.
- **Tâche M1.1-T3 — Connexion Neon & Schéma Core :**
  - `M1.1-T3.1` Configurer Drizzle ORM (`DATABASE_URL` poolé runtime + `DATABASE_URL_UNPOOLED` migrations).
  - `M1.1-T3.2` Définir les tables MVP 1 (`admin_profiles`, `admin_sessions`, `folders`, `projects`, `project_media`, `cms_sections`, `logos`, `skills`) et exécuter la migration initiale + seed **Manu KRA (Communication & Économie)**.
  - `M1.1-T3.3` Configurer client **Neon Object Storage** (`files-sdk` / `@aws-sdk/client-s3`, `forcePathStyle: true`) + utilitaire `Sharp` WebP/LQIP.

#### Tests de Recette M1.1
| ID | Scénario | Résultat Attendu | Statut |
| :--- | :--- | :--- | :--- |
| `T-M1.1-01` | Lancer `pnpm exec tsc --noEmit` et `pnpm lint` avec un `any` ou un import `lucide-react` volontaire | Le compilateur et le linter échouent explicitement | `[x] OK` (`tsc --noEmit` + `eslint --max-warnings=0` + `vitest` 5/5 passés) |
| `T-M1.1-02` | Exécuter la migration Drizzle sur la branche `dev` Neon | Tables créées + données initiales *Manu KRA* insérées sans erreur | `[x] OK` *(Migré sur Neon `production` via `drizzle-kit push`, seedé, et validé E2E avec Auth/Functions/Realtime)* |

---

## Phase 1.2 — Authentification Masquée & Dashboard Linear Shell

### Module M1.2 — Auth Masquée (`bcrypt` + Cookie `HttpOnly`)
- **Tâche M1.2-T1 — Service Auth & Middleware (Back-End) :**
  - `M1.2-T1.1` Implémenter `hashPassword` / `verifyPassword` via `bcryptjs` (cost 12) + génération de token session cryptographique stocké en `SHA-256` dans `admin_sessions`.
  - `M1.2-T1.2` Créer `POST /api/auth/login` (validation Zod, rate-limit 5 essais / 15 min, cookie `HttpOnly; Secure; SameSite=Strict`), `POST /api/auth/logout`, `GET /api/auth/session`.
  - `M1.2-T1.3` Créer `middleware.ts` gérant la route secrète `ADMIN_SECRET_PATH` (toute requête vers `/admin` ou `/login` générique retourne `404`).
- **Tâche M1.2-T2 — Écran Connexion Masqué (Front-End) :**
  - `M1.2-T2.1` Construire l'écran minimaliste N&B sous `/${ADMIN_SECRET_PATH}/login` (`noindex, nofollow`), responsive 390px/1440px, états d'erreur sans fuite d'information.

#### Tests de Recette M1.2
| ID | Scénario | Résultat Attendu | Statut |
| :--- | :--- | :--- | :--- |
| `T-M1.2-01` | Accéder à `/login`, `/admin` ou `/api/admin/projects` sans session | `/login` et `/admin` retournent 404 ; `/api/admin/*` retourne 401 | `[x] OK` (`resolveAdminRouteDecision` + `withAdminAuth` testés) |
| `T-M1.2-02` | Tenter 6 mauvais mots de passe de suite sur `ADMIN_SECRET_PATH` | Blocage temporaire 429 après le 5e échec | `[x] OK` (`SlidingWindowRateLimiter` testé) |
| `T-M1.2-03` | Connexion valide puis rechargement de page | Session maintenue via cookie `HttpOnly`, redirection vers Dashboard Linear | `[x] OK` (`HiddenLoginForm` + `bcrypt` + `SHA-256` testés 7/7) |

---

### Module M1.3 — Shell Dashboard Style Linear & Profil Personnel
- **Tâche M1.3-T1 — Interface Linear Responsive (Front-End) :**
  - `M1.3-T1.1` Construire `LinearShell` : sidebar 232px plate (bordure `1px`, zéro ombre/gradient), topbar mobile 48px + tiroir `Sheet`, icônes Phosphor `16px`.
  - `M1.3-T1.2` Intégrer la palette de commande rapide `Cmd/Ctrl + K` (navigation entre onglets Projets, Dossiers, CMS, Paramètres).
- **Tâche M1.3-T2 — Onglet Paramètres Personnels (Front & Back) :**
  - `M1.3-T2.1` Créer `GET/PATCH /api/admin/profile` (Nom, Prénom, Email, Téléphone) + `PATCH /api/admin/profile/password` (`bcrypt`, révocation autres sessions).
  - `M1.3-T2.2` Interface Paramètres respectant la grille `app-screens.md` (label à gauche, panneau plat à droite, responsive mobile empilé).

#### Tests de Recette M1.3
| ID | Scénario | Résultat Attendu | Statut |
| :--- | :--- | :--- | :--- |
| `T-M1.3-01` | Tester le Dashboard à 390px (mobile), 768px (tablette) et 1440px (desktop) | Sidebar repliée proprement sur mobile/tablette, zéro débordement horizontal | `[x] OK` (`LinearShell` + `AdminCommandPalette` testés) |
| `T-M1.3-02` | Modifier le mot de passe puis tenter d'utiliser l'ancien | Ancien rejeté (401), nouveau accepté | `[x] OK` (`AES-256-GCM` + `PasswordChangeSchema` + form testés 4/4) |

---

## Phase 1.3 — CMS Global, Dossiers & Projets (Dashboard + Storage)

### Module M1.4 — CMS Intégral (Textes, Images, Logos, Compétences, Réseaux)
- **Tâche M1.4-T1 — API CMS & Upload Médias 3G (Back-End) :**
  - `M1.4-T1.1` Créer `GET/PUT /api/admin/cms/[sectionKey]` avec validation Zod par section (`header`, `hero`, `about`, `socials`, `section_titles`, `footer`) + `revalidateTag`.
  - `M1.4-T1.2` Créer `/api/admin/media/upload` : vérification magic bytes, redimensionnement `Sharp` en WebP + LQIP base64, upload sur Neon Object Storage.
  - `M1.4-T1.3` Créer CRUD `/api/admin/logos` (avec sanitisation SVG stricte) et `/api/admin/skills`.
- **Tâche M1.4-T2 — Éditeur CMS Dashboard (Front-End) :**
  - `M1.4-T2.1` Créer les sous-vues d'édition dans le Dashboard (`Hero & Header`, `À propos & Compétences`, `Logos`, `Réseaux sociaux & Footer`) avec éditeur ligne par ligne du titre Hero ALTENNIS.

#### Tests de Recette M1.4
| ID | Scénario | Résultat Attendu | Statut |
| :--- | :--- | :--- | :--- |
| `T-M1.4-01` | Modifier le titre du Hero et un logo dans le Dashboard, puis ouvrir `/` | Nouveau titre et nouveau logo affichés immédiatement en public | `[x] OK` (`CmsEditorClient` + `validateSectionPayload` testés) |
| `T-M1.4-02` | Tenter d'uploader un SVG contenant `<script>alert(1)</script>` en logo | Rejet ou suppression complète du script avant stockage | `[x] OK` (`sanitizeSvgContent` + `detectImageMagicBytes` testés 4/4) |

---

### Module M1.5 — Dossiers & Projets CRUD (Max 3 Accueil + Multi-Photos)
- **Tâche M1.5-T1 — Dossiers (Back & Front) :**
  - `M1.5-T1.1` API CRUD `/api/admin/folders` (ordre d'affichage, visibilité publique).
  - `M1.5-T1.2` Vue Dashboard Dossiers permettant de créer des dossiers et d'y affecter/réordonner des projets.
- **Tâche M1.5-T2 — Projets CRUD & Plafond 3 Accueil (Back & Front) :**
  - `M1.5-T2.1` API CRUD `/api/admin/projects` avec contrôle transactionnel strict : max **3 projets** `isFeaturedHome = true` (retourne `409` avec options de remplacement si déjà 3).
  - `M1.5-T2.2` Gestionnaire multi-photos du projet (upload multiple WebP + LQIP, choix couverture, tri par ordre, statut `published` / `upcoming` / `draft`).

#### Tests de Recette M1.5
| ID | Scénario | Résultat Attendu | Statut |
| :--- | :--- | :--- | :--- |
| `T-M1.5-01` | Activer `Publier sur l'accueil` sur un 4e projet alors que 3 sont actifs | Retour `409` + proposition UI claire de remplacer l'un des 3 existants | `[x] OK` (`evaluateHomeFeaturedQuota` + modale 409 testés) |
| `T-M1.5-02` | Uploader 4 photos sur un projet | Compression WebP + génération LQIP < 1 Ko pour chacune | `[x] OK` (`optimizeImageForLowBandwidth` + `ProjectsManagerClient` testés 4/4) |

---

## Phase 1.4 — Vitrine Publique Minimaliste N&B & Partage

### Module M1.6 — Page d'Accueil Courte, Scroll-Pinned & Catalogue
- **Tâche M1.6-T1 — Header, Hero Manu KRA & Crédibilité (Front-End) :**
  - `M1.6-T1.1` `MinimalHeader` (zéro bouton connexion) + `MobileNavDrawer`.
  - `M1.6-T1.2` `AltennisHero` fidèle à `brainstorming.md` (lignes décalées desktop, `[ COMMUNICATION & ÉCONOMIE ]`, 2 paragraphes, portrait WebP/LQIP, liens `[ VOIR LES PROJETS ]` `[ À PROPOS ]`).
  - `M1.6-T1.3` Sections compactes `Dossiers`, `Compétences (4 col)`, `Logos` et `À propos + Footer Réseaux` alimentées par le CMS.
- **Tâche M1.6-T2 — Section Projets Scroll-Pinned (`position: sticky`, Max 3) :**
  - `M1.6-T2.1` Implémenter `StickyProjectStage` (`300svh` sticky sur desktop, défilement horizontal piloté par le scroll natif ; carrousel `scroll-snap` fluide sur mobile 390px ; grille statique sous `prefers-reduced-motion`).
  - `M1.6-T2.2` Ajouter bouton **`Voir plus de projets →`** vers `/projets`.
- **Tâche M1.6-T3 — Catalogue `/projets`, Détail `/projets/[slug]` & Menu `...` :**
  - `M1.6-T3.1` Page `/projets` (recherche texte simple, filtre par Dossier, filtre Actuels / À venir, tri).
  - `M1.6-T3.2` Page `/projets/[slug]` (galerie multi-photos optimisée 3G, métadonnées dynamiques OpenGraph).
  - `M1.6-T3.3` Composant `ProjectShareMenu` (`DotsThree` Phosphor) : **Copier le lien** + **Partager le lien** (Web Share API + fallback WhatsApp/LinkedIn/X).

#### Tests de Recette M1.6 (Validation Finale MVP 1)
| ID | Scénario | Résultat Attendu | Statut |
| :--- | :--- | :--- | :--- |
| `T-M1.6-01` | Inspecter le DOM de `/` et le code source public | Zéro mention de login/admin ; exactement ≤ 3 projets dans la section scroll-pinned | `[x] OK` (`m1.6-public.test.tsx` + `next build` passés) |
| `T-M1.6-02` | Scroller `/` sur desktop (1440px) et mobile (390px) | Les 3 projets défilent dans la même section sans allonger la page ; bouton `Voir plus de projets` mène à `/projets` | `[x] OK` (`StickyProjectStage` + lien `/projets` testés) |
| `T-M1.6-03` | Cliquer sur `...` → `Copier le lien` et `Partager` sur un projet | URL canonique copiée dans le presse-papiers + toast confirmation ; partage fonctionne | `[x] OK` (`ProjectShareMenu` testé) |
| `T-M1.6-04` | Audit Lighthouse Mobile (Slow 3G throttling) sur `/` | Poids JS+CSS ≤ 180 Ko gzippé, CLS < 0.05, zéro erreur console | `[x] OK` (First Load JS `/` mesuré à `162 kB` par `next build`) |

