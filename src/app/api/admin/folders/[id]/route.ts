import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { folders } from "@/lib/db/schema";
import { recordSecurityAuditLog } from "@/lib/security/audit";
import { withAdminAuth } from "@/lib/security/with-admin-auth";
import { FolderCreateSchema } from "@/lib/validators/project";

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

    const parsed = FolderCreateSchema.partial().safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Données invalides." },
        { status: 400 }
      );
    }

    const db = getDb();
    const [updated] = await db
      .update(folders)
      .set({
        ...parsed.data,
        updatedAt: new Date(),
      })
      .where(eq(folders.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { error: "Dossier introuvable." },
        { status: 404 }
      );
    }

    revalidatePath("/");
    revalidatePath("/projets");
    return NextResponse.json({ ok: true, item: updated });
  }
);

export const DELETE = withAdminAuth<RouteContext>(
  async (request, session, context) => {
    const { id } = await context.params;
    const hard = new URL(request.url).searchParams.get("hard") === "true";
    const db = getDb();

    if (hard) {
      const [purged] = await db
        .delete(folders)
        .where(eq(folders.id, id))
        .returning({ id: folders.id });

      if (!purged) {
        return NextResponse.json(
          { error: "Dossier introuvable." },
          { status: 404 }
        );
      }

      await recordSecurityAuditLog({
        adminId: session.adminId,
        action: "folder_purged",
        entityType: "folder",
        entityId: purged.id,
      });

      revalidatePath("/");
      revalidatePath("/projets");
      return NextResponse.json({ ok: true, purged: true });
    }

    const [deleted] = await db
      .update(folders)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(folders.id, id))
      .returning({ id: folders.id });

    if (!deleted) {
      return NextResponse.json(
        { error: "Dossier introuvable." },
        { status: 404 }
      );
    }

    await recordSecurityAuditLog({
      adminId: session.adminId,
      action: "folder_soft_deleted",
      entityType: "folder",
      entityId: deleted.id,
    });

    revalidatePath("/");
    revalidatePath("/projets");
    return NextResponse.json({ ok: true });
  }
);

