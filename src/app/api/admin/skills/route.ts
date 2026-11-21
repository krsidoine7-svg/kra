import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { asc, isNull } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { skills } from "@/lib/db/schema";
import { withAdminAuth } from "@/lib/security/with-admin-auth";
import { SkillCreateSchema } from "@/lib/validators/cms";

export const GET = withAdminAuth(async () => {
  const db = getDb();
  const rows = await db
    .select({
      id: skills.id,
      title: skills.title,
      description: skills.description,
      displayOrder: skills.displayOrder,
      isVisible: skills.isVisible,
    })
    .from(skills)
    .where(isNull(skills.deletedAt))
    .orderBy(asc(skills.displayOrder));

  return NextResponse.json({ items: rows });
});

export const POST = withAdminAuth(async (request) => {
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide." }, { status: 400 });
  }

  const parsed = SkillCreateSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Données invalides." },
      { status: 400 }
    );
  }

  const db = getDb();
  const [created] = await db
    .insert(skills)
    .values(parsed.data)
    .returning({
      id: skills.id,
      title: skills.title,
      description: skills.description,
      displayOrder: skills.displayOrder,
      isVisible: skills.isVisible,
    });

  revalidatePath("/");
  return NextResponse.json({ ok: true, item: created }, { status: 201 });
});

