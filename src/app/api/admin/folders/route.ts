import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { and, asc, eq, isNull, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { folders, projects } from "@/lib/db/schema";
import { withAdminAuth } from "@/lib/security/with-admin-auth";
import { FolderCreateSchema } from "@/lib/validators/project";

export const GET = withAdminAuth(async () => {
  const db = getDb();
  const rows = await db
    .select({
      id: folders.id,
      name: folders.name,
      slug: folders.slug,
      description: folders.description,
      displayOrder: folders.displayOrder,
      isVisiblePublic: folders.isVisiblePublic,
      projectCount: sql<number>`count(${projects.id})::int`,
    })
    .from(folders)
    .leftJoin(
      projects,
      and(eq(projects.folderId, folders.id), isNull(projects.deletedAt))
    )
    .where(isNull(folders.deletedAt))
    .groupBy(folders.id)
    .orderBy(asc(folders.displayOrder));

  return NextResponse.json({ items: rows });
});

export const POST = withAdminAuth(async (request) => {
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide." }, { status: 400 });
  }

  const parsed = FolderCreateSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Données invalides." },
      { status: 400 }
    );
  }

  const db = getDb();
  const [created] = await db
    .insert(folders)
    .values({
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description ?? null,
      displayOrder: parsed.data.displayOrder,
      isVisiblePublic: parsed.data.isVisiblePublic,
    })
    .returning();

  revalidatePath("/");
  revalidatePath("/projets");
  return NextResponse.json({ ok: true, item: created }, { status: 201 });
});

