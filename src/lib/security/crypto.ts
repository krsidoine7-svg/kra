import { createHash, createHmac, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";

const BCRYPT_COST = 12;

// Hash factice valide pour neutraliser les attaques par analyse temporelle
const DUMMY_BCRYPT_HASH =
  "$2b$12$CwTycUXWue0Thq9StjUM0uJ8u1uC2zZ1r/xI3nZ6L0sP2X6a2S8G.";

export async function hashPassword(plainPassword: string): Promise<string> {
  return bcrypt.hash(plainPassword, BCRYPT_COST);
}

export async function verifyPassword(
  plainPassword: string,
  storedHash: string | null
): Promise<boolean> {
  const targetHash = storedHash ?? DUMMY_BCRYPT_HASH;
  const matched = await bcrypt.compare(plainPassword, targetHash);
  return storedHash !== null && matched;
}

export function sha256Hex(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

export function hmacSha256Hex(value: string, secret?: string): string {
  const key =
    secret ?? process.env.SESSION_HMAC_SECRET ?? "dev-only-insecure-fallback";
  return createHmac("sha256", key).update(value, "utf8").digest("hex");
}

export function generateOpaqueToken(): string {
  return randomBytes(32).toString("hex");
}

export function hashIpAddress(rawIp: string): string {
  const salt = process.env.IP_HASH_SALT ?? "manu-kra-ip-salt-dev";
  return sha256Hex(`${salt}:${rawIp.trim()}`);
}

