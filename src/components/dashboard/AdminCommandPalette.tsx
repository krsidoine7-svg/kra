"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import {
  ArrowSquareOut,
  Article,
  Briefcase,
  ClockCounterClockwise,
  Folder,
  Gear,
  House,
  MagnifyingGlass,
  SlidersHorizontal,
  Trash,
  X,
} from "@phosphor-icons/react";

interface AdminCommandPaletteProps {
  basePath: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AdminCommandPalette({
  basePath,
  open,
  onOpenChange,
}: AdminCommandPaletteProps) {
  const router = useRouter();

  React.useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        onOpenChange(!open);
      } else if (event.key === "Escape" && open) {
        onOpenChange(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  if (!open) return null;

  function navigate(target: string) {
    onOpenChange(false);
    router.push(target);
  }

  const items = [
    { label: "Vue d'ensemble & Statistiques", href: basePath, icon: House },
    { label: "Projets (Actuels & À venir)", href: `${basePath}/projets`, icon: Briefcase },
    { label: "Dossiers & Collections", href: `${basePath}/dossiers`, icon: Folder },
    { label: "Articles & Commentaires", href: `${basePath}/articles`, icon: Article },
    { label: "CMS Site (Hero, Textes, Logos)", href: `${basePath}/cms`, icon: SlidersHorizontal },
    { label: "Corbeille & Impact", href: `${basePath}/corbeille`, icon: Trash },
    { label: "Mémoire des Sections", href: `${basePath}/memoire`, icon: ClockCounterClockwise },
    { label: "Paramètres Personnels", href: `${basePath}/parametres`, icon: Gear },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Palette de commandes rapides"
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/35 px-4 pt-20"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-[8px] border border-[var(--dash-border)] bg-[var(--dash-surface)] text-[var(--dash-text)] shadow-[0_12px_32px_rgba(0,0,0,0.12)]"
        onClick={(e) => e.stopPropagation()}
      >
        <Command label="Navigation Studio">
          <div className="flex items-center gap-2.5 border-b border-[var(--dash-border)] px-3.5">
            <MagnifyingGlass
              size={16}
              weight="bold"
              className="text-[var(--dash-muted)]"
              aria-hidden="true"
            />
            <Command.Input
              autoFocus
              placeholder="Aller à un onglet ou une action..."
              className="h-11 w-full bg-transparent text-sm text-[var(--dash-text)] placeholder:text-[var(--dash-muted)] focus:outline-none"
            />
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              aria-label="Fermer la recherche"
              className="flex h-8 w-8 items-center justify-center rounded-[4px] text-[var(--dash-muted)] hover:bg-[var(--dash-active)]"
            >
              <X size={15} weight="bold" aria-hidden="true" />
            </button>
          </div>

          <Command.List className="max-h-72 overflow-y-auto p-1.5">
            <Command.Empty className="px-3 py-6 text-center text-sm text-[var(--dash-muted)]">
              Aucun résultat trouvé.
            </Command.Empty>

            <Command.Group
              heading="Navigation Studio"
              className="px-2 py-1 text-xs font-medium text-[var(--dash-muted)]"
            >
              {items.map((item) => {
                const Icon = item.icon;
                return (
                  <Command.Item
                    key={item.href}
                    value={item.label}
                    onSelect={() => navigate(item.href)}
                    className="flex cursor-pointer items-center gap-2.5 rounded-[6px] px-2.5 py-2 text-sm text-[var(--dash-text)] aria-selected:bg-[var(--dash-active)]"
                  >
                    <Icon
                      size={16}
                      weight="regular"
                      className="text-[var(--dash-muted)]"
                      aria-hidden="true"
                    />
                    <span>{item.label}</span>
                  </Command.Item>
                );
              })}
            </Command.Group>

            <Command.Separator className="my-1 h-px bg-[var(--dash-border)]" />

            <Command.Group
              heading="Site Public"
              className="px-2 py-1 text-xs font-medium text-[var(--dash-muted)]"
            >
              <Command.Item
                value="Ouvrir le portfolio public"
                onSelect={() => {
                  onOpenChange(false);
                  window.open("/", "_blank", "noopener,noreferrer");
                }}
                className="flex cursor-pointer items-center justify-between rounded-[6px] px-2.5 py-2 text-sm text-[var(--dash-text)] aria-selected:bg-[var(--dash-active)]"
              >
                <span className="inline-flex items-center gap-2.5">
                  <ArrowSquareOut
                    size={16}
                    weight="regular"
                    className="text-[var(--dash-muted)]"
                    aria-hidden="true"
                  />
                  Voir le portfolio public
                </span>
                <kbd className="font-mono-tech rounded-[4px] border border-[var(--dash-border)] px-1.5 py-0.5 text-[11px] text-[var(--dash-muted)]">
                  /
                </kbd>
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}

