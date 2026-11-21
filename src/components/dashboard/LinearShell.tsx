"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowSquareOut,
  Article,
  Briefcase,
  ClockCounterClockwise,
  Compass,
  Folder,
  Gear,
  House,
  List,
  MagnifyingGlass,
  Moon,
  SignOut,
  SlidersHorizontal,
  Sun,
  Trash,
  X,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { AdminCommandPalette } from "@/components/dashboard/AdminCommandPalette";
import { StudioGuideModal } from "@/components/dashboard/StudioGuideModal";
import { STUDIO_ONBOARDING_OPEN_TOUR_EVENT } from "@/components/dashboard/studio-onboarding-storage";
import { LanguageSwitcher } from "@/components/public/LanguageSwitcher";
import { getDictionary, type Locale } from "@/lib/i18n/dictionary";

interface LinearShellProps {
  basePath: string;
  adminName: string;
  adminEmail: string;
  locale?: Locale;
  children: React.ReactNode;
}

export function LinearShell({
  basePath,
  adminName,
  adminEmail,
  locale = "fr",
  children,
}: LinearShellProps) {
  const t = getDictionary(locale).studioShell;
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [commandOpen, setCommandOpen] = React.useState(false);
  const [guideOpen, setGuideOpen] = React.useState(false);
  const [isDark, setIsDark] = React.useState(false);

  React.useEffect(() => {
    const saved = window.localStorage.getItem("kra_dash_theme");
    if (saved === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
      setIsDark(true);
    }

    function handleOpenTour() {
      setGuideOpen(true);
    }
    window.addEventListener(STUDIO_ONBOARDING_OPEN_TOUR_EVENT, handleOpenTour);

    return () => {
      document.documentElement.removeAttribute("data-theme");
      window.removeEventListener(
        STUDIO_ONBOARDING_OPEN_TOUR_EVENT,
        handleOpenTour
      );
    };
  }, []);

  function toggleTheme() {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.setAttribute("data-theme", "dark");
      window.localStorage.setItem("kra_dash_theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
      window.localStorage.setItem("kra_dash_theme", "light");
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace(`${basePath}/login`);
    router.refresh();
  }

  const navGroups = [
    {
      label: t.groupStudio,
      items: [
        { label: t.overview, href: basePath, icon: House, exact: true },
        { label: t.projects, href: `${basePath}/projets`, icon: Briefcase, exact: false },
        { label: t.folders, href: `${basePath}/dossiers`, icon: Folder, exact: false },
        { label: t.articles, href: `${basePath}/articles`, icon: Article, exact: false },
      ],
    },
    {
      label: t.groupSystem,
      items: [
        { label: t.cms, href: `${basePath}/cms`, icon: SlidersHorizontal, exact: false },
        { label: t.trash, href: `${basePath}/corbeille`, icon: Trash, exact: false },
        {
          label: t.memory,
          href: `${basePath}/memoire`,
          icon: ClockCounterClockwise,
          exact: false,
        },
        { label: t.settings, href: `${basePath}/parametres`, icon: Gear, exact: false },
      ],
    },
  ];

  function isItemActive(href: string, exact: boolean): boolean {
    if (exact) {
      return pathname === href || pathname === "/studio-internal";
    }
    return pathname.startsWith(href) || pathname.startsWith(href.replace(basePath, "/studio-internal"));
  }

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between bg-[var(--dash-sidebar)] text-[var(--dash-text)]">
      <div>
        <div className="flex h-12 items-center justify-between border-b border-[var(--dash-border)] px-4">
          <Link
            href={basePath}
            className="font-display text-sm font-bold tracking-[-0.02em] text-[var(--dash-text)]"
            onClick={() => setMobileMenuOpen(false)}
          >
            MANU KRA · STUDIO
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Fermer le menu"
            className="flex h-9 w-9 items-center justify-center rounded-[6px] text-[var(--dash-muted)] hover:bg-[var(--dash-active)] lg:hidden"
          >
            <X size={18} weight="bold" aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-1.5 px-3 pt-3">
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              setCommandOpen(true);
            }}
            className="flex h-8 w-full items-center justify-between rounded-[6px] border border-[var(--dash-border)] bg-[var(--dash-surface)] px-2.5 text-xs text-[var(--dash-muted)] hover:border-[var(--border-strong)]"
          >
            <span className="inline-flex items-center gap-2">
              <MagnifyingGlass size={14} weight="bold" aria-hidden="true" />
              {t.quickSearch}
            </span>
            <kbd className="font-mono-tech text-[11px]">⌘K</kbd>
          </button>

          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              setGuideOpen(true);
            }}
            className="flex h-8 w-full items-center justify-between rounded-[6px] border border-[var(--dash-border)] bg-[var(--dash-surface)] px-2.5 text-xs font-medium text-[var(--dash-text)] transition-colors hover:bg-[var(--dash-active)]"
          >
            <span className="inline-flex items-center gap-2">
              <Compass size={14} weight="bold" aria-hidden="true" className="text-[#0F2942]" />
              {t.guideBtn}
            </span>
            <span className="font-mono-tech text-[10px] text-[var(--dash-muted)]">?</span>
          </button>
        </div>

        <nav aria-label="Navigation du studio" className="mt-4 space-y-5 px-3">
          {navGroups.map((group) => (
            <div key={group.label}>
              <p className="px-2 pb-1.5 text-xs font-medium text-[var(--dash-muted)]">
                {group.label}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isItemActive(item.href, item.exact);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "flex h-9 items-center gap-2.5 rounded-[6px] px-2.5 text-sm transition-colors",
                          active
                            ? "bg-[var(--dash-active)] font-medium text-[var(--dash-text)]"
                            : "text-[var(--dash-muted)] hover:bg-[var(--dash-active)]/60 hover:text-[var(--dash-text)]"
                        )}
                      >
                        <Icon
                          size={16}
                          weight={active ? "bold" : "regular"}
                          aria-hidden="true"
                        />
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      <div className="border-t border-[var(--dash-border)] p-3 space-y-2">
        <div className="flex items-center justify-between gap-2 px-1">
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-[var(--dash-text)]">
              {adminName}
            </p>
            <p className="truncate text-[11px] text-[var(--dash-muted)]">
              {adminEmail}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <LanguageSwitcher locale={locale} variant="dashboard" />
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isDark ? "Passer en thème clair" : "Passer en thème sombre"}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] text-[var(--dash-muted)] hover:bg-[var(--dash-active)] hover:text-[var(--dash-text)]"
            >
              {isDark ? (
                <Sun size={16} weight="bold" aria-hidden="true" />
              ) : (
                <Moon size={16} weight="bold" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-8 items-center justify-center gap-1.5 rounded-[6px] border border-[var(--dash-border)] bg-[var(--dash-surface)] px-2 text-xs text-[var(--dash-text)] hover:bg-[var(--dash-active)]"
          >
            <ArrowSquareOut size={14} weight="bold" aria-hidden="true" />
            {t.viewSite}
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex h-8 items-center justify-center gap-1.5 rounded-[6px] border border-[var(--dash-border)] bg-[var(--dash-surface)] px-2 text-xs text-[var(--dash-muted)] hover:bg-[var(--dash-active)] hover:text-[var(--dash-text)]"
          >
            <SignOut size={14} weight="bold" aria-hidden="true" />
            {t.signOut}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--dash-ground)] text-[var(--dash-text)] lg:flex">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:block lg:w-[232px] lg:border-r lg:border-[var(--dash-border)]">
        {sidebarContent}
      </aside>

      {/* Topbar Mobile / Tablette */}
      <header className="sticky top-0 z-30 flex h-12 items-center justify-between border-b border-[var(--dash-border)] bg-[var(--dash-surface)] px-4 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Ouvrir le menu du studio"
          className="flex h-10 w-10 items-center justify-center rounded-[6px] text-[var(--dash-text)] hover:bg-[var(--dash-active)]"
        >
          <List size={20} weight="bold" aria-hidden="true" />
        </button>
        <span className="font-display text-sm font-bold tracking-[-0.02em]">
          MANU KRA · STUDIO
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setGuideOpen(true)}
            aria-label={t.guideBtn}
            className="flex h-10 w-10 items-center justify-center rounded-[6px] text-[var(--dash-text)] hover:bg-[var(--dash-active)]"
          >
            <Compass size={18} weight="bold" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setCommandOpen(true)}
            aria-label="Ouvrir la recherche rapide"
            className="flex h-10 w-10 items-center justify-center rounded-[6px] text-[var(--dash-text)] hover:bg-[var(--dash-active)]"
          >
            <MagnifyingGlass size={18} weight="bold" aria-hidden="true" />
          </button>
        </div>
      </header>

      {/* Drawer Mobile */}
      {mobileMenuOpen ? (
        <div
          className="fixed inset-0 z-50 bg-black/40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="h-full w-72 max-w-[85vw] border-r border-[var(--dash-border)]"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </div>
        </div>
      ) : null}

      {/* Zone de Contenu */}
      <div className="flex-1 lg:pl-[232px]">
        <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-9">
          {children}
        </div>
      </div>

      <AdminCommandPalette
        basePath={basePath}
        open={commandOpen}
        onOpenChange={setCommandOpen}
      />

      <StudioGuideModal
        basePath={basePath}
        locale={locale}
        open={guideOpen}
        onOpenChange={setGuideOpen}
      />
    </div>
  );
}

