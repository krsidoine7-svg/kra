"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle,
  Circle,
  Compass,
  X,
} from "@phosphor-icons/react";
import {
  computeCompletedSteps,
  readStudioOnboardingState,
  STUDIO_ONBOARDING_OPEN_TOUR_EVENT,
  STUDIO_ONBOARDING_RESTORE_EVENT,
  writeStudioOnboardingState,
  type OnboardingStepId,
  type StudioOnboardingState,
} from "@/components/dashboard/studio-onboarding-storage";
import { getDictionary, type Locale } from "@/lib/i18n/dictionary";
import { cn } from "@/lib/utils";

interface StudioOnboardingCardProps {
  basePath: string;
  locale?: Locale;
  autoCompleted: Partial<Record<OnboardingStepId, boolean>>;
}

export function StudioOnboardingCard({
  basePath,
  locale = "fr",
  autoCompleted,
}: StudioOnboardingCardProps) {
  const t = getDictionary(locale).studioOnboarding;
  const [state, setState] = React.useState<StudioOnboardingState>({
    dismissed: false,
    manualCompleted: [],
  });
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    setState(readStudioOnboardingState());
    setHydrated(true);

    function handleRestore() {
      const current = readStudioOnboardingState();
      const next = { ...current, dismissed: false };
      writeStudioOnboardingState(next);
      setState(next);
    }

    window.addEventListener(STUDIO_ONBOARDING_RESTORE_EVENT, handleRestore);
    return () => {
      window.removeEventListener(
        STUDIO_ONBOARDING_RESTORE_EVENT,
        handleRestore
      );
    };
  }, []);

  if (hydrated && state.dismissed) {
    return null;
  }

  const completedSet = computeCompletedSteps({
    manualCompleted: state.manualCompleted,
    autoCompleted,
  });

  const steps: Array<{
    id: OnboardingStepId;
    title: string;
    description: string;
    href: string;
  }> = [
    {
      id: "profile",
      title: t.steps.profile.title,
      description: t.steps.profile.description,
      href: `${basePath}/parametres`,
    },
    {
      id: "cms",
      title: t.steps.cms.title,
      description: t.steps.cms.description,
      href: `${basePath}/cms`,
    },
    {
      id: "projects",
      title: t.steps.projects.title,
      description: t.steps.projects.description,
      href: `${basePath}/projets`,
    },
    {
      id: "articles",
      title: t.steps.articles.title,
      description: t.steps.articles.description,
      href: `${basePath}/articles`,
    },
  ];

  const completedCount = steps.filter((s) => completedSet.has(s.id)).length;
  const totalCount = steps.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  function toggleManualStep(stepId: OnboardingStepId) {
    const exists = state.manualCompleted.includes(stepId);
    const nextManual = exists
      ? state.manualCompleted.filter((id) => id !== stepId)
      : [...state.manualCompleted, stepId];
    const nextState: StudioOnboardingState = {
      ...state,
      manualCompleted: nextManual,
    };
    setState(nextState);
    writeStudioOnboardingState(nextState);
  }

  function handleDismiss() {
    const nextState: StudioOnboardingState = {
      ...state,
      dismissed: true,
    };
    setState(nextState);
    writeStudioOnboardingState(nextState);
  }

  function handleOpenTour() {
    window.dispatchEvent(new CustomEvent(STUDIO_ONBOARDING_OPEN_TOUR_EVENT));
  }

  return (
    <section
      aria-label={t.title}
      className="rounded-[8px] border border-[var(--dash-border)] bg-[var(--dash-surface)]"
    >
      <div className="flex flex-col gap-4 border-b border-[var(--dash-border)] p-5 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="font-mono-tech text-[11px] font-medium uppercase tracking-[0.06em] text-[#0F2942]">
              {t.eyebrow}
            </span>
            <span className="font-mono-tech rounded-full bg-[#EBF1F7] px-2.5 py-0.5 text-[11px] font-medium text-[#0F2942]">
              {completedCount === totalCount
                ? t.completedAllBadge
                : `${completedCount} / ${totalCount} ${t.completedOf}`}
            </span>
          </div>
          <h2 className="text-base font-semibold tracking-[-0.01em] text-[var(--dash-text)]">
            {t.title}
          </h2>
          <p className="text-sm text-[var(--dash-muted)]">{t.subtitle}</p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleOpenTour}
            className="inline-flex h-9 items-center gap-1.5 rounded-[6px] border border-[var(--dash-border)] bg-[var(--dash-surface)] px-3 text-xs font-medium text-[var(--dash-text)] transition-colors hover:bg-[var(--dash-active)]"
          >
            <Compass size={15} weight="bold" aria-hidden="true" />
            {t.openTourBtn}
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            aria-label={t.dismissBtn}
            className="inline-flex h-9 items-center gap-1 rounded-[6px] px-2.5 text-xs text-[var(--dash-muted)] transition-colors hover:bg-[var(--dash-active)] hover:text-[var(--dash-text)]"
          >
            <X size={14} weight="bold" aria-hidden="true" />
            {t.dismissBtn}
          </button>
        </div>
      </div>

      {/* Barre de progression Bleu Marine */}
      <div className="h-1 w-full bg-[var(--dash-active)]">
        <div
          className="h-full bg-[#0F2942] transition-all duration-300"
          style={{ width: `${Math.max(4, progressPercent)}%` }}
        />
      </div>

      <ul className="divide-y divide-[var(--dash-border)]">
        {steps.map((step) => {
          const isDone = completedSet.has(step.id);
          const isAuto = Boolean(autoCompleted[step.id]);
          return (
            <li
              key={step.id}
              className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => toggleManualStep(step.id)}
                  disabled={isAuto}
                  aria-pressed={isDone}
                  aria-label={`${t.markDoneAriaPrefix} ${step.title}`}
                  className={cn(
                    "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors disabled:cursor-default",
                    isDone
                      ? "text-[#0F2942]"
                      : "text-[var(--dash-muted)] hover:text-[var(--dash-text)]"
                  )}
                >
                  {isDone ? (
                    <CheckCircle size={20} weight="fill" aria-hidden="true" />
                  ) : (
                    <Circle size={20} weight="bold" aria-hidden="true" />
                  )}
                </button>
                <div>
                  <p
                    className={cn(
                      "text-sm font-medium",
                      isDone
                        ? "text-[var(--dash-muted)] line-through"
                        : "text-[var(--dash-text)]"
                    )}
                  >
                    {step.title}
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-[var(--dash-muted)]">
                    {step.description}
                  </p>
                </div>
              </div>

              <Link
                href={step.href}
                className="inline-flex h-8 shrink-0 items-center gap-1.5 self-start rounded-[6px] border border-[var(--dash-border)] bg-[var(--dash-surface)] px-3 text-xs font-medium text-[var(--dash-text)] transition-colors hover:bg-[var(--dash-active)] sm:self-center"
              >
                {t.openStepBtn}
                <ArrowRight size={13} weight="bold" aria-hidden="true" />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

