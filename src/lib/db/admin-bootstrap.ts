import { z } from "zod";
import { hashPassword } from "@/lib/security/crypto";

export const CreateAdminSchema = z.object({
  firstName: z.string().trim().min(1, "Prénom requis.").max(80).default("Manu"),
  lastName: z.string().trim().min(1, "Nom requis.").max(80).default("KRA"),
  email: z.string().trim().email("Adresse e-mail invalide.").max(255),
  password: z
    .string()
    .min(10, "Le mot de passe doit contenir au moins 10 caractères.")
    .max(128)
    .regex(/[A-Z]/, "Ajoutez au moins une majuscule.")
    .regex(/[a-z]/, "Ajoutez au moins une minuscule.")
    .regex(/[0-9]/, "Ajoutez au moins un chiffre."),
});

export interface AdminCliOptions {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
}

const FLAG_MAP: Record<string, keyof AdminCliOptions> = {
  "--email": "email",
  "--password": "password",
  "--first-name": "firstName",
  "--last-name": "lastName",
};

/**
 * Analyse les arguments CLI pour la création / mise à jour d'un compte administrateur.
 */
export function parseAdminCliArgs(argv: readonly string[]): AdminCliOptions {
  const parsed: AdminCliOptions = {};

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token || !token.startsWith("--")) continue;

    const eqIdx = token.indexOf("=");
    if (eqIdx > 0) {
      const flag = token.slice(0, eqIdx);
      const val = token.slice(eqIdx + 1);
      const key = FLAG_MAP[flag];
      if (key && val) {
        parsed[key] = val;
      }
      continue;
    }

    const key = FLAG_MAP[token];
    const nextToken = argv[i + 1];
    if (key && nextToken && !nextToken.startsWith("--")) {
      parsed[key] = nextToken;
      i += 1;
    }
  }

  return parsed;
}

export async function prepareAdminAccountRecord(rawInput: {
  firstName?: string;
  lastName?: string;
  email: string;
  password: string;
}): Promise<{
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
}> {
  const validated = CreateAdminSchema.parse({
    firstName: rawInput.firstName || "Manu",
    lastName: rawInput.lastName || "KRA",
    email: rawInput.email,
    password: rawInput.password,
  });

  const passwordHash = await hashPassword(validated.password);
  return {
    firstName: validated.firstName,
    lastName: validated.lastName,
    email: validated.email.toLowerCase(),
    passwordHash,
  };
}

