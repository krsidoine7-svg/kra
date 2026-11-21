import { NextResponse } from "next/server";
import {
  requireAdminSession,
  UnauthorizedError,
  type AdminSessionUser,
} from "@/lib/security/session";

export type AdminApiHandler<TContext = unknown> = (
  request: Request,
  session: AdminSessionUser,
  context: TContext
) => Promise<NextResponse>;

/**
 * Enveloppe chaque route /api/admin/* avec une vérification de session stricte côté serveur.
 */
export function withAdminAuth<TContext = unknown>(
  handler: AdminApiHandler<TContext>
) {
  return async (request: Request, context: TContext): Promise<NextResponse> => {
    try {
      const session = await requireAdminSession();
      return await handler(request, session, context);
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        return NextResponse.json({ error: error.message }, { status: 401 });
      }
      console.error("[Admin API Error]", error);
      return NextResponse.json(
        { error: "Erreur interne du serveur." },
        { status: 500 }
      );
    }
  };
}

