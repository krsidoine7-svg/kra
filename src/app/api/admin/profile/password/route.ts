import { NextResponse } from "next/server";
import { and, eq, isNull, ne } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { adminProfiles, adminSessions } from "@/lib/db/schema";
import { recordSecurityAuditLog } from "@/lib/security/audit";
import { hashPassword, verifyPassword } from "@/lib/security/crypto";
import { withAdminAuth } from "@/lib/security/with-admin-auth";
import { PasswordChangeSchema } from "@/lib/validators/profile";

export const PATCH = withAdminAuth(async (request, session) => {
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide." }, { status: 400 });
  }

  const parsed = PasswordChangeSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: parsed.error.issues[0]?.message ?? "Données invalides.",
      },
      { status: 400 }
    );
  }

  const db = getDb();
  const [admin] = await db
    .select({
      id: adminProfiles.id,
      passwordHash: adminProfiles.passwordHash,
    })
    .from(adminProfiles)
    .where(
      and(
        eq(adminProfiles.id, session.adminId),
        isNull(adminProfiles.deletedAt)
      )
    )
    .limit(1);

  if (!admin) {
    return NextResponse.json({ error: "Compte introuvable." }, { status: 404 });
  }

  const isCurrentValid = await verifyPassword(
    parsed.data.currentPassword,
    admin.passwordHash
  );
  if (!isCurrentValid) {
    return NextResponse.json(
      { error: "Le mot de passe actuel est incorrect." },
      { status: 401 }
    );
  }

  const nextHash = await hashPassword(parsed.data.newPassword);
  await db
    .update(adminProfiles)
    .set({
      passwordHash: nextHash,
      updatedAt: new Date(),
    })
    .where(eq(adminProfiles.id, session.adminId));

  // Révoque toutes les autres sessions actives par sécurité
  await db
    .delete(adminSessions)
    .where(
      and(
        eq(adminSessions.adminId, session.adminId),
        ne(adminSessions.id, session.sessionId)
      )
    );

  await recordSecurityAuditLog({
    adminId: session.adminId,
    action: "password_changed",
    entityType: "admin_profile",
    entityId: session.adminId,
  });

  return NextResponse.json({ ok: true });
});

