import Link from "next/link";
import { ArrowRight, Folder as FolderIcon } from "@phosphor-icons/react/dist/ssr";
import { getDictionary, type Locale } from "@/lib/i18n/dictionary";
import type { PublicFolderDTO } from "@/lib/projects/repository";

interface FoldersSectionProps {
  title: string;
  folders: PublicFolderDTO[];
  locale?: Locale;
}

export function FoldersSection({
  title,
  folders,
  locale = "fr",
}: FoldersSectionProps) {
  if (folders.length === 0) return null;
  const t = getDictionary(locale).foldersSection;

  return (
    <section
      aria-label={t.sectionAria}
      className="mx-auto max-w-6xl border-b border-[#E2E8F0] px-4 py-14 md:px-8 md:py-20"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono-tech text-xs uppercase tracking-[0.06em] text-[#0F2942]">
            {t.eyebrow}
          </p>
          <h2 className="font-display mt-2 text-2xl font-bold tracking-[-0.02em] text-[#111111] md:text-3xl">
            {title}
          </h2>
        </div>

        <Link
          href="/projets"
          className="font-mono-tech inline-flex min-h-[44px] items-center gap-2 text-xs font-medium text-[#0F2942] hover:underline"
        >
          {t.allFolders}
          <ArrowRight size={14} weight="bold" aria-hidden="true" />
        </Link>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {folders.map((folder) => (
          <Link
            key={folder.id}
            href={`/projets?dossier=${folder.slug}`}
            className="group flex flex-col justify-between rounded-[8px] border border-[#D5E0EC] bg-[#FFFFFF] p-6 transition-all duration-200 hover:border-[#0F2942] hover:shadow-[0_2px_8px_rgba(15,41,66,0.06)]"
          >
            <div>
              <div className="flex items-center justify-between text-[#0F2942]">
                <FolderIcon
                  size={20}
                  weight="bold"
                  aria-hidden="true"
                  className="text-[#0F2942]"
                />
                <span className="font-mono-tech rounded-full bg-[#EBF1F7] px-2.5 py-0.5 text-[11px] font-medium text-[#0F2942]">
                  {folder.projectCount}{" "}
                  {folder.projectCount > 1 ? t.projectPlural : t.projectSingular}
                </span>
              </div>
              <h3 className="font-display mt-4 text-lg font-bold tracking-[-0.01em] text-[#111111]">
                {folder.name}
              </h3>
              {folder.description ? (
                <p className="mt-2 text-sm leading-relaxed text-[#525252]">
                  {folder.description}
                </p>
              ) : null}
            </div>

            <span className="font-mono-tech mt-6 inline-flex items-center gap-1.5 text-xs text-[#0F2942] group-hover:underline">
              {t.openFolder}
              <ArrowRight size={13} weight="bold" aria-hidden="true" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

