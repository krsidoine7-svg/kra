# `API.md` — Contrats d'API REST & Documentation OpenAPI Scalar

> **Format :** REST JSON strictement typé (Zod Front & Back, zéro `any`)
> **Explorateur interactif (MVP 3) :** **Scalar** (`https://scalar.com/`) monté sur `/api/docs` (protégé par session admin en production, accessible en dev) lisant `/api/openapi.json`.

---

## 1. Endpoints Publics (Sans Authentification)

| Méthode | Endpoint | Description | Cache / Sécurité |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/public/home` | Retourne CMS Hero, Header, 3 projets épinglés max, Dossiers, Compétences, Logos, Footer | Cache taggé ISR + projection minimale |
| `GET` | `/api/public/projects` | Liste paginée avec query params : `q`, `folder`, `status`, `sort`, `page`, `limit` *(+ `year`, `mediaType`, `country` en MVP 3)* | Pagination `limit <= 24`, sans colonnes privées |
| `GET` | `/api/public/projects/[slug]` | Détail complet d'un projet publié ou à venir + médias WebP/vidéos | 404 si `draft` ou `deleted_at IS NOT NULL` |
| `GET` | `/api/public/articles` | Liste paginée des articles publiés + filtre tag/recherche | Projection légère (sans tout le JSON blocs) |
| `GET` | `/api/public/articles/[slug]` | Article complet + commentaires `approved` uniquement | Jamais d'email commentateur exposé |
| `POST` | `/api/public/articles/[slug]/comments` | Soumettre un commentaire **sans création de compte** | Zod + Honeypot + Rate-limit (3/10min/IP) + Sanitisation XSS |
| `POST` | `/api/public/analytics` | Enregistrement léger (`project_view`, `project_share`, `link_copy`, `article_view`) | Validation stricte enum + zéro PII |
| `GET` | `/api/public/map` | *(MVP 4)* Coordonnées agrégées des projets géolocalisés | Uniquement projets publics avec coords |

---

## 2. Endpoints Authentification Masquée

| Méthode | Endpoint | Description | Protection |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Connexion admin (`email`, `password`) | Vérification `bcryptjs`, lockout après 5 échecs, cookie `HttpOnly; Secure; SameSite=Strict` |
| `POST` | `/api/auth/logout` | Révoque la session courante en base (`DELETE` par hash `SHA-256`) | Supprime le cookie |
| `GET` | `/api/auth/session` | Vérifie la session courante et retourne le profil non sensible | `401` si absente/expirée |

---

## 3. Endpoints Dashboard Admin (Protégés par `requireAdminSession()`)

### 3.1 Projets & Médias
- `GET /api/admin/projects` — Liste complète (incluant `draft`, `upcoming`, `archived`, filtre `includeDeleted=true` pour corbeille).
- `POST /api/admin/projects` — Création projet + garde-fou **max 3 `isFeaturedHome`** (`409` si dépassement sans `replaceProjectId`).
- `PATCH /api/admin/projects/[id]` — Mise à jour partielle + revalidation tags ISR + snapshot mémoire *(MVP 4)*.
- `POST /api/admin/media/upload` — Upload multipart validé (magic bytes), optimisation Sharp WebP + calcul LQIP + hash `SHA-256` + envoi Neon Object Storage.
- `DELETE /api/admin/projects/[id]` — Soft Delete (`deleted_at = now()`) ; `?hard=true` pour purge définitive depuis la corbeille.

### 3.2 Dossiers (`folders`)
- `GET /api/admin/folders` · `POST /api/admin/folders` · `PATCH /api/admin/folders/[id]` · `DELETE /api/admin/folders/[id]`

### 3.3 Articles & Modération Commentaires
- `GET /api/admin/articles` · `POST /api/admin/articles` · `PATCH /api/admin/articles/[id]` · `DELETE /api/admin/articles/[id]`
- `GET /api/admin/comments` (filtre `pending | approved | rejected`)
- `PATCH /api/admin/comments/[id]` (approuver / rejeter / soft-delete)

### 3.4 CMS Global, Logos & Compétences
- `GET /api/admin/cms/[sectionKey]` · `PUT /api/admin/cms/[sectionKey]` (met à jour `cms_sections`, calcule `checksum_sha256`, enregistre snapshot mémoire et revalide ISR).
- CRUD `/api/admin/logos` et `/api/admin/skills`.

### 3.5 Radiographie d'Impact, Recherches, Mémoire & Profil
- `GET /api/admin/impact-xray?entityType=<type>&id=<uuid>` *(MVP 3)* — Retourne l'arbre exact des impacts avant suppression/archivage :
  ```json
  {
    "entity": { "type": "folder", "id": "...", "label": "Études Économiques" },
    "canDeleteSafely": false,
    "impacts": {
      "linkedProjectsCount": 4,
      "featuredHomeProjectsCount": 1,
      "activeShareLinksCount": 4,
      "cmsReferencesCount": 1
    },
    "affectedItems": [
      { "type": "project", "id": "...", "title": "Observatoire des Marchés", "isFeaturedHome": true }
    ]
  }
  ```
- `GET / POST / DELETE /api/admin/saved-searches` *(MVP 3)* — Gestion des recherches/filtres sauvegardés.
- `GET /api/admin/memory` & `POST /api/admin/memory/[snapshotId]/restore` *(MVP 4)* — Consultation des snapshots de sections et restauration atomique.
- `GET /api/admin/stats` — Statistiques agrégées (vues, partages `...`, top projets/articles).
- `GET / PATCH /api/admin/profile` — Édition Nom, Prénom, Email, Téléphone (déchiffré/rechiffré `AES-256-GCM`).
- `PATCH /api/admin/profile/password` — Changement de mot de passe (`bcrypt`) + révocation des autres sessions.
- `DELETE /api/admin/profile` — Suppression du compte admin après saisie du mot de passe + confirmation textuelle explicite.

---

## 4. Spécification OpenAPI & Intégration Scalar (`MVP 3`)

Route Next.js `src/app/api/docs/route.ts` utilisant `@scalar/api-reference-nextjs` :
```typescript
import { ApiReference } from '@scalar/api-reference-nextjs';

export const GET = ApiReference({
  url: '/api/openapi.json',
  theme: 'alternate', // Monochrome compatible noir & blanc
});
```
Protégée par vérification de session admin en production afin de ne pas exposer la surface API d'administration aux scanners publics.

