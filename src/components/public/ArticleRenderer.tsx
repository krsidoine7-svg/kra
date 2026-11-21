import { ArrowSquareOut } from "@phosphor-icons/react/dist/ssr";
import { getDictionary, type Locale } from "@/lib/i18n/dictionary";
import type { ArticleBlockSchemaRecord } from "@/lib/db/schema";

interface ArticleRendererProps {
  blocks: readonly ArticleBlockSchemaRecord[];
  locale?: Locale;
}

/**
 * Rendu typographique noir & blanc des blocs d'article (H1–H4, puces, tirets, liens, citations, signature).
 */
export function ArticleRenderer({ blocks, locale = "fr" }: ArticleRendererProps) {
  const t = getDictionary(locale).articleDetail;
  return (
    <div className="space-y-6 text-[#111111]">
      {blocks.map((block) => {
        switch (block.type) {
          case "heading": {
            if (block.level === 1) {
              return (
                <h2
                  key={block.id}
                  data-heading-level="1"
                  className="font-display pt-4 text-3xl font-bold leading-[1.1] tracking-[-0.025em] md:text-4xl"
                >
                  {block.text}
                </h2>
              );
            }
            if (block.level === 2) {
              return (
                <h2
                  key={block.id}
                  data-heading-level="2"
                  className="font-display pt-3 text-2xl font-bold leading-[1.15] tracking-[-0.02em] md:text-3xl"
                >
                  {block.text}
                </h2>
              );
            }
            if (block.level === 3) {
              return (
                <h3
                  key={block.id}
                  data-heading-level="3"
                  className="font-display pt-2 text-xl font-semibold leading-[1.2] tracking-[-0.015em]"
                >
                  {block.text}
                </h3>
              );
            }
            return (
              <h4
                key={block.id}
                data-heading-level="4"
                className="font-display pt-1 text-lg font-semibold leading-[1.3] text-[#2F3437]"
              >
                {block.text}
              </h4>
            );
          }

          case "paragraph":
            return (
              <p
                key={block.id}
                className="text-base leading-[1.78] text-[#2F3437] md:text-[17px]"
              >
                {block.text}
                {block.link ? (
                  <>
                    {" "}
                    <a
                      href={block.link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-medium text-[#111111] underline underline-offset-4 hover:opacity-75"
                    >
                      {block.link.label}
                      <ArrowSquareOut size={13} weight="bold" aria-hidden="true" />
                    </a>
                  </>
                ) : null}
              </p>
            );

          case "bullet_list":
            return (
              <ul
                key={block.id}
                className="list-disc space-y-2 pl-6 text-base leading-[1.7] text-[#2F3437]"
              >
                {block.items.map((item, idx) => (
                  <li key={`${block.id}-${idx}`}>{item}</li>
                ))}
              </ul>
            );

          case "dash_list":
            return (
              <ul
                key={block.id}
                className="space-y-2 pl-1 text-base leading-[1.7] text-[#2F3437]"
              >
                {block.items.map((item, idx) => (
                  <li key={`${block.id}-${idx}`} className="flex items-start gap-3">
                    <span aria-hidden="true" className="select-none font-mono-tech text-[#0F2942]">
                      —
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            );

          case "quote":
            return (
              <blockquote
                key={block.id}
                className="my-6 border-l-2 border-[#0F2942] bg-[#F7F9FC] px-6 py-5"
              >
                <p className="font-editorial text-xl italic leading-[1.5] text-[#111111] md:text-2xl">
                  « {block.text} »
                </p>
                {block.author ? (
                  <footer className="font-mono-tech mt-3 text-xs uppercase tracking-[0.06em] text-[#6B6B6B]">
                    — {block.author}
                  </footer>
                ) : null}
              </blockquote>
            );

          case "signature":
            return (
              <footer
                key={block.id}
                aria-label={t.signatureAria}
                className="mt-10 border-t border-[#EAEAEA] pt-6"
              >
                <p className="font-editorial text-2xl italic text-[#111111]">
                  {block.name}
                </p>
                <p className="font-mono-tech mt-1 text-xs uppercase tracking-[0.06em] text-[#6B6B6B]">
                  {[block.role, block.city, block.date].filter(Boolean).join(" · ")}
                </p>
              </footer>
            );
        }
      })}
    </div>
  );
}

