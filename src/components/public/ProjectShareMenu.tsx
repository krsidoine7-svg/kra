"use client";

import * as React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  ArrowSquareOut,
  Check,
  DotsThree,
  Link as LinkIcon,
  ShareNetwork,
} from "@phosphor-icons/react";
import { getDictionary, type Locale } from "@/lib/i18n/dictionary";
import { cn } from "@/lib/utils";

interface ProjectShareMenuProps {
  title: string;
  slug: string;
  summary?: string;
  pathPrefix?: "/projets" | "/articles";
  locale?: Locale;
  className?: string;
  variant?: "light" | "dark";
}

function buildCanonicalShareUrl(
  slug: string,
  pathPrefix: "/projets" | "/articles"
): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}${pathPrefix}/${slug}`;
  }
  const base =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "https://manukra.ci";
  return `${base}${pathPrefix}/${slug}`;
}

export function ProjectShareMenu({
  title,
  slug,
  summary,
  pathPrefix = "/projets",
  locale = "fr",
  className,
  variant = "light",
}: ProjectShareMenuProps) {
  const t = getDictionary(locale).shareMenu;
  const [copied, setCopied] = React.useState(false);
  const [fallbackOpen, setFallbackOpen] = React.useState(false);

  function trackEvent(eventType: "link_copy" | "project_share") {
    try {
      if (typeof navigator !== "undefined" && navigator.sendBeacon) {
        navigator.sendBeacon(
          "/api/public/analytics",
          JSON.stringify({ eventType, targetSlug: slug })
        );
      }
    } catch {
      // Non bloquant sur connexion instable
    }
  }

  async function handleCopyLink() {
    const url = buildCanonicalShareUrl(slug, pathPrefix);
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = url;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setCopied(true);
    trackEvent("link_copy");
    window.setTimeout(() => setCopied(false), 2000);
  }

  async function handleShareLink() {
    const url = buildCanonicalShareUrl(slug, pathPrefix);
    trackEvent("project_share");

    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({
          title,
          text: summary ?? title,
          url,
        });
        return;
      } catch {
        // Fallback manuel si l'utilisateur annule ou navigateur incompatible
      }
    }
    setFallbackOpen((prev) => !prev);
  }

  const shareUrl = buildCanonicalShareUrl(slug, pathPrefix);
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(`${title} — Manu KRA`);

  return (
    <div className={cn("relative inline-flex items-center", className)}>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            type="button"
            aria-label={`${t.optionsAriaPrefix} ${title}`}
            className={cn(
              "inline-flex h-11 w-11 items-center justify-center rounded-[6px] border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2",
              variant === "dark"
                ? "border-[#2B547B] bg-[#143554] text-[#FFFFFF] hover:bg-[#183D61] focus-visible:outline-[#FFFFFF]"
                : "border-[#D5E0EC] bg-[#FFFFFF] text-[#0F2942] hover:bg-[#EBF1F7] focus-visible:outline-[#0F2942]"
            )}
          >
            {copied ? (
              <Check size={18} weight="bold" aria-hidden="true" />
            ) : (
              <DotsThree size={20} weight="bold" aria-hidden="true" />
            )}
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="end"
            sideOffset={6}
            className="z-50 min-w-[210px] rounded-[8px] border border-[#E8E8E8] bg-[#FFFFFF] p-1.5 text-sm text-[#111111] shadow-[0_6px_20px_rgba(0,0,0,0.08)]"
          >
            <DropdownMenu.Item
              onSelect={() => {
                void handleCopyLink();
              }}
              className="flex cursor-pointer items-center gap-2.5 rounded-[5px] px-2.5 py-2 outline-none hover:bg-[#F4F4F4] focus:bg-[#F4F4F4]"
            >
              {copied ? (
                <Check size={15} weight="bold" aria-hidden="true" />
              ) : (
                <LinkIcon size={15} weight="bold" aria-hidden="true" />
              )}
              <span>{copied ? t.copiedLink : t.copyLink}</span>
            </DropdownMenu.Item>

            <DropdownMenu.Item
              onSelect={() => {
                void handleShareLink();
              }}
              className="flex cursor-pointer items-center gap-2.5 rounded-[5px] px-2.5 py-2 outline-none hover:bg-[#F4F4F4] focus:bg-[#F4F4F4]"
            >
              <ShareNetwork size={15} weight="bold" aria-hidden="true" />
              <span>{t.shareLink}</span>
            </DropdownMenu.Item>

            <DropdownMenu.Separator className="my-1 h-px bg-[#EAEAEA]" />

            <DropdownMenu.Item asChild>
              <a
                href={`${pathPrefix}/${slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex cursor-pointer items-center gap-2.5 rounded-[5px] px-2.5 py-2 outline-none hover:bg-[#F4F4F4] focus:bg-[#F4F4F4]"
              >
                <ArrowSquareOut size={15} weight="bold" aria-hidden="true" />
                <span>
                  {pathPrefix === "/articles" ? t.openArticle : t.openProject}
                </span>
              </a>
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      {fallbackOpen ? (
        <div
          role="region"
          aria-label={t.quickShareAria}
          className="absolute right-0 top-12 z-50 w-56 rounded-[8px] border border-[#E8E8E8] bg-[#FFFFFF] p-2.5 text-xs text-[#111111] shadow-[0_6px_20px_rgba(0,0,0,0.08)]"
        >
          <p className="font-mono-tech pb-1.5 text-[11px] uppercase text-[#6B6B6B]">
            {t.shareVia}
          </p>
          <div className="flex flex-col gap-1">
            <a
              href={`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-[4px] px-2 py-1.5 hover:bg-[#F4F4F4]"
            >
              WhatsApp
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-[4px] px-2 py-1.5 hover:bg-[#F4F4F4]"
            >
              LinkedIn
            </a>
            <a
              href={`https://x.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-[4px] px-2 py-1.5 hover:bg-[#F4F4F4]"
            >
              X (Twitter)
            </a>
          </div>
        </div>
      ) : null}
    </div>
  );
}

