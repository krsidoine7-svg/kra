import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;

function getMasterKeyBuffer(): Buffer {
  const hexKey = process.env.ENCRYPTION_MASTER_KEY?.trim() ?? "";
  if (/^[0-9a-fA-F]{64}$/.test(hexKey)) {
    return Buffer.from(hexKey, "hex");
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "ENCRYPTION_MASTER_KEY invalide : 64 caractères hexadécimaux (32 octets) requis en production."
    );
  }
  // Clé déterministe uniquement pour développement/tests locaux
  return Buffer.from(
    "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
    "hex"
  );
}

/**
 * Chiffre une chaîne sensible au format `ivHex:authTagHex:cipherHex` (AES-256-GCM).
 */
export function encryptAES256GCM(plaintext: string): string {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, getMasterKeyBuffer(), iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
}

/**
 * Déchiffre un payload `ivHex:authTagHex:cipherHex` en vérifiant l'authenticité GCM.
 */
export function decryptAES256GCM(payload: string): string {
  const parts = payload.split(":");
  if (parts.length !== 3) {
    throw new Error("Format de donnée chiffrée AES-256-GCM invalide.");
  }
  const [ivHex, authTagHex, cipherHex] = parts;
  if (!ivHex || !authTagHex || cipherHex === undefined) {
    throw new Error("Composants AES-256-GCM incomplets.");
  }

  const decipher = createDecipheriv(
    ALGORITHM,
    getMasterKeyBuffer(),
    Buffer.from(ivHex, "hex")
  );
  decipher.setAuthTag(Buffer.from(authTagHex, "hex"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(cipherHex, "hex")),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}

