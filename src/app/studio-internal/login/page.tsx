import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { HiddenLoginForm } from "@/components/auth/HiddenLoginForm";
import { getAdminBasePath } from "@/lib/security/admin-path";
import { getCurrentAdminSession } from "@/lib/security/session";

export const metadata: Metadata = {
  title: "Accès Studio",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function HiddenLoginPage() {
  const adminBasePath = getAdminBasePath();
  let existingSession = null;

  try {
    existingSession = await getCurrentAdminSession();
  } catch {
    existingSession = null;
  }

  if (existingSession) {
    redirect(adminBasePath);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F7F5F2] px-4 py-12">
      <section className="w-full max-w-md rounded-[8px] border border-[#EAEAEA] bg-[#FFFFFF] p-6 md:p-8">
        <p className="font-mono-tech text-xs uppercase tracking-[0.06em] text-[#6B6B6B]">
          [ ACCÈS PRIVÉ — STUDIO ]
        </p>
        <h1 className="font-display mt-3 text-2xl font-bold tracking-[-0.02em] text-[#111111]">
          Manu KRA
        </h1>
        <p className="mt-1.5 text-sm text-[#525252]">
          Espace d&apos;administration réservé. Aucun accès public n&apos;est exposé.
        </p>

        <HiddenLoginForm redirectPath={adminBasePath} />
      </section>
    </main>
  );
}

