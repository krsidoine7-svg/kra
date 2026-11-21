import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { asc, isNull } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { logos } from "@/lib/db/schema";
import { withAdminAuth } from "@/lib/security/with-admin-auth";
import { LogoCreateSchema } from "@/lib/validators/cms";

export const GET = withAdminAuth(async () => {
  const db = getDb();
  const rows = await db
    .select({
      id: logos.id,
      name: logos.name,
      category: logos.category,
      objectKey: logos.objectKey,
      websiteUrl: logos.websiteUrl,
      displayOrder: logos.displayOrder,
      isVisible: logos.isVisible,
    })
    .from(logos)
    .where(isNull(logos.deletedAt))
    .orderBy(asc(logos.displayOrder));

  return NextResponse.json({ items: rows });
});

export const POST = withAdminAuth(async (request) => {
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide." }, { status: 400 });
  }

  const parsed = LogoCreateSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Données invalides." },
      { status: 400 }
    );
  }

  const db = getDb();
  const [created] = await db
    .insert(logos)
    .values({
      name: parsed.data.name,
      category: parsed.data.category,
      objectKey: parsed.data.objectKey,
      websiteUrl: parsed.data.websiteUrl || null,
      displayOrder: parsed.data.displayOrder,
      isVisible: parsed.data.isVisible,
    })
    .returning({
      id: logos.id,
      name: logos.name,
      category: logos.category,
      objectKey: logos.objectKey,
      websiteUrl: logos.websiteUrl,
      displayOrder: logos.displayOrder,
      isVisible: logos.isVisible,
    });

  revalidatePath("/");
  return NextResponse.json({ ok: true, item: created }, { status: 201 });
});

