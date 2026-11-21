import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { getCmsSnapshot, saveCmsSection } from "@/lib/cms/repository";
import { withAdminAuth } from "@/lib/security/with-admin-auth";
import { CmsSectionKeySchema } from "@/lib/validators/cms";

type RouteContext = { params: Promise<{ sectionKey: string }> };

export const GET = withAdminAuth<RouteContext>(
  async (_request, _session, context) => {
    const { sectionKey } = await context.params;
    const keyParsed = CmsSectionKeySchema.safeParse(sectionKey);
    if (!keyParsed.success) {
      return NextResponse.json(
        { error: "Clé de section CMS inconnue." },
        { status: 400 }
      );
    }

    const snapshot = await getCmsSnapshot({ includeHidden: true });
    const map = {
      header: snapshot.header,
      hero: snapshot.hero,
      about: snapshot.about,
      socials: snapshot.socials,
      section_titles: snapshot.sectionTitles,
    };

    return NextResponse.json({
      sectionKey: keyParsed.data,
      payload: map[keyParsed.data],
    });
  }
);

export const PUT = withAdminAuth<RouteContext>(
  async (request, session, context) => {
    const { sectionKey } = await context.params;
    const keyParsed = CmsSectionKeySchema.safeParse(sectionKey);
    if (!keyParsed.success) {
      return NextResponse.json(
        { error: "Clé de section CMS inconnue." },
        { status: 400 }
      );
    }

    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json({ error: "JSON invalide." }, { status: 400 });
    }

    try {
      const saved = await saveCmsSection({
        sectionKey: keyParsed.data,
        payload: rawBody,
        adminId: session.adminId,
      });

      return NextResponse.json({
        ok: true,
        sectionKey: keyParsed.data,
        checksumSha256: saved.checksumSha256,
        payload: saved.payload,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return NextResponse.json(
          { error: error.issues[0]?.message ?? "Payload CMS invalide." },
          { status: 400 }
        );
      }
      throw error;
    }
  }
);

