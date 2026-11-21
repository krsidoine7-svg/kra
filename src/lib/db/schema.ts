import {
  bigint,
  boolean,
  check,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const projectStatusEnum = pgEnum("project_status", [
  "draft",
  "upcoming",
  "published",
  "archived",
]);

export const mediaTypeEnum = pgEnum("media_type", ["image", "video"]);

export const articleStatusEnum = pgEnum("article_status", [
  "draft",
  "published",
  "archived",
]);

export const moderationStatusEnum = pgEnum("moderation_status", [
  "pending",
  "approved",
  "rejected",
]);

export const searchTargetEnum = pgEnum("search_target", [
  "projects",
  "articles",
]);

export const analyticsEventTypeEnum = pgEnum("analytics_event_type", [
  "page_view",
  "project_view",
  "project_share",
  "link_copy",
  "article_view",
]);

export const adminProfiles = pgTable("admin_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  firstName: varchar("first_name", { length: 80 }).notNull().default("Manu"),
  lastName: varchar("last_name", { length: 80 }).notNull().default("KRA"),
  email: varchar("email", { length: 255 }).notNull().unique(),
  phoneEncrypted: text("phone_encrypted"),
  recoveryEmailEncrypted: text("recovery_email_encrypted"),
  passwordHash: text("password_hash").notNull(),
  failedLoginAttempts: integer("failed_login_attempts").notNull().default(0),
  lockedUntil: timestamp("locked_until", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const adminSessions = pgTable(
  "admin_sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    adminId: uuid("admin_id")
      .notNull()
      .references(() => adminProfiles.id, { onDelete: "cascade" }),
    tokenSha256: varchar("token_sha256", { length: 64 }).notNull().unique(),
    ipHashSha256: varchar("ip_hash_sha256", { length: 64 }).notNull(),
    userAgentHash: varchar("user_agent_hash", { length: 64 }).notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_sessions_admin").on(table.adminId),
    index("idx_sessions_expires").on(table.expiresAt),
  ]
);

export const folders = pgTable(
  "folders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 120 }).notNull(),
    slug: varchar("slug", { length: 140 }).notNull().unique(),
    description: text("description"),
    displayOrder: integer("display_order").notNull().default(0),
    isVisiblePublic: boolean("is_visible_public").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    index("idx_folders_public")
      .on(table.displayOrder)
      .where(sql`${table.deletedAt} IS NULL AND ${table.isVisiblePublic} = true`),
  ]
);

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    folderId: uuid("folder_id").references(() => folders.id, {
      onDelete: "set null",
    }),
    title: varchar("title", { length: 180 }).notNull(),
    slug: varchar("slug", { length: 200 }).notNull().unique(),
    status: projectStatusEnum("status").notNull().default("draft"),
    summary: text("summary").notNull(),
    contentBlocks: jsonb("content_blocks")
      .$type<Record<string, unknown>[]>()
      .notNull()
      .default([]),
    externalUrl: text("external_url"),
    year: smallint("year"),
    clientOrContext: varchar("client_or_context", { length: 160 }),
    tags: text("tags")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    isFeaturedHome: boolean("is_featured_home").notNull().default(false),
    featuredOrder: smallint("featured_order"),
    locationCity: varchar("location_city", { length: 100 }),
    locationCountry: varchar("location_country", { length: 100 }),
    latitude: doublePrecision("latitude"),
    longitude: doublePrecision("longitude"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    check(
      "chk_featured_order",
      sql`${table.featuredOrder} IS NULL OR (${table.featuredOrder} >= 1 AND ${table.featuredOrder} <= 3)`
    ),
    index("idx_projects_home")
      .on(table.featuredOrder)
      .where(
        sql`${table.isFeaturedHome} = true AND ${table.deletedAt} IS NULL AND ${table.status} IN ('published', 'upcoming')`
      ),
    index("idx_projects_folder")
      .on(table.folderId)
      .where(sql`${table.deletedAt} IS NULL`),
  ]
);

export const projectMedia = pgTable(
  "project_media",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    mediaType: mediaTypeEnum("media_type").notNull(),
    objectKey: text("object_key").notNull(),
    posterKey: text("poster_key"),
    lqipBase64: text("lqip_base64"),
    altText: varchar("alt_text", { length: 255 }).notNull().default(""),
    mimeType: varchar("mime_type", { length: 100 }).notNull(),
    width: integer("width"),
    height: integer("height"),
    durationSeconds: integer("duration_seconds"),
    sizeBytes: bigint("size_bytes", { mode: "number" }).notNull(),
    sha256Hash: varchar("sha256_hash", { length: 64 }).notNull(),
    isCover: boolean("is_cover").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    index("idx_project_media_project")
      .on(table.projectId, table.sortOrder)
      .where(sql`${table.deletedAt} IS NULL`),
  ]
);

export const cmsSections = pgTable(
  "cms_sections",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    sectionKey: varchar("section_key", { length: 80 }).notNull(),
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
    checksumSha256: varchar("checksum_sha256", { length: 64 }).notNull(),
    updatedBy: uuid("updated_by").references(() => adminProfiles.id, {
      onDelete: "set null",
    }),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [uniqueIndex("uq_cms_section_key").on(table.sectionKey)]
);

export const logos = pgTable("logos", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  category: varchar("category", { length: 40 }).notNull().default("partner"),
  objectKey: text("object_key").notNull(),
  websiteUrl: text("website_url"),
  displayOrder: integer("display_order").notNull().default(0),
  isVisible: boolean("is_visible").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const skills = pgTable("skills", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 120 }).notNull(),
  description: varchar("description", { length: 280 }).notNull(),
  displayOrder: integer("display_order").notNull().default(0),
  isVisible: boolean("is_visible").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export type ArticleBlockSchemaRecord =
  | {
      id: string;
      type: "heading";
      level: 1 | 2 | 3 | 4;
      text: string;
    }
  | {
      id: string;
      type: "paragraph";
      text: string;
      link?: {
        label: string;
        url: string;
      };
    }
  | {
      id: string;
      type: "bullet_list";
      items: string[];
    }
  | {
      id: string;
      type: "dash_list";
      items: string[];
    }
  | {
      id: string;
      type: "quote";
      text: string;
      author?: string;
    }
  | {
      id: string;
      type: "signature";
      name: string;
      role: string;
      city: string;
      date: string;
    };

export const articles = pgTable(
  "articles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: varchar("title", { length: 200 }).notNull(),
    slug: varchar("slug", { length: 220 }).notNull().unique(),
    excerpt: text("excerpt").notNull(),
    status: articleStatusEnum("status").notNull().default("draft"),
    blocks: jsonb("blocks")
      .$type<ArticleBlockSchemaRecord[]>()
      .notNull()
      .default([]),
    tags: text("tags")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    readingMinutes: smallint("reading_minutes").notNull().default(3),
    coverObjectKey: text("cover_object_key"),
    coverLqip: text("cover_lqip"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    index("idx_articles_pub")
      .on(table.publishedAt)
      .where(sql`${table.deletedAt} IS NULL AND ${table.status} = 'published'`),
  ]
);

export const articleComments = pgTable(
  "article_comments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    articleId: uuid("article_id")
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),
    authorName: varchar("author_name", { length: 80 }).notNull(),
    authorEmailEncrypted: text("author_email_encrypted"),
    bodySanitized: text("body_sanitized").notNull(),
    ipHashSha256: varchar("ip_hash_sha256", { length: 64 }).notNull(),
    moderationStatus: moderationStatusEnum("moderation_status")
      .notNull()
      .default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    index("idx_comments_article")
      .on(table.articleId, table.createdAt)
      .where(
        sql`${table.deletedAt} IS NULL AND ${table.moderationStatus} = 'approved'`
      ),
  ]
);

export const analyticsEvents = pgTable(
  "analytics_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    eventType: analyticsEventTypeEnum("event_type").notNull(),
    targetId: uuid("target_id"),
    targetSlug: varchar("target_slug", { length: 220 }),
    sessionHashSha256: varchar("session_hash_sha256", { length: 64 }).notNull(),
    deviceType: varchar("device_type", { length: 20 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_analytics_type_date").on(table.eventType, table.createdAt),
  ]
);

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  adminId: uuid("admin_id").references(() => adminProfiles.id, {
    onDelete: "set null",
  }),
  action: varchar("action", { length: 80 }).notNull(),
  entityType: varchar("entity_type", { length: 60 }).notNull(),
  entityId: uuid("entity_id"),
  metadata: jsonb("metadata")
    .$type<Record<string, unknown>>()
    .notNull()
    .default({}),
  integrityHmac: varchar("integrity_hmac", { length: 64 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

