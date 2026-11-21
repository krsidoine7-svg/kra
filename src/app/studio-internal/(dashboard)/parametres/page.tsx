import { and, eq, isNull } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { adminProfiles } from "@/lib/db/schema";
import { decryptAES256GCM } from "@/lib/security/aes";
import { getAdminLoginPath } from "@/lib/security/admin-path";
import { getCurrentAdminSession } from "@/lib/security/session";
import { ProfileSettingsForm } from "@/components/dashboard/ProfileSettingsForm";

function safeDecrypt(value: string | null): string {
  if (!value) return "";
  try {
    return decryptAES256GCM(value);
  } catch {
    return "";
  }
}

export default async function StudioSettingsPage() {
  const session = await getCurrentAdminSession();
  if (!session) {
    redirect(getAdminLoginPath());
  }

  const db = getDb();
  const [profile] = await db
    .select({
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
    redirect(getAdminLoginPath());
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-[var(--dash-border)] pb-5">
        <h1 className="text-2xl font-semibold tracking-[-0.02em] text-[var(--dash-text)]">
          Paramètres personnels
        </h1>
        <p className="mt-1 text-sm text-[var(--dash-muted)]">
          Gérez votre identité, vos coordonnées chiffrées et la sécurité de votre accès.
        </p>
      </div>

      <ProfileSettingsForm
        initialProfile={{
          firstName: profile.firstName,
          lastName: profile.lastName,
          email: profile.email,
          phone: safeDecrypt(profile.phoneEncrypted),
          recoveryEmail: safeDecrypt(profile.recoveryEmailEncrypted),
        }}
      />
    </div>
  );
}

