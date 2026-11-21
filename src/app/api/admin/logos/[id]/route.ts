import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { logos } from "@/lib/db/schema";
import { withAdminAuth } from "@/lib/security/with-admin-auth";
import { LogoCreateSchema } from "@/lib/validators/cms";

type RouteContext = { params: Promise<{ id: string }> };

export const PATCH = withAdminAuth<RouteContext>(
  async (request, _session, context) => {
    const { id } = await context.params;
    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json({ error: "JSON invalide." }, { status: 400 });
    }

    const parsed = LogoCreateSchema.partial().safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Données invalides." },
        { status: 400 }
      );
    }

    const db = getDb();
    const [updated] = await db
      .update(logos)
      .set({
        ...(parsed.data.name !== undefined ? { name: parsed.data.name } : {}),
        ...(parsed.data.category !== undefined
          ? { category: parsed.data.category }
          : {}),
        ...(parsed.data.objectKey !== undefined
          ? { objectKey: parsed.data.objectKey }
          : {}),
        ...(parsed.data.websiteUrl !== undefined
          ? { websiteUrl: parsed.data.websiteUrl || null }
          : {}),
        ...(parsed.data.displayOrder !== undefined
          ? { displayOrder: parsed.data.displayOrder }
          : {}),
        ...(parsed.data.isVisible !== undefined
          ? { isVisible: parsed.data.isVisible }
          : {}),
      })
      .where(eq(logos.id, id))
      .returning({ id: logos.id });

    if (!updated) {
      return NextResponse.json({ error: "Logo introuvable." }, { status: 404 });
    }

    revalidatePath("/");
    return NextResponse.json({ ok: true });
  }
);

export const DELETE = withAdminAuth<RouteContext>(
  async (_request, _session, context) => {
    const { id } = await context.params;
    const db = getDb();
    const [deleted] = await db
      .update(logos)
      .set({ deletedAt: new Date() })
      .where(eq(logos.id, id))
      .returning({ id: logos.id });

    if (!deleted) {
      return NextResponse.json({ error: "Logo introuvable." }, { status: 404 });
    }

    revalidatePath("/");
    return NextResponse.json({ ok: true });
  }
);

