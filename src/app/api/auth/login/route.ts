import { NextResponse, type NextRequest } from "next/server";
import { and, eq, isNull } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { adminProfiles } from "@/lib/db/schema";
import { LoginRequestSchema } from "@/lib/validators/auth";
import {
  hashIpAddress,
  verifyPassword,
} from "@/lib/security/crypto";
import { loginRateLimiter } from "@/lib/security/rate-limit";
import {
  buildSessionCookieConfig,
  createAdminSession,
} from "@/lib/security/session";

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

function extractClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? "unknown";
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(request: NextRequest) {
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Corps de requête JSON invalide." },
      { status: 400 }
    );
  }

  const parsed = LoginRequestSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Identifiants malformés." },
      { status: 400 }
    );
  }

  const clientIp = extractClientIp(request);
  const ipHash = hashIpAddress(clientIp);
  const rateCheck = loginRateLimiter.consume(ipHash);

  if (!rateCheck.allowed) {
    return NextResponse.json(
      {
        error: "Trop de tentatives. Réessayez plus tard.",
        retryAfterSeconds: rateCheck.retryAfterSeconds,
      },
      {
        status: 429,
        headers: { "Retry-After": String(rateCheck.retryAfterSeconds) },
      }
    );
  }

  const db = getDb();
  const normalizedEmail = parsed.data.email.toLowerCase();
  const [admin] = await db
    .select({
      id: adminProfiles.id,
      firstName: adminProfiles.firstName,
      lastName: adminProfiles.lastName,
      email: adminProfiles.email,
      passwordHash: adminProfiles.passwordHash,
      failedLoginAttempts: adminProfiles.failedLoginAttempts,
      lockedUntil: adminProfiles.lockedUntil,
    })
    .from(adminProfiles)
    .where(
      and(
        eq(adminProfiles.email, normalizedEmail),
        isNull(adminProfiles.deletedAt)
      )
    )
    .limit(1);

  if (admin?.lockedUntil && admin.lockedUntil > new Date()) {
    await verifyPassword(parsed.data.password, null);
    return NextResponse.json(
      { error: "Compte temporairement verrouillé. Réessayez plus tard." },
      { status: 429 }
    );
  }

  const isValid = await verifyPassword(
    parsed.data.password,
    admin?.passwordHash ?? null
  );

  if (!admin || !isValid) {
    if (admin) {
      const nextAttempts = admin.failedLoginAttempts + 1;
      const lockedUntil =
        nextAttempts >= MAX_FAILED_ATTEMPTS
          ? new Date(Date.now() + LOCKOUT_MS)
          : null;
      await db
        .update(adminProfiles)
        .set({
          failedLoginAttempts: nextAttempts,
          lockedUntil,
          updatedAt: new Date(),
        })
        .where(eq(adminProfiles.id, admin.id));
    }

    return NextResponse.json(
      { error: "Identifiants invalides." },
      { status: 401 }
    );
  }

  loginRateLimiter.reset(ipHash);
  await db
    .update(adminProfiles)
    .set({
      failedLoginAttempts: 0,
      lockedUntil: null,
      updatedAt: new Date(),
    })
    .where(eq(adminProfiles.id, admin.id));

  const userAgent = request.headers.get("user-agent") ?? "unknown";
  const { rawToken, expiresAt } = await createAdminSession({
    adminId: admin.id,
    ipAddress: clientIp,
    userAgent,
  });

  const response = NextResponse.json({
    ok: true,
    admin: {
      id: admin.id,
      firstName: admin.firstName,
      lastName: admin.lastName,
      email: admin.email,
    },
  });

  response.cookies.set(
    buildSessionCookieConfig(expiresAt).name,
    rawToken,
    buildSessionCookieConfig(expiresAt)
  );
  return response;
}

