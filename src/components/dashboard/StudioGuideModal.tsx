"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowCounterClockwise,
  ArrowLeft,
  ArrowRight,
  Compass,
  X,
} from "@phosphor-icons/react";
import {
  readStudioOnboardingState,
  STUDIO_ONBOARDING_RESTORE_EVENT,
  writeStudioOnboardingState,
} from "@/components/dashboard/studio-onboarding-storage";
import { getDictionary, type Locale } from "@/lib/i18n/dictionary";
import { cn } from "@/lib/utils";

interface StudioGuideModalProps {
  basePath: string;
  locale?: Locale;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StudioGuideModal({
  basePath,
  locale = "fr",
  open,
  onOpenChange,
}: StudioGuideModalProps) {
  const t = getDictionary(locale).studioOnboarding.tour;
  const router = useRouter();
  const [stepIndex, setStepIndex] = React.useState(0);
  const [restoredNotice, setRestoredNotice] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    setRestoredNotice(false);

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  if (!open) return null;

  const slides = t.slides;
  const activeSlide = slides[stepIndex] ?? slides[0];
  if (!activeSlide) return null;

  const isFirst = stepIndex === 0;
  const isLast = stepIndex === slides.length - 1;

  function handleGoToModule() {
    if (!activeSlide) return;
    onOpenChange(false);
    router.push(`${basePath}${activeSlide.subPath}`);
  }

  function handleRestoreChecklist() {
    const current = readStudioOnboardingState();
    writeStudioOnboardingState({ ...current, dismissed: false });
    window.dispatchEvent(new CustomEvent(STUDIO_ONBOARDING_RESTORE_EVENT));
    setRestoredNotice(true);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t.dialogAria}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F2942]/45 px-4 py-6"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-[8px] border border-[var(--dash-border)] bg-[var(--dash-surface)] text-[var(--dash-text)] shadow-[0_12px_32px_rgba(15,41,66,0.18)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[var(--dash-border)] px-5 py-4">
          <div>
            <p className="font-mono-tech flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.06em] text-[#0F2942]">
              <Compass size={14} weight="bold" aria-hidden="true" />
              {t.eyebrow}
            </p>
            <h2 className="mt-1 text-base font-semibold tracking-[-0.01em]">
              {t.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label={t.closeAria}
            className="flex h-8 w-8 items-center justify-center rounded-[6px] text-[var(--dash-muted)] hover:bg-[var(--dash-active)] hover:text-[var(--dash-text)]"
          >
            <X size={16} weight="bold" aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-5 p-5">
          {/* Indicateurs d'étapes cliquables */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              {slides.map((slide, idx) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => setStepIndex(idx)}
                  aria-label={`${t.stepLabel} ${idx + 1}`}
                  aria-current={idx === stepIndex ? "step" : undefined}
                  className={cn(
                    "font-mono-tech h-7 min-w-[28px] rounded-[4px] border px-2 text-xs font-medium transition-colors",
                    idx === stepIndex
                      ? "border-[#0F2942] bg-[#0F2942] text-[#FFFFFF]"
                      : "border-[var(--dash-border)] bg-[var(--dash-surface)] text-[var(--dash-muted)] hover:text-[var(--dash-text)]"
                  )}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
            <span className="font-mono-tech text-xs text-[var(--dash-muted)]">
              {t.stepLabel} {stepIndex + 1} {t.ofLabel} {slides.length}
            </span>
          </div>

          {/* Contenu de l'étape active */}
          <div className="space-y-3 rounded-[6px] border border-[var(--dash-border)] bg-[var(--dash-ground)] p-4">
            <h3 className="text-sm font-semibold text-[var(--dash-text)]">
              {activeSlide.title}
            </h3>
            <p className="text-sm leading-relaxed text-[var(--dash-muted)]">
              {activeSlide.summary}
            </p>
            <div className="rounded-[4px] border border-[#C5D6E6] bg-[#EBF1F7] px-3 py-2 text-xs leading-relaxed text-[#0F2942]">
              {activeSlide.tip}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleGoToModule}
              className="inline-flex h-9 items-center gap-1.5 rounded-[6px] border border-[var(--dash-border)] bg-[var(--dash-surface)] px-3 text-xs font-medium text-[var(--dash-text)] hover:bg-[var(--dash-active)]"
            >
              {t.goToModuleBtn}
              <ArrowRight size={13} weight="bold" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={handleRestoreChecklist}
              className="inline-flex h-9 items-center gap-1.5 rounded-[6px] px-2.5 text-xs text-[var(--dash-muted)] hover:bg-[var(--dash-active)] hover:text-[var(--dash-text)]"
            >
              <ArrowCounterClockwise
                size={13}
                weight="bold"
                aria-hidden="true"
              />
              {t.restoreChecklistBtn}
            </button>
          </div>

          {restoredNotice ? (
            <p
              role="status"
              className="rounded-[4px] border border-[#C5D6E6] bg-[#EBF1F7] px-3 py-2 text-xs text-[#0F2942]"
            >
              {t.restoredFeedback}
            </p>
          ) : null}
        </div>

        <div className="flex items-center justify-between border-t border-[var(--dash-border)] px-5 py-3.5">
          <button
            type="button"
            disabled={isFirst}
            onClick={() => setStepIndex((prev) => Math.max(0, prev - 1))}
            className="inline-flex h-9 items-center gap-1.5 rounded-[6px] border border-[var(--dash-border)] px-3 text-xs font-medium text-[var(--dash-text)] transition-colors hover:bg-[var(--dash-active)] disabled:opacity-40"
          >
            <ArrowLeft size={13} weight="bold" aria-hidden="true" />
            {t.prevBtn}
          </button>

          {isLast ? (
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="inline-flex h-9 items-center gap-1.5 rounded-[6px] bg-[#0F2942] px-4 text-xs font-medium text-[#FFFFFF] transition-colors hover:bg-[#183D61]"
            >
              {t.finishBtn}
            </button>
          ) : (
            <button
              type="button"
              onClick={() =>
                setStepIndex((prev) => Math.min(slides.length - 1, prev + 1))
              }
              className="inline-flex h-9 items-center gap-1.5 rounded-[6px] bg-[#0F2942] px-4 text-xs font-medium text-[#FFFFFF] transition-colors hover:bg-[#183D61]"
            >
              {t.nextBtn}
              <ArrowRight size={13} weight="bold" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

