import { NextResponse } from "next/server";
import { getCurrentAdminSession } from "@/lib/security/session";

export async function GET() {
  const session = await getCurrentAdminSession();
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    admin: {
      id: session.adminId,
      firstName: session.firstName,
      lastName: session.lastName,
      email: session.email,
    },
  });
}

