const DEFAULT_SECRET_SEGMENT = "acces-studio-kra";

/**
 * Retourne le segment d'URL masqué sans slash au début/fin.
 */
export function getAdminSecretSegment(): string {
  const configured = process.env.ADMIN_SECRET_PATH?.trim() ?? "";
  const cleaned = configured.replace(/^\/+|\/+$/g, "");
  return cleaned.length >= 4 ? cleaned : DEFAULT_SECRET_SEGMENT;
}

export function getAdminBasePath(): string {
  return `/${getAdminSecretSegment()}`;
}

export function getAdminLoginPath(): string {
  return `${getAdminBasePath()}/login`;
}

const BLOCKED_STANDARD_PATHS = new Set([
  "/admin",
  "/login",
  "/signin",
  "/sign-in",
  "/dashboard",
  "/cms",
]);

export type AdminRouteDecision =
  | { action: "not_found" }
  | { action: "redirect_login"; targetPath: string }
  | { action: "rewrite_internal"; internalPath: string }
  | { action: "pass" };

/**
 * Décide de manière pure et testable le routage des chemins sensibles.
 */
export function resolveAdminRouteDecision(params: {
  pathname: string;
  hasSessionCookie: boolean;
}): AdminRouteDecision {
  const { pathname, hasSessionCookie } = params;
  const secretBase = getAdminBasePath();

  // Bloquer les routes devinables et l'accès direct à la route interne
  if (
    BLOCKED_STANDARD_PATHS.has(pathname) ||
    pathname.startsWith("/admin/") ||
    pathname.startsWith("/dashboard/") ||
    pathname === "/studio-internal" ||
    pathname.startsWith("/studio-internal/")
  ) {
    return { action: "not_found" };
  }

  if (pathname === secretBase || pathname.startsWith(`${secretBase}/`)) {
    const subPath = pathname.slice(secretBase.length);

    if (subPath === "/login") {
      return {
        action: "rewrite_internal",
        internalPath: "/studio-internal/login",
      };
    }

    if (!hasSessionCookie) {
      return {
        action: "redirect_login",
        targetPath: `${secretBase}/login`,
      };
    }

    return {
      action: "rewrite_internal",
      internalPath: `/studio-internal${subPath || ""}`,
    };
  }

  return { action: "pass" };
}

