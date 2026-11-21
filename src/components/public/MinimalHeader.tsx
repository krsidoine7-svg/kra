"use client";

import * as React from "react";
import Link from "next/link";
import { List, X } from "@phosphor-icons/react";
import { LanguageSwitcher } from "@/components/public/LanguageSwitcher";
import { getDictionary, type Locale } from "@/lib/i18n/dictionary";
import type { HeaderCms } from "@/lib/validators/cms";

interface MinimalHeaderProps {
  header: HeaderCms;
  locale?: Locale;
}

export function MinimalHeader({ header, locale = "fr" }: MinimalHeaderProps) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const t = getDictionary(locale).header;

  return (
    <header className="sticky top-0 z-40 border-b border-[#E2E8F0] bg-[#FFFFFF]/95">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-8">
        {/* Gauche : Marque géométrique Bleu Marine + Wordmark noir */}
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 text-sm font-bold tracking-[-0.02em] text-[#111111]"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <rect x="2" y="2" width="8" height="20" fill="#0F2942" />
            <polygon points="12,12 22,2 22,8 16,12 22,16 22,22" fill="#1D4B75" />
          </svg>
          <span className="font-display uppercase">{header.wordmark}</span>
        </Link>

        {/* Centre : Navigation épurée desktop (aucun lien de connexion) */}
        <nav
          aria-label={t.navAria}
          className="hidden items-center gap-7 md:flex"
        >
          {header.links.map((item) => (
            <Link
              key={item.href + item.label}
              href={item.href}
              className="text-sm text-[#111111] transition-colors hover:text-[#0F2942]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Droite : Sélecteur FR / EN + Menu burger */}
        <div className="flex items-center gap-2">
          <LanguageSwitcher locale={locale} />
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label={t.menuOpenAria}
            className="inline-flex h-11 w-11 items-center justify-center rounded-[4px] text-[#0F2942] transition-colors hover:bg-[#EBF1F7]"
          >
            <List size={20} weight="bold" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Tiroir de navigation plein écran Bleu Marine */}
      {menuOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t.drawerAria}
          className="fixed inset-0 z-50 flex flex-col justify-between bg-[#0F2942] p-6 text-[#FFFFFF] md:p-12"
        >
          <div className="flex items-center justify-between gap-4">
            <span className="font-display text-sm font-bold uppercase tracking-[-0.02em]">
              {header.wordmark}
            </span>
            <div className="flex items-center gap-3">
              <LanguageSwitcher
                locale={locale}
                variant="dark"
                onLocaleChanged={() => setMenuOpen(false)}
              />
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label={t.menuCloseAria}
                className="inline-flex h-11 w-11 items-center justify-center rounded-[4px] border border-[#2B547B] text-[#FFFFFF] hover:bg-[#183D61]"
              >
                <X size={20} weight="bold" aria-hidden="true" />
              </button>
            </div>
          </div>

          <nav aria-label={t.drawerAria} className="my-auto space-y-4">
            {header.links.map((item) => (
              <Link
                key={item.href + item.label}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="font-display block text-3xl font-bold tracking-[-0.02em] text-[#FFFFFF] transition-opacity hover:opacity-75 md:text-5xl"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <p className="font-mono-tech text-xs text-[#B8CCE0]">
            {t.drawerTagline}
          </p>
        </div>
      ) : null}
    </header>
  );
}

