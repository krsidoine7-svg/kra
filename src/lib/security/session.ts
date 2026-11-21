import { cookies } from "next/headers";
import { and, eq, gt, isNull } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { adminProfiles, adminSessions } from "@/lib/db/schema";
import {
  generateOpaqueToken,
  hashIpAddress,
  sha256Hex,
} from "@/lib/security/crypto";
import { SESSION_COOKIE_NAME } from "@/lib/security/constants";

export { SESSION_COOKIE_NAME };
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

export interface AdminSessionUser {
  sessionId: string;
  adminId: string;
  firstName: string;
  lastName: string;
  email: string;
}

export class UnauthorizedError extends Error {
  readonly statusCode = 401;
  constructor(message = "Session administrateur requise.") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export function buildSessionCookieConfig(expiresAt: Date) {
  return {
    name: SESSION_COOKIE_NAME,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
    expires: expiresAt,
  };
}

export async function createAdminSession(params: {
  adminId: string;
  ipAddress: string;
  userAgent: string;
}): Promise<{ rawToken: string; expiresAt: Date }> {
  const db = getDb();
  const rawToken = generateOpaqueToken();
  const tokenSha256 = sha256Hex(rawToken);
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await db.insert(adminSessions).values({
    adminId: params.adminId,
    tokenSha256,
    ipHashSha256: hashIpAddress(params.ipAddress),
    userAgentHash: sha256Hex(params.userAgent),
    expiresAt,
  });

  return { rawToken, expiresAt };
}

export async function verifyAdminSessionByToken(
  rawToken: string | undefined
): Promise<AdminSessionUser | null> {
  if (!rawToken || rawToken.length < 32) {
    return null;
  }

  const db = getDb();
  const tokenHash = sha256Hex(rawToken);
  const now = new Date();

  const rows = await db
    .select({
      sessionId: adminSessions.id,
      adminId: adminProfiles.id,
      firstName: adminProfiles.firstName,
      lastName: adminProfiles.lastName,
      email: adminProfiles.email,
    })
    .from(adminSessions)
    .innerJoin(adminProfiles, eq(adminSessions.adminId, adminProfiles.id))
    .where(
      and(
        eq(adminSessions.tokenSha256, tokenHash),
        gt(adminSessions.expiresAt, now),
        isNull(adminProfiles.deletedAt)
      )
    )
    .limit(1);

  return rows[0] ?? null;
}

export async function getCurrentAdminSession(): Promise<AdminSessionUser | null> {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  return verifyAdminSessionByToken(rawToken);
}

export async function requireAdminSession(): Promise<AdminSessionUser> {
  const session = await getCurrentAdminSession();
  if (!session) {
    throw new UnauthorizedError();
  }
  return session;
}

export async function revokeSessionByToken(rawToken: string): Promise<void> {
  if (!rawToken) return;
  const db = getDb();
  await db
    .delete(adminSessions)
    .where(eq(adminSessions.tokenSha256, sha256Hex(rawToken)));
}

export async function revokeAllAdminSessions(adminId: string): Promise<void> {
  const db = getDb();
  await db.delete(adminSessions).where(eq(adminSessions.adminId, adminId));
}

