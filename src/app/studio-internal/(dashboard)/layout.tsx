import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LinearShell } from "@/components/dashboard/LinearShell";
import { getServerLocale } from "@/lib/i18n/server";
import { getAdminBasePath, getAdminLoginPath } from "@/lib/security/admin-path";
import { getCurrentAdminSession } from "@/lib/security/session";

export const metadata: Metadata = {
  title: "Studio — Manu KRA",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const [session, locale] = await Promise.all([
    getCurrentAdminSession(),
    getServerLocale(),
  ]);
  if (!session) {
    redirect(getAdminLoginPath());
  }

  return (
    <LinearShell
      basePath={getAdminBasePath()}
      adminName={`${session.firstName} ${session.lastName}`}
      adminEmail={session.email}
      locale={locale}
    >
      {children}
    </LinearShell>
  );
}

