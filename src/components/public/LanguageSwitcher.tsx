"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { LOCALE_COOKIE_NAME, type Locale } from "@/lib/i18n/dictionary";
import { cn } from "@/lib/utils";

interface LanguageSwitcherProps {
  locale: Locale;
  variant?: "light" | "dark" | "dashboard";
  onLocaleChanged?: (nextLocale: Locale) => void;
}

export function LanguageSwitcher({
  locale,
  variant = "light",
  onLocaleChanged,
}: LanguageSwitcherProps) {
  const router = useRouter();

  React.useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  function selectLocale(nextLocale: Locale) {
    if (nextLocale === locale) return;

    if (typeof document !== "undefined") {
      document.cookie = `${LOCALE_COOKIE_NAME}=${nextLocale}; path=/; max-age=31536000; SameSite=Lax`;
      document.documentElement.lang = nextLocale;
    }
    try {
      window.localStorage.setItem(LOCALE_COOKIE_NAME, nextLocale);
    } catch {
      // Storage optionnel
    }

    onLocaleChanged?.(nextLocale);

    if (typeof window !== "undefined") {
      const currentUrl = new URL(window.location.href);
      if (currentUrl.searchParams.has("lang")) {
        currentUrl.searchParams.delete("lang");
        const cleanSearch = currentUrl.searchParams.toString();
        router.replace(
          cleanSearch
            ? `${currentUrl.pathname}?${cleanSearch}`
            : currentUrl.pathname
        );
        return;
      }
    }

    router.refresh();
  }

  const containerClass =
    variant === "dark"
      ? "border-[#2B547B] bg-[#143554]"
      : variant === "dashboard"
        ? "border-[var(--dash-border)] bg-[var(--dash-surface)]"
        : "border-[#D5E0EC] bg-[#FFFFFF]";

  const activeClass =
    variant === "dark"
      ? "bg-[#FFFFFF] text-[#0F2942]"
      : "bg-[#0F2942] text-[#FFFFFF]";

  const inactiveClass =
    variant === "dark"
      ? "text-[#B8CCE0] hover:text-[#FFFFFF]"
      : "text-[#111111] hover:text-[#0F2942]";

  return (
    <div
      role="group"
      aria-label="Sélection de langue / Language switcher"
      className={cn(
        "inline-flex items-center rounded-[4px] border p-0.5 font-mono-tech text-[11px] font-medium",
        containerClass
      )}
    >
      <button
        type="button"
        onClick={() => selectLocale("fr")}
        aria-pressed={locale === "fr"}
        className={cn(
          "rounded-[3px] px-2 py-1 transition-colors",
          locale === "fr" ? activeClass : inactiveClass
        )}
      >
        FR
      </button>
      <button
        type="button"
        onClick={() => selectLocale("en")}
        aria-pressed={locale === "en"}
        className={cn(
          "rounded-[3px] px-2 py-1 transition-colors",
          locale === "en" ? activeClass : inactiveClass
        )}
      >
        EN
      </button>
    </div>
  );
}
