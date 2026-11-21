import { NextResponse, type NextRequest } from "next/server";
import { resolveAdminRouteDecision } from "@/lib/security/admin-path";
import { SESSION_COOKIE_NAME } from "@/lib/security/constants";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSessionCookie = Boolean(
    request.cookies.get(SESSION_COOKIE_NAME)?.value
  );

  const decision = resolveAdminRouteDecision({
    pathname,
    hasSessionCookie,
  });

  if (decision.action === "not_found") {
    const notFoundUrl = request.nextUrl.clone();
    notFoundUrl.pathname = "/404-not-found";
    return NextResponse.rewrite(notFoundUrl, { status: 404 });
  }

  if (decision.action === "redirect_login") {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = decision.targetPath;
    const response = NextResponse.redirect(loginUrl);
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    return response;
  }

  if (decision.action === "rewrite_internal") {
    const internalUrl = request.nextUrl.clone();
    internalUrl.pathname = decision.internalPath;
    const response = NextResponse.rewrite(internalUrl);
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    response.headers.set("Cache-Control", "no-store, max-age=0");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

