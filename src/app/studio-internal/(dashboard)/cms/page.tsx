import { getCmsSnapshot } from "@/lib/cms/repository";
import { CmsEditorClient } from "@/components/dashboard/CmsEditorClient";

export const dynamic = "force-dynamic";

export default async function StudioCmsPage() {
  const snapshot = await getCmsSnapshot({ includeHidden: true });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-[-0.02em] text-[var(--dash-text)]">
          CMS du Site Public
        </h1>
        <p className="mt-1 text-sm text-[var(--dash-muted)]">
          Modifiez librement tous les textes, titres de sections, images, logos et réseaux sociaux.
        </p>
      </div>

      <CmsEditorClient initialSnapshot={snapshot} />
    </div>
  );
}

