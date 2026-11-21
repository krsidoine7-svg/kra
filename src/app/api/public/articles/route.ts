import { NextResponse, type NextRequest } from "next/server";
import { listPublicArticles } from "@/lib/articles/repository";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const q = searchParams.get("q") ?? undefined;
  const tag = searchParams.get("tag") ?? undefined;

  const items = await listPublicArticles({ q, tag });
  return NextResponse.json({ items });
}

