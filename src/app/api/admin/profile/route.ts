import { NextResponse } from "next/server";
import { and, eq, isNull } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { adminProfiles, adminSessions } from "@/lib/db/schema";
import { decryptAES256GCM, encryptAES256GCM } from "@/lib/security/aes";
import { recordSecurityAuditLog } from "@/lib/security/audit";
import { getAdminLoginPath } from "@/lib/security/admin-path";
import { SESSION_COOKIE_NAME } from "@/lib/security/constants";
import { verifyPassword } from "@/lib/security/crypto";
import { withAdminAuth } from "@/lib/security/with-admin-auth";
import {
  DeleteAccountSchema,
  ProfileUpdateSchema,
} from "@/lib/validators/profile";

function safeDecrypt(cipherText: string | null): string {
  if (!cipherText) return "";
  try {
    return decryptAES256GCM(cipherText);
  } catch {
    return "";
  }
}

export const GET = withAdminAuth(async (_request, session) => {
  const db = getDb();
  const [profile] = await db
    .select({
      id: adminProfiles.id,
      firstName: adminProfiles.firstName,
      lastName: adminProfiles.lastName,
      email: adminProfiles.email,
      phoneEncrypted: adminProfiles.phoneEncrypted,
      recoveryEmailEncrypted: adminProfiles.recoveryEmailEncrypted,
    })
    .from(adminProfiles)
    .where(
      and(
        eq(adminProfiles.id, session.adminId),
        isNull(adminProfiles.deletedAt)
      )
    )
    .limit(1);

  if (!profile) {
    return NextResponse.json({ error: "Profil introuvable." }, { status: 404 });
  }

  return NextResponse.json({
    id: profile.id,
    firstName: profile.firstName,
    lastName: profile.lastName,
    email: profile.email,
    phone: safeDecrypt(profile.phoneEncrypted),
    recoveryEmail: safeDecrypt(profile.recoveryEmailEncrypted),
  });
});

export const PATCH = withAdminAuth(async (request, session) => {
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide." }, { status: 400 });
  }

  const parsed = ProfileUpdateSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: parsed.error.issues[0]?.message ?? "Données invalides.",
      },
      { status: 400 }
    );
  }

  const db = getDb();
  const phoneEncrypted = parsed.data.phone
    ? encryptAES256GCM(parsed.data.phone)
    : null;
  const recoveryEmailEncrypted = parsed.data.recoveryEmail
    ? encryptAES256GCM(parsed.data.recoveryEmail.toLowerCase())
    : null;

  await db
    .update(adminProfiles)
    .set({
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      email: parsed.data.email.toLowerCase(),
      phoneEncrypted,
      recoveryEmailEncrypted,
      updatedAt: new Date(),
    })
    .where(eq(adminProfiles.id, session.adminId));

  await recordSecurityAuditLog({
    adminId: session.adminId,
    action: "profile_updated",
    entityType: "admin_profile",
    entityId: session.adminId,
    metadata: {
      hasPhone: Boolean(parsed.data.phone),
      hasRecoveryEmail: Boolean(parsed.data.recoveryEmail),
    },
  });

  return NextResponse.json({
    ok: true,
    profile: {
      id: session.adminId,
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      email: parsed.data.email.toLowerCase(),
      phone: parsed.data.phone,
      recoveryEmail: parsed.data.recoveryEmail,
    },
  });
});

export const DELETE = withAdminAuth(async (request, session) => {
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide." }, { status: 400 });
  }

  const parsed = DeleteAccountSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Confirmation invalide." },
      { status: 400 }
    );
  }

  const db = getDb();
  const [admin] = await db
    .select({
      id: adminProfiles.id,
      email: adminProfiles.email,
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
    return NextResponse.json({ error: "Profil introuvable." }, { status: 404 });
  }

  const validPassword = await verifyPassword(
    parsed.data.currentPassword,
    admin.passwordHash
  );

  if (!validPassword) {
    await recordSecurityAuditLog({
      adminId: session.adminId,
      action: "account_delete_denied",
      entityType: "admin_profile",
      entityId: session.adminId,
      metadata: { reason: "invalid_password" },
    });
    return NextResponse.json(
      { error: "Mot de passe actuel incorrect." },
      { status: 401 }
    );
  }

  await recordSecurityAuditLog({
    adminId: session.adminId,
    action: "admin_account_deleted",
    entityType: "admin_profile",
    entityId: session.adminId,
    metadata: { mode: parsed.data.mode },
  });

  await db
    .delete(adminSessions)
    .where(eq(adminSessions.adminId, session.adminId));

  if (parsed.data.mode === "purge") {
    await db.delete(adminProfiles).where(eq(adminProfiles.id, session.adminId));
  } else {
    await db
      .update(adminProfiles)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(adminProfiles.id, session.adminId));
  }

  const response = NextResponse.json({
    ok: true,
    mode: parsed.data.mode,
    redirectTo: getAdminLoginPath(),
  });

  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });

  return response;
});

