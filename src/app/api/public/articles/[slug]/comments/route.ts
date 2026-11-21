import { NextResponse, type NextRequest } from "next/server";
import { and, eq, isNull } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { articleComments, articles } from "@/lib/db/schema";
import { encryptAES256GCM } from "@/lib/security/aes";
import { hashIpAddress } from "@/lib/security/crypto";
import { commentRateLimiter } from "@/lib/security/rate-limit";
import { PublicCommentCreateSchema } from "@/lib/validators/comment";

interface CommentRouteContext {
  params: Promise<{ slug: string }>;
}

function extractClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? "unknown";
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(
  request: NextRequest,
  context: CommentRouteContext
): Promise<NextResponse> {
  const { slug } = await context.params;
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide." }, { status: 400 });
  }

  const parsed = PublicCommentCreateSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Commentaire invalide." },
      { status: 400 }
    );
  }

  // Honeypot anti-bot : succès silencieux sans persistance
  if (parsed.data.website.trim().length > 0) {
    return NextResponse.json(
      { ok: true, message: "Commentaire pris en compte." },
      { status: 202 }
    );
  }

  const ipHash = hashIpAddress(extractClientIp(request));
  const rateCheck = commentRateLimiter.consume(ipHash);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      {
        error: "Trop de commentaires envoyés récemment. Réessayez dans quelques minutes.",
        retryAfterSeconds: rateCheck.retryAfterSeconds,
      },
      {
        status: 429,
        headers: { "Retry-After": String(rateCheck.retryAfterSeconds) },
      }
    );
  }

  const db = getDb();
  const [article] = await db
    .select({ id: articles.id })
    .from(articles)
    .where(
      and(
        eq(articles.slug, slug),
        eq(articles.status, "published"),
        isNull(articles.deletedAt)
      )
    )
    .limit(1);

  if (!article) {
    return NextResponse.json({ error: "Article introuvable." }, { status: 404 });
  }

  const emailEncrypted = parsed.data.authorEmail
    ? encryptAES256GCM(parsed.data.authorEmail.toLowerCase())
    : null;

  await db.insert(articleComments).values({
    articleId: article.id,
    authorName: parsed.data.authorName,
    authorEmailEncrypted: emailEncrypted,
    bodySanitized: parsed.data.body,
    ipHashSha256: ipHash,
    moderationStatus: "pending",
  });

  return NextResponse.json(
    {
      ok: true,
      message:
        "Commentaire enregistré. Il sera visible publiquement après validation.",
    },
    { status: 201 }
  );
}

