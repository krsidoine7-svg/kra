import { stdin as input, stdout as output } from "node:process";
import readline from "node:readline/promises";
import { config as loadEnv } from "dotenv";
import { getDb, getDbPool } from "@/lib/db";
import {
  parseAdminCliArgs,
  prepareAdminAccountRecord,
} from "@/lib/db/admin-bootstrap";
import { adminProfiles } from "@/lib/db/schema";
import { getAdminLoginPath } from "@/lib/security/admin-path";

loadEnv({ path: ".env.local" });
loadEnv();

async function resolveInteractiveInput() {
  const args = parseAdminCliArgs(process.argv.slice(2));
  let firstName = args.firstName ?? process.env.ADMIN_FIRST_NAME ?? "Manu";
  let lastName = args.lastName ?? process.env.ADMIN_LAST_NAME ?? "KRA";
  let email = args.email ?? process.env.ADMIN_EMAIL ?? "";
  let password = args.password ?? process.env.ADMIN_PASSWORD ?? "";

  if ((!email || !password) && process.stdin.isTTY) {
    const rl = readline.createInterface({ input, output });
    try {
      if (!args.firstName && !process.env.ADMIN_FIRST_NAME) {
        const answer = await rl.question("Prénom [Manu] : ");
        if (answer.trim()) firstName = answer.trim();
      }
      if (!args.lastName && !process.env.ADMIN_LAST_NAME) {
        const answer = await rl.question("Nom [KRA] : ");
        if (answer.trim()) lastName = answer.trim();
      }
      while (!email.trim()) {
        email = (await rl.question("E-mail administrateur : ")).trim();
      }
      while (!password) {
        password = await rl.question(
          "Mot de passe (min 10 car., 1 majuscule, 1 minuscule, 1 chiffre) : "
        );
      }
    } finally {
      rl.close();
    }
  }

  return { firstName, lastName, email, password };
}

async function main() {
  const raw = await resolveInteractiveInput();
  if (!raw.email || !raw.password) {
    throw new Error(
      "Usage: npm run admin:create -- --email vous@domaine.ci --password \"MotDePasseFort1\" [--first-name Manu] [--last-name KRA]"
    );
  }

  const record = await prepareAdminAccountRecord(raw);
  const db = getDb();
  const now = new Date();

  const [saved] = await db
    .insert(adminProfiles)
    .values({
      firstName: record.firstName,
      lastName: record.lastName,
      email: record.email,
      passwordHash: record.passwordHash,
      failedLoginAttempts: 0,
      lockedUntil: null,
      deletedAt: null,
    })
    .onConflictDoUpdate({
      target: adminProfiles.email,
      set: {
        firstName: record.firstName,
        lastName: record.lastName,
        passwordHash: record.passwordHash,
        failedLoginAttempts: 0,
        lockedUntil: null,
        deletedAt: null,
        updatedAt: now,
      },
    })
    .returning({
      id: adminProfiles.id,
      email: adminProfiles.email,
    });

  console.log(
    `Compte administrateur prêt (${saved?.email ?? record.email}). Connectez-vous sur ${getAdminLoginPath()}`
  );
}

main()
  .catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Erreur création admin:", message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await getDbPool().end().catch(() => null);
  });

