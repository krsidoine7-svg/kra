import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { and, desc, eq, isNotNull } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { articles, folders, projects } from "@/lib/db/schema";
import { recordSecurityAuditLog } from "@/lib/security/audit";
import { withAdminAuth } from "@/lib/security/with-admin-auth";

const TrashActionSchema = z.object({
  entityType: z.enum(["project", "folder", "article"]),
  id: z.string().uuid("Identifiant invalide."),
});

export const GET = withAdminAuth(async () => {
  const db = getDb();
  const [deletedProjects, deletedFolders, deletedArticles] = await Promise.all([
    db
      .select({
        id: projects.id,
        title: projects.title,
        slug: projects.slug,
        deletedAt: projects.deletedAt,
      })
      .from(projects)
      .where(isNotNull(projects.deletedAt))
      .orderBy(desc(projects.deletedAt)),
    db
      .select({
        id: folders.id,
        name: folders.name,
        slug: folders.slug,
        deletedAt: folders.deletedAt,
      })
      .from(folders)
      .where(isNotNull(folders.deletedAt))
      .orderBy(desc(folders.deletedAt)),
    db
      .select({
        id: articles.id,
        title: articles.title,
        slug: articles.slug,
        deletedAt: articles.deletedAt,
      })
      .from(articles)
      .where(isNotNull(articles.deletedAt))
      .orderBy(desc(articles.deletedAt)),
  ]);

  return NextResponse.json({
    items: [
      ...deletedProjects.map((p) => ({
        id: p.id,
        entityType: "project" as const,
        label: p.title,
        slug: p.slug,
        deletedAt: p.deletedAt ? p.deletedAt.toISOString() : "",
      })),
      ...deletedFolders.map((f) => ({
        id: f.id,
        entityType: "folder" as const,
        label: f.name,
        slug: f.slug,
        deletedAt: f.deletedAt ? f.deletedAt.toISOString() : "",
      })),
      ...deletedArticles.map((a) => ({
        id: a.id,
        entityType: "article" as const,
        label: a.title,
        slug: a.slug,
        deletedAt: a.deletedAt ? a.deletedAt.toISOString() : "",
      })),
    ],
  });
});

export const POST = withAdminAuth(async (request, session) => {
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide." }, { status: 400 });
  }

  const parsed = TrashActionSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Paramètres invalides." },
      { status: 400 }
    );
  }

  const db = getDb();
  const { entityType, id } = parsed.data;
  let restoredId: string | null = null;

  if (entityType === "project") {
    const [row] = await db
      .update(projects)
      .set({
        deletedAt: null,
        isFeaturedHome: false,
        featuredOrder: null,
        updatedAt: new Date(),
      })
      .where(and(eq(projects.id, id), isNotNull(projects.deletedAt)))
      .returning({ id: projects.id, slug: projects.slug });
    if (row) {
      restoredId = row.id;
      revalidatePath(`/projets/${row.slug}`);
    }
  } else if (entityType === "folder") {
    const [row] = await db
      .update(folders)
      .set({ deletedAt: null, updatedAt: new Date() })
      .where(and(eq(folders.id, id), isNotNull(folders.deletedAt)))
      .returning({ id: folders.id });
    if (row) restoredId = row.id;
  } else {
    const [row] = await db
      .update(articles)
      .set({ deletedAt: null, updatedAt: new Date() })
      .where(and(eq(articles.id, id), isNotNull(articles.deletedAt)))
      .returning({ id: articles.id, slug: articles.slug });
    if (row) {
      restoredId = row.id;
      revalidatePath(`/articles/${row.slug}`);
    }
  }

  if (!restoredId) {
    return NextResponse.json(
      { error: "Élément introuvable dans la corbeille." },
      { status: 404 }
    );
  }

  await recordSecurityAuditLog({
    adminId: session.adminId,
    action: "trash_restored",
    entityType,
    entityId: restoredId,
  });

  revalidatePath("/");
  revalidatePath("/projets");
  revalidatePath("/articles");
  return NextResponse.json({ ok: true, id: restoredId, entityType });
});

export const DELETE = withAdminAuth(async (request, session) => {
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide." }, { status: 400 });
  }

  const parsed = TrashActionSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Paramètres invalides." },
      { status: 400 }
    );
  }

  const db = getDb();
  const { entityType, id } = parsed.data;
  let purgedId: string | null = null;

  if (entityType === "project") {
    const [row] = await db
      .delete(projects)
      .where(and(eq(projects.id, id), isNotNull(projects.deletedAt)))
      .returning({ id: projects.id });
    if (row) purgedId = row.id;
  } else if (entityType === "folder") {
    const [row] = await db
      .delete(folders)
      .where(and(eq(folders.id, id), isNotNull(folders.deletedAt)))
      .returning({ id: folders.id });
    if (row) purgedId = row.id;
  } else {
    const [row] = await db
      .delete(articles)
      .where(and(eq(articles.id, id), isNotNull(articles.deletedAt)))
      .returning({ id: articles.id });
    if (row) purgedId = row.id;
  }

  if (!purgedId) {
    return NextResponse.json(
      { error: "Élément introuvable dans la corbeille." },
      { status: 404 }
    );
  }

  await recordSecurityAuditLog({
    adminId: session.adminId,
    action: "trash_purged",
    entityType,
    entityId: purgedId,
  });

  revalidatePath("/");
  revalidatePath("/projets");
  revalidatePath("/articles");
  return NextResponse.json({ ok: true, purged: true, id: purgedId });
});

