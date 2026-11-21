# `TDD.md` — Technical Design Document (La Bible Technique)

> **Cible :** Portfolio Minimaliste & Studio Linear de **Manu KRA** (Communication & Économie)
> **Règle de Qualité :** Code **TypeScript strict (`strict: true`)**, **zéro `any`** imposé à la compilation et par ESLint, composants réutilisables, séparation stricte Front-End / Back-End / Domaine.

---

## 1. Conventions de Code & Règles TypeScript Strictes

### 1.1 Zéro `any` côté Front-End et Back-End
Configuration obligatoire dans `tsconfig.json` et `eslint.config.mjs` :
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitAny": true,
    "exactOptionalPropertyTypes": true
  }
}
```
Règle ESLint : `"@typescript-eslint/no-explicit-any": "error"`, `"@typescript-eslint/no-unsafe-assignment": "error"`.
Toute donnée provenant d'une API, d'un formulaire ou de la base Neon est typée par **schéma Zod** (`z.infer<typeof Schema>`) et jamais castée en `any` ou `as unknown as`.

### 1.2 Architecture en Couches (`src/`)
```text
src/
├── app/                     # Next.js App Router (Pages publiques, API, Route Admin masquée)
├── components/
│   ├── ui/                  # Primitives shadcn/ui modifiées (icônes Phosphor uniquement)
│   ├── public/              # Hero, ScrollStageProjects, FoldersGrid, ArticleRenderer, ShareMenu
│   └── dashboard/           # LinearShell, Sidebar, CommandPalette, Forms, ImpactXRay
├── lib/
│   ├── db/                  # Connexion Neon, Schéma Drizzle, Requêtes typées
│   ├── security/            # bcrypt, AES-256-GCM, SHA-256/HMAC, RateLimiter, Sanitizer
│   ├── storage/             # Neon Object Storage (S3 presigned + optimisation WebP/LQIP)
│   ├── validators/          # Schémas Zod partagés Front & Back
│   └── utils/               # Formatters, SEO/JSON-LD, Cache revalidation
└── types/                   # Types métier purs (sans any)
```

---

## 2. Spécification Technique Détaillée par Section (Front & Back)

### T01 — Header & Hero ALTENNIS (`/`)
- **Front-End :**
  - `Server Component` (`src/app/(public)/page.tsx`) qui charge les sections `header` et `hero` directement côté serveur (aucun waterfall client au premier affichage).
  - Typographie fluide CSS `clamp()` et grilles responsives (`flex-col` mobile → grille en escalier `lg:grid` desktop).
  - Animation d'entrée CSS/Motion uniquement sur `transform` et `opacity` (`--ease-expo`), avec état initial visible si `prefers-reduced-motion: reduce` ou JS désactivé.
- **Back-End :**
  - Table `cms_sections` (`key = 'hero' | 'header'`) avec validation Zod stricte (`HeroContentSchema`) : titre (découpé en lignes configurables `{ text, align, thinAmpersand }`), badge mono, 2 paragraphes, image portrait (`mediaId`), CTA `[ ... ]`.
  - Cache Next.js taggé (`unstable_cache` avec tag `cms:hero`) invalidé instantanément par `revalidateTag('cms:hero')` après modification admin.

### T02 — Section Projets Scroll-Pinned (Max 3 Projets sur Accueil)
- **Front-End (`ScrollPinnedProjects.tsx`) :**
  - **Desktop (≥ 1024px) :**
    - Conteneur parent de hauteur `calc(100svh * var(--project-count))` (soit `300svh` pour 3 projets).
    - Enfant direct `position: sticky; top: 0; height: 100svh`.
    - Détection du scroll via `IntersectionObserver` + `requestAnimationFrame` passif sur `window.scrollY` (ou `GSAP ScrollTrigger` chargé dynamiquement sans bloquer le FCP) qui calcule `progress ∈ [0, 1]` pour traduire horizontalement la piste des 3 cartes (`transform: translate3d(-X%, 0, 0)`), zéro reflow/layout shift.
  - **Mobile / Tablette (< 1024px) & `prefers-reduced-motion` :**
    - Carrousel natif `overflow-x: auto; scroll-snap-type: x mandatory` (zéro JS lourd, fluide au pouce sur smartphones d'entrée de gamme) + indicateurs tactiles `44x44px`.
  - Bouton final : `<Link href="/projets">Voir plus de projets</Link>`.
- **Back-End :**
  - Requête SQL indexée :
    ```sql
    SELECT p.*, f.name AS folder_name, f.slug AS folder_slug
    FROM projects p
    LEFT JOIN folders f ON f.id = p.folder_id
    WHERE p.is_featured_home = true
      AND p.deleted_at IS NULL
      AND p.status IN ('published', 'upcoming')
    ORDER BY p.featured_order ASC
    LIMIT 3;
    ```
  - Enforcer côté serveur (transaction Postgres) : si 3 projets ont déjà `is_featured_home = true`, la mutation retourne `409 Conflict` avec la liste des 3 projets actuels (et un paramètre optionnel `replaceProjectId` pour échanger atomiquement en 1 requête).

### T03 — Dossiers & Catalogue (`/projets`, `/projets/[slug]`)
- **Front-End :**
  - Page `/projets` en `Server Component` lisant `searchParams` (`dossier`, `statut`, `tri`, `q`, plus `annee`/`type`/`ville` en MVP 3) afin que **chaque vue filtrée ait une URL partageable et bookmarkable**.
  - Page `/projets/[slug]` : galerie multi-photos avec `next/image` + `placeholder="blur"` + `blurDataURL` (LQIP stocké en DB) ; lecteur vidéo encapsulé dans un composant `LazyVideoPlayer` affichant uniquement une vignette WebP et ne montant la balise `<video preload="none">` qu'au clic utilisateur.
- **Back-End :**
  - Pagination par curseur ou offset (`limit = 12`) pour éviter les payloads massifs sur 3G.
  - Projection stricte des colonnes (pas de `SELECT *` — règle `neon-postgres` Egress Optimization).

### T04 — Partage par Lien (`...`) & OpenGraph Dynamique
- **Front-End (`ProjectShareMenu.tsx`) :**
  - Bouton icône `DotsThree` (Phosphor Bold) ouvrant un `DropdownMenu` `shadcn/ui`.
  - `Copier le lien` : utilise `navigator.clipboard.writeText(canonicalUrl)` + fallback `<textarea>` temporaire, retour visuel instantané (`Check` Phosphor pendant 2 s).
  - `Partager` : teste `typeof navigator.share === 'function'`, sinon ouvre des liens directs encodés (WhatsApp `https://wa.me/?text=...`, LinkedIn, X, `mailto:`).
- **Back-End :**
  - Route `src/app/(public)/projets/[slug]/opengraph-image.tsx` (Edge/Node) générant une image PNG monochrome 1200×630 propre avec titre, statut et marque *Manu KRA*.
  - Enregistrement asynchrone du compteur de partages via `POST /api/analytics/event` (`navigator.sendBeacon` non bloquant).

### T05 — Articles Éditoriaux & Commentaires Sans Compte (`/articles/[slug]`)
- **Front-End :**
  - Rendu typé par discriminated union TypeScript (aucun `any`, zéro `dangerouslySetInnerHTML`) :
    ```typescript
    export type ArticleBlock =
      | { id: string; type: 'heading'; level: 1 | 2 | 3 | 4; text: string }
      | { id: string; type: 'paragraph'; spans: TextSpan[] }
      | { id: string; type: 'list'; style: 'bullet' | 'dash'; items: TextSpan[][] }
      | { id: string; type: 'quote'; text: string; author?: string }
      | { id: string; type: 'signature'; name: string; role?: string; location?: string; dateLabel?: string };
    ```
  - Formulaire de commentaire sans compte : Nom, Email optionnel, Message + champ caché CSS `website` (honeypot anti-bot).
- **Back-End :**
  - Validation Zod de chaque `ArticleBlock` et de chaque commentaire (longueur 3–2000 caractères, strip de toute balise HTML).
  - Protection anti-spam : honeypot rejeté silencieusement (`202`), rate-limit par hash `SHA-256(IP + salt)` limité à 3 commentaires / 10 min.

### T06 — Dashboard Linear, Auth Masquée & CMS Intégral
- **Front-End :**
  - Layout `/<ADMIN_SECRET_PATH>/...` isolé avec `robots: { index: false, follow: false }`.
  - Sidebar responsive + Command Palette (`Cmd+K`) en `shadcn/ui` Command.
  - Upload média direct vers **Neon Object Storage** via URL présignée (`POST /api/admin/media/presign`), compression/redimensionnement WebP + calcul LQIP et empreinte `SHA-256` côté serveur/route handler avant enregistrement en base.
- **Back-End :**
  - Middleware Next.js vérifiant la présence du cookie de session sur toutes les routes `/<ADMIN_SECRET_PATH>/*` (sauf `/login`) et `/api/admin/*`.
  - Double vérification de session côté chaque Server Action & Route Handler (`requireAdminSession()`).

---

## 3. Stratégie Réseau Faible Côte d'Ivoire (3G / Connexion Instable)

1. **Budget Poids Strict :**
   - Premier chargement `/` : HTML SSR + CSS + JS minimal ≤ **180 Ko gzippé**.
   - Images : conversion WebP/AVIF + `sizes` responsives + LQIP base64 (`~400 octets`) pour éviter tout saut visuel (`CLS < 0.05`).
   - Vidéos : **0 octet vidéo chargé au chargement de la page**. Poster WebP léger (~30 Ko) ; chargement streaming HTTP Range uniquement au clic.
2. **Résilience Formulaire & Dashboard :**
   - Sauvegarde brouillon locale (`localStorage`) dans l'éditeur d'articles/CMS en cas de coupure réseau pendant la rédaction, avec resynchronisation à la reconnexion.
   - Timeout réseau propres et messages d'erreur actionnables (« Connexion lente, réessayer ») sans perte de saisie.
3. **Cache HTTP & Revalidation :**
   - Médias immuables : `Cache-Control: public, max-age=31536000, immutable`.
   - Pages publiques SSR/ISR : `revalidateTag` déclenché uniquement lors des publications/modifications admin.

