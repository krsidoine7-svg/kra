import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { skills } from "@/lib/db/schema";
import { withAdminAuth } from "@/lib/security/with-admin-auth";
import { SkillCreateSchema } from "@/lib/validators/cms";

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

    const parsed = SkillCreateSchema.partial().safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Données invalides." },
        { status: 400 }
      );
    }

    const db = getDb();
    const [updated] = await db
      .update(skills)
      .set(parsed.data)
      .where(eq(skills.id, id))
      .returning({ id: skills.id });

    if (!updated) {
      return NextResponse.json(
        { error: "Compétence introuvable." },
        { status: 404 }
      );
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
      .update(skills)
      .set({ deletedAt: new Date() })
      .where(eq(skills.id, id))
      .returning({ id: skills.id });

    if (!deleted) {
      return NextResponse.json(
        { error: "Compétence introuvable." },
        { status: 404 }
      );
    }

    revalidatePath("/");
    return NextResponse.json({ ok: true });
  }
);

