# `DB_SCHEMA.md` — Schéma Physique PostgreSQL (Neon + Drizzle ORM)

> **Base :** Lakebase Postgres sur **Neon**
> **Connexions :**
> - `DATABASE_URL` (suffixe `-pooler` via PgBouncer) → utilisé par l'application Next.js en production/serverless.
> - `DATABASE_URL_UNPOOLED` (connexion directe) → utilisé **exclusivement** par `drizzle-kit migrate` / CLI.

---

## 1. Conventions SQL & Optimisation Egress Neon
- Toutes les clés primaires utilisent `uuid DEFAULT gen_random_uuid()`.
- Tous les horodatages utilisent `timestamptz NOT NULL DEFAULT now()`.
- **Interdiction de `SELECT *` :** Toutes les requêtes Drizzle spécifient explicitement les colonnes nécessaires pour minimiser l'egress Neon et le payload envoyé sur réseau 3G.
- **Index partiels Soft Delete :** `WHERE deleted_at IS NULL` sur les index de lecture publique pour des requêtes instantanées.

---

## 2. DDL SQL Détaillé (Correspondant 1:1 au Schéma Drizzle)

```sql
-- Types énumérés
CREATE TYPE project_status AS ENUM ('draft', 'upcoming', 'published', 'archived');
CREATE TYPE media_type AS ENUM ('image', 'video');
CREATE TYPE article_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE moderation_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE search_target AS ENUM ('projects', 'articles');
CREATE TYPE analytics_event_type AS ENUM (
  'page_view',
  'project_view',
  'project_share',
  'link_copy',
  'article_view'
);

-- 1. Profil Administrateur Unique (Manu KRA)
CREATE TABLE admin_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name VARCHAR(80) NOT NULL DEFAULT 'Manu',
  last_name VARCHAR(80) NOT NULL DEFAULT 'KRA',
  email VARCHAR(255) NOT NULL UNIQUE,
  phone_encrypted TEXT,                 -- Chiffré AES-256-GCM (iv:tag:cipher)
  recovery_email_encrypted TEXT,        -- Chiffré AES-256-GCM
  password_hash TEXT NOT NULL,          -- Hash bcryptjs (cost 12)
  failed_login_attempts INTEGER NOT NULL DEFAULT 0,
  locked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- 2. Sessions Administrateur
CREATE TABLE admin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES admin_profiles(id) ON DELETE CASCADE,
  token_sha256 VARCHAR(64) NOT NULL UNIQUE,
  ip_hash_sha256 VARCHAR(64) NOT NULL,
  user_agent_hash VARCHAR(64) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_sessions_admin ON admin_sessions(admin_id);
CREATE INDEX idx_sessions_expires ON admin_sessions(expires_at);

-- 3. Dossiers de Projets
CREATE TABLE folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(120) NOT NULL,
  slug VARCHAR(140) NOT NULL UNIQUE,
  description TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_visible_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_folders_public ON folders(display_order) WHERE deleted_at IS NULL AND is_visible_public = true;

-- 4. Projets (Actuels & Futurs à Venir)
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
  title VARCHAR(180) NOT NULL,
  slug VARCHAR(200) NOT NULL UNIQUE,
  status project_status NOT NULL DEFAULT 'draft',
  summary TEXT NOT NULL,
  content_blocks JSONB NOT NULL DEFAULT '[]'::jsonb,
  external_url TEXT,
  year SMALLINT,
  client_or_context VARCHAR(160),
  tags TEXT[] NOT NULL DEFAULT '{}',
  is_featured_home BOOLEAN NOT NULL DEFAULT false,
  featured_order SMALLINT CHECK (featured_order BETWEEN 1 AND 3),
  -- Champs géographiques pour Carte Interactive (MVP 4)
  location_city VARCHAR(100),
  location_country VARCHAR(100),
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_projects_home ON projects(featured_order)
  WHERE is_featured_home = true AND deleted_at IS NULL AND status IN ('published', 'upcoming');
CREATE INDEX idx_projects_folder ON projects(folder_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_projects_tags ON projects USING GIN(tags);

-- 5. Médias Projets (Multi-Photos & Vidéos — Neon Object Storage)
CREATE TABLE project_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  media_type media_type NOT NULL,
  object_key TEXT NOT NULL,
  poster_key TEXT,                      -- Vignette WebP légère pour vidéos 3G
  lqip_base64 TEXT,                     -- Micro-blur base64 < 1 Ko
  alt_text VARCHAR(255) NOT NULL DEFAULT '',
  mime_type VARCHAR(100) NOT NULL,
  width INTEGER,
  height INTEGER,
  duration_seconds INTEGER,
  size_bytes BIGINT NOT NULL,
  sha256_hash VARCHAR(64) NOT NULL,
  is_cover BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_project_media_project ON project_media(project_id, sort_order) WHERE deleted_at IS NULL;

-- 6. Articles Éditoriaux (Communication & Économie)
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(220) NOT NULL UNIQUE,
  excerpt TEXT NOT NULL,
  status article_status NOT NULL DEFAULT 'draft',
  blocks JSONB NOT NULL DEFAULT '[]'::jsonb, -- H1-H4, puces, tirets, liens, citations, signature
  tags TEXT[] NOT NULL DEFAULT '{}',
  reading_minutes SMALLINT NOT NULL DEFAULT 3,
  cover_object_key TEXT,
  cover_lqip TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_articles_pub ON articles(published_at DESC) WHERE deleted_at IS NULL AND status = 'published';

-- 7. Commentaires d'Articles (Visiteurs sans compte)
CREATE TABLE article_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  author_name VARCHAR(80) NOT NULL,
  author_email_encrypted TEXT,          -- Optionnel, chiffré AES-256-GCM, jamais exposé en public
  body_sanitized TEXT NOT NULL,
  ip_hash_sha256 VARCHAR(64) NOT NULL,
  moderation_status moderation_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_comments_article ON article_comments(article_id, created_at DESC)
  WHERE deleted_at IS NULL AND moderation_status = 'approved';

-- 8. CMS Global des Sections
CREATE TABLE cms_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key VARCHAR(80) NOT NULL UNIQUE, -- header | hero | about | socials | footer | section_titles
  payload JSONB NOT NULL,
  checksum_sha256 VARCHAR(64) NOT NULL,
  updated_by UUID REFERENCES admin_profiles(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Mémoire Globale des Sections (Versionning & Restauration - MVP 4)
CREATE TABLE section_memory_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(40) NOT NULL,     -- cms_section | project | article | folder
  entity_id UUID,
  section_key VARCHAR(80),
  snapshot_data JSONB NOT NULL,
  checksum_sha256 VARCHAR(64) NOT NULL,
  version_number INTEGER NOT NULL,
  change_note VARCHAR(255),
  created_by UUID REFERENCES admin_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_memory_entity ON section_memory_snapshots(entity_type, section_key, version_number DESC);

-- 10. Logos (Clients / Partenaires / Outils)
CREATE TABLE logos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(120) NOT NULL,
  category VARCHAR(40) NOT NULL DEFAULT 'partner', -- client | partner | institution | tool
  object_key TEXT NOT NULL,
  website_url TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- 11. Compétences (Section Crédibilité CMS)
CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(120) NOT NULL,
  description VARCHAR(280) NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- 12. Recherches Sauvegardées (MVP 3)
CREATE TABLE saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES admin_profiles(id) ON DELETE CASCADE,
  label VARCHAR(120) NOT NULL,
  target search_target NOT NULL,
  filter_params JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 13. Événements Analytics (Statistiques sans traceurs tiers)
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type analytics_event_type NOT NULL,
  target_id UUID,
  target_slug VARCHAR(220),
  session_hash_sha256 VARCHAR(64) NOT NULL,
  device_type VARCHAR(20),              -- mobile | tablet | desktop
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_analytics_type_date ON analytics_events(event_type, created_at DESC);

-- 14. Journal d'Audit de Sécurité
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES admin_profiles(id) ON DELETE SET NULL,
  action VARCHAR(80) NOT NULL,
  entity_type VARCHAR(60) NOT NULL,
  entity_id UUID,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  integrity_hmac VARCHAR(64) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

