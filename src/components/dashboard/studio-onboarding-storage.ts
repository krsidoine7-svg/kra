export type OnboardingStepId = "profile" | "cms" | "projects" | "articles";

export interface StudioOnboardingState {
  dismissed: boolean;
  manualCompleted: OnboardingStepId[];
}

export const STUDIO_ONBOARDING_STORAGE_KEY = "kra_studio_onboarding_v1";
export const STUDIO_ONBOARDING_OPEN_TOUR_EVENT = "kra:studio-onboarding-open-tour";
export const STUDIO_ONBOARDING_RESTORE_EVENT = "kra:studio-onboarding-restore";

const VALID_STEP_IDS = new Set<OnboardingStepId>([
  "profile",
  "cms",
  "projects",
  "articles",
]);

export function readStudioOnboardingState(): StudioOnboardingState {
  if (typeof window === "undefined") {
    return { dismissed: false, manualCompleted: [] };
  }
  try {
    const raw = window.localStorage.getItem(STUDIO_ONBOARDING_STORAGE_KEY);
    if (!raw) return { dismissed: false, manualCompleted: [] };
    const parsed = JSON.parse(raw) as Partial<StudioOnboardingState>;
    const manualCompleted = Array.isArray(parsed.manualCompleted)
      ? parsed.manualCompleted.filter((item): item is OnboardingStepId =>
          VALID_STEP_IDS.has(item)
        )
      : [];
    return {
      dismissed: Boolean(parsed.dismissed),
      manualCompleted,
    };
  } catch {
    return { dismissed: false, manualCompleted: [] };
  }
}

export function writeStudioOnboardingState(state: StudioOnboardingState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      STUDIO_ONBOARDING_STORAGE_KEY,
      JSON.stringify(state)
    );
  } catch {
    // Stockage local indisponible
  }
}

export function computeCompletedSteps(params: {
  manualCompleted: readonly OnboardingStepId[];
  autoCompleted: Partial<Record<OnboardingStepId, boolean>>;
}): Set<OnboardingStepId> {
  const result = new Set<OnboardingStepId>(params.manualCompleted);
  for (const id of VALID_STEP_IDS) {
    if (params.autoCompleted[id]) {
      result.add(id);
    }
  }
  return result;
}

