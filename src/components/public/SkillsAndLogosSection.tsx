import Image from "next/image";
import type { PublicLogoItem, PublicSkillItem } from "@/lib/cms/repository";
import { buildPublicMediaUrl } from "@/lib/storage/s3";

interface SkillsAndLogosSectionProps {
  skillsTitle: string;
  skills: PublicSkillItem[];
  logosTitle: string;
  logos: PublicLogoItem[];
}

export function SkillsAndLogosSection({
  skillsTitle,
  skills,
  logosTitle,
  logos,
}: SkillsAndLogosSectionProps) {
  return (
    <section className="mx-auto max-w-6xl border-b border-[#E2E8F0] px-4 py-14 md:px-8 md:py-20">
      {/* Champs d'intervention (4 colonnes) */}
      {skills.length > 0 ? (
        <div>
          <h2 className="font-display text-xl font-bold tracking-[-0.02em] text-[#111111] md:text-2xl">
            {skillsTitle}
          </h2>
          <div className="mt-6 grid divide-y divide-[#E2E8F0] border-y border-[#E2E8F0] md:grid-cols-4 md:divide-x md:divide-y-0">
            {skills.map((skill, idx) => (
              <div key={skill.id} className="py-5 md:px-5 md:first:pl-0 md:last:pr-0">
                <span className="font-mono-tech text-[11px] font-medium tracking-[0.06em] text-[#0F2942]">
                  0{idx + 1}
                </span>
                <h3 className="mt-1.5 text-sm font-semibold text-[#111111]">
                  {skill.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#525252]">
                  {skill.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Bandeau Logos Clients / Partenaires / Outils */}
      {logos.length > 0 ? (
        <div className="mt-12 md:mt-16">
          <p className="font-mono-tech text-xs uppercase tracking-[0.06em] text-[#0F2942]">
            [ {logosTitle} ]
          </p>
          <div className="mt-4 grid grid-cols-2 border-l border-t border-[#E2E8F0] sm:grid-cols-4">
            {logos.map((logo) => {
              const imageUrl = logo.objectKey
                ? buildPublicMediaUrl(logo.objectKey)
                : "";
              const inner = (
                <div className="flex h-20 items-center justify-center border-b border-r border-[#E2E8F0] bg-[#FFFFFF] px-4 text-center">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={logo.name}
                      width={120}
                      height={40}
                      className="max-h-9 w-auto object-contain grayscale"
                    />
                  ) : (
                    <span className="font-display text-sm font-bold tracking-[-0.01em] text-[#525252]">
                      {logo.name}
                    </span>
                  )}
                </div>
              );

              if (logo.websiteUrl) {
                return (
                  <a
                    key={logo.id}
                    href={logo.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-opacity hover:opacity-75"
                  >
                    {inner}
                  </a>
                );
              }
              return <div key={logo.id}>{inner}</div>;
            })}
          </div>
        </div>
      ) : null}
    </section>
  );
}

