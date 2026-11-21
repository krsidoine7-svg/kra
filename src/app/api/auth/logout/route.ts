import { NextResponse, type NextRequest } from "next/server";
import {
  revokeSessionByToken,
  SESSION_COOKIE_NAME,
} from "@/lib/security/session";

export async function POST(request: NextRequest) {
  const rawToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (rawToken) {
    await revokeSessionByToken(rawToken);
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
  return response;
}

