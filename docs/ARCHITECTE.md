# `ARCHITECTE.md` — Architecture Système Complète

> **Modèle d'architecture :** Full-Stack Next.js App Router déployé sur Edge/Serverless (Vercel) + Backend Données & Stockage sur **Neon (Lakebase Postgres + Neon Object Storage)**.

---

## 1. Diagramme d'Architecture Globale

```mermaid
flowchart TB
    subgraph Client["Couche Client (Mobile 3G CI / Tablette / Desktop)"]
        PUB_UI["Vitrine Publique N&B (Hero Manu KRA, Scroll-Pinned 3 Projets, /projets, /articles)"]
        ADM_UI["Dashboard Linear (URL Masquée, Sidebar, CMS, Dossiers, Radiographie, Mémoire)"]
    end

    subgraph Edge["Edge Network & CDN (Vercel)"]
        CDN["Cache Statique & Images WebP/AVIF (Cache-Control Immutable)"]
        MW["Middleware Sécurité (CSP, Headers OWASP, Gate Route Admin Masquée)"]
    end

    subgraph AppServer["Serveur Applicatif Next.js (App Router + TypeScript Strict)"]
        RSC["React Server Components (SSR + ISR Taggé)"]
        SA["Server Actions & Route Handlers (/api/public/* & /api/admin/*)"]
        SCALAR["Scalar OpenAPI Docs (/api/docs - Protégé)"]
        SEC["Module Sécurité (Zod, bcryptjs, AES-256-GCM, SHA-256, Rate Limiter)"]
    end

    subgraph Neon["Plateforme Neon (Branches Isolées dev / preview / main)"]
        PG_POOL["Lakebase Postgres - Connexion Poolée (DATABASE_URL - PgBouncer)"]
        PG_DIR["Lakebase Postgres - Connexion Directe (DATABASE_URL_UNPOOLED - Migrations)"]
        S3["Neon Object Storage (Buckets S3-compatible : public-media & private-backups)"]
    end

    PUB_UI --> Edge
    ADM_UI --> Edge
    Edge --> MW --> RSC
    Edge --> MW --> SA
    SA --> SEC
    SEC --> PG_POOL
    RSC --> PG_POOL
    SA --> S3
    S3 --> CDN
    SCALAR --> SA
```

---

## 2. Séparation Front-End / Back-End & Flux de Données

### 2.1 Rendu Hybride Optimisé 3G
- **Pages Publiques (`/`, `/projets`, `/projets/[slug]`, `/articles`, `/articles/[slug]`) :**
  - Rendues côté serveur (**RSC**) à partir de Postgres (via connexion poolée `-pooler`) et mises en cache avec des tags granulaires (`cms:global`, `projects:featured`, `projects:list`, `articles:list`).
  - Seuls les îlots interactifs (Scroll-Pinned controller, menu partage `...`, formulaire commentaire, carte interactive MVP 4 en lazy import) hydratent du JavaScript côté client.
- **Dashboard Admin (`/${ADMIN_ROUTE_SLUG}/*`) :**
  - Aucune indexation (`X-Robots-Tag: noindex, nofollow`).
  - Mutations via Route Handlers REST typés et/ou Server Actions validées par Zod.
  - Chaque mutation admin met à jour Postgres, génère le snapshot Mémoire *(MVP 4)* et appelle `revalidateTag(...)` pour rafraîchir instantanément la vitrine publique.

### 2.2 Stratégie de Connexion Neon (`neon-postgres`)
- **Runtime applicatif :** `DATABASE_URL` (avec suffixe `-pooler`, via `pg` + Vercel Fluid compute ou `@neondatabase/serverless`) pour supporter les rafales de connexions sans saturer Postgres.
- **Migrations Drizzle Kit :** `DATABASE_URL_UNPOOLED` (connexion directe sans PgBouncer) exclusivement dans les scripts de migration/CLI (`drizzle-kit migrate`).
- **Workflow Branch-First :** Une branche Neon dédiée par environnement (`main` production, `staging`, `dev-*` pour tester les migrations et la Radiographie d'impact sans toucher aux données réelles).

### 2.3 Stratégie de Stockage Médias (`neon-object-storage`)
- **Bucket `portfolio-public` (`public_read`) :** Images WebP/AVIF des projets, portraits, logos partenaires, vidéos MP4/WebM compressées.
- Clés versionnées par hash/UUID (`projects/<projectId>/<uuid>-w1200.webp`) : zéro problème de cache obsolète lors d'un remplacement d'image dans le CMS.
- Upload sécurisé par le Dashboard via **URL présignée S3** ou endpoint `/api/admin/media/upload` avec vérification MIME réelle (magic bytes), limite de taille, génération de miniature + LQIP base64 + empreinte `SHA-256`.

---

## 3. Architecture Modulaire & Composants Réutilisables

| Couche | Modules Clés | Responsabilité |
| :--- | :--- | :--- |
| **Design Primitives** | `Button`, `Sheet`, `DropdownMenu`, `Dialog`, `Command`, `Input`, `Badge` | Base `shadcn/ui` re-stylée Monochrome N&B avec **Phosphor Icons** uniquement |
| **Vitrine Public** | `MinimalHeader`, `AltennisHero`, `StickyProjectStage`, `FolderRail`, `ShareMenu`, `RichArticleView`, `LazyVideoPlayer`, `InteractiveProjectMap` | Expérience visiteur, scroll-driven, partage `...`, articles, carte lazy |
| **Dashboard Linear** | `LinearSidebar`, `MobileAdminNav`, `AdminCommandBar`, `ProjectForm`, `FolderManager`, `BlockArticleEditor`, `CmsSectionEditor`, `ImpactXRayDialog`, `SectionMemoryViewer` | Gestion autonome, UX clavier, upload 3G, Radiographie & Mémoire |
| **Services Métier Back** | `ProjectService`, `FolderService`, `ArticleService`, `CmsService`, `CryptoService`, `ImpactAnalyzerService`, `MemorySnapshotService`, `MediaOptimizerService` | Règles métier isolées, testables unitairement sous Vitest sans UI |

---

## 4. Scalabilité & Évolution Future
- **Ajout facile d'un second rédacteur ou multi-rôle :** La table `admin_profiles` supporte un champ `role` dès l'origine.
- **Multilingue (FR / EN) ultérieur :** Les clés `cms_sections` et `projects`/`articles` peuvent être étendues par colonne `locale` sans casser la structure des routes.
- **Neon AI Gateway (optionnel futur) :** Grâce à la structure modulaire sur Neon, des résumés automatiques d'articles ou embeddings `Lakebase Search` pourront être branchés ultérieurement si souhaité sans refonte.

