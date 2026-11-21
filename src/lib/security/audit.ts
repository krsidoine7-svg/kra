import { getDb } from "@/lib/db";
import { auditLogs } from "@/lib/db/schema";
import { hmacSha256Hex } from "@/lib/security/crypto";

export interface AuditEntryInput {
  adminId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
}

/**
 * Construit un payload canonique et signe son intégrité via HMAC-SHA256.
 */
export function buildSignedAuditPayload(input: AuditEntryInput): {
  canonical: string;
  integrityHmac: string;
  metadata: Record<string, unknown>;
} {
  const metadata = input.metadata ?? {};
  const sortedKeys = Object.keys(metadata).sort();
  const orderedMeta: Record<string, unknown> = {};
  for (const key of sortedKeys) {
    orderedMeta[key] = metadata[key];
  }

  const canonical = JSON.stringify({
    adminId: input.adminId ?? null,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId ?? null,
    metadata: orderedMeta,
  });

  return {
    canonical,
    integrityHmac: hmacSha256Hex(canonical),
    metadata: orderedMeta,
  };
}

export function verifyAuditSignature(
  input: AuditEntryInput,
  storedHmac: string,
  secret?: string
): boolean {
  const metadata = input.metadata ?? {};
  const sortedKeys = Object.keys(metadata).sort();
  const orderedMeta: Record<string, unknown> = {};
  for (const key of sortedKeys) {
    orderedMeta[key] = metadata[key];
  }

  const canonical = JSON.stringify({
    adminId: input.adminId ?? null,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId ?? null,
    metadata: orderedMeta,
  });

  const expected = hmacSha256Hex(canonical, secret);
  if (expected.length !== storedHmac.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ storedHmac.charCodeAt(i);
  }
  return diff === 0;
}

export async function recordSecurityAuditLog(
  input: AuditEntryInput
): Promise<void> {
  if (!process.env.DATABASE_URL) {
    return;
  }

  try {
    const db = getDb();
    const signed = buildSignedAuditPayload(input);
    await db.insert(auditLogs).values({
      adminId: input.adminId ?? null,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId ?? null,
      metadata: signed.metadata,
      integrityHmac: signed.integrityHmac,
    });
  } catch (error) {
    console.error("[Security Audit] Échec d'enregistrement:", error);
  }
}

