export const MAX_HOME_FEATURED_PROJECTS = 3;

export interface FeaturedProjectSummary {
  id: string;
  title: string;
  featuredOrder: number | null;
}

export class HomeQuotaExceededError extends Error {
  readonly statusCode = 409;
  readonly currentFeatured: FeaturedProjectSummary[];

  constructor(currentFeatured: FeaturedProjectSummary[]) {
    super(
      `Maximum ${MAX_HOME_FEATURED_PROJECTS} projets autorisés sur la page d'accueil.`
    );
    this.name = "HomeQuotaExceededError";
    this.currentFeatured = currentFeatured;
  }
}

export type HomeQuotaDecision =
  | { allowed: true; assignedOrder: number | null; replaceId: string | null }
  | { allowed: false; currentFeatured: FeaturedProjectSummary[] };

/**
 * Règle métier pure et testable : garantit au maximum 3 projets épinglés sur la page d'accueil.
 */
export function evaluateHomeFeaturedQuota(params: {
  currentlyFeatured: FeaturedProjectSummary[];
  targetProjectId: string | null;
  wantFeatured: boolean;
  replaceProjectId?: string;
}): HomeQuotaDecision {
  const { currentlyFeatured, targetProjectId, wantFeatured, replaceProjectId } =
    params;

  if (!wantFeatured) {
    return { allowed: true, assignedOrder: null, replaceId: null };
  }

  const existing = targetProjectId
    ? currentlyFeatured.find((p) => p.id === targetProjectId)
    : undefined;

  if (existing) {
    return {
      allowed: true,
      assignedOrder: existing.featuredOrder ?? 1,
      replaceId: null,
    };
  }

  if (currentlyFeatured.length < MAX_HOME_FEATURED_PROJECTS) {
    const usedOrders = new Set(
      currentlyFeatured
        .map((p) => p.featuredOrder)
        .filter((o): o is number => o !== null)
    );
    const nextOrder =
      [1, 2, 3].find((candidate) => !usedOrders.has(candidate)) ?? 1;

    return { allowed: true, assignedOrder: nextOrder, replaceId: null };
  }

  if (replaceProjectId) {
    const toReplace = currentlyFeatured.find((p) => p.id === replaceProjectId);
    if (toReplace) {
      return {
        allowed: true,
        assignedOrder: toReplace.featuredOrder ?? 1,
        replaceId: toReplace.id,
      };
    }
  }

  return {
    allowed: false,
    currentFeatured: currentlyFeatured,
  };
}

