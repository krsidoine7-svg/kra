"use client";

import * as React from "react";
import Image from "next/image";
import { X } from "@phosphor-icons/react";
import { LazyVideoPlayer } from "@/components/public/LazyVideoPlayer";
import { getDictionary, type Locale } from "@/lib/i18n/dictionary";
import type { PublicMediaDTO } from "@/lib/projects/repository";

interface ProjectGalleryProps {
  title: string;
  media: PublicMediaDTO[];
  locale?: Locale;
}

export function ProjectGallery({
  title,
  media,
  locale = "fr",
}: ProjectGalleryProps) {
  const t = getDictionary(locale).gallery;
  const images = media.filter((item) => item.mediaType === "image" && item.url);
  const videos = media.filter((item) => item.mediaType === "video" && item.url);
  const [selected, setSelected] = React.useState<PublicMediaDTO | null>(null);

  if (images.length === 0 && videos.length === 0) {
    return null;
  }

  return (
    <section aria-label={t.sectionAria} className="mt-10 space-y-8">
      {videos.length > 0 ? (
        <div className="space-y-4">
          <p className="font-mono-tech text-xs uppercase tracking-[0.06em] text-[#6B6B6B]">
            [ {videos.length > 1 ? t.videosPlural : t.videosSingular} ·{" "}
            {videos.length} {t.onDemandTag} ]
          </p>
          <div className="space-y-5">
            {videos.map((video, idx) => (
              <LazyVideoPlayer
                key={video.id}
                src={video.url}
                posterUrl={video.posterUrl}
                lqipBase64={video.lqipBase64}
                title={video.altText || `${title} — ${idx + 1}`}
                locale={locale}
              />
            ))}
          </div>
        </div>
      ) : null}

      {images.length > 0 ? (
        <div className="space-y-4">
          <p className="font-mono-tech text-xs uppercase tracking-[0.06em] text-[#6B6B6B]">
            [ GALERIE · {images.length}{" "}
            {images.length > 1 ? t.photosPlural : t.photosSingular} ]
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            {images.map((item, idx) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelected(item)}
                className="group relative aspect-[16/10] w-full overflow-hidden rounded-[6px] border border-[#EAEAEA] bg-[#FFFFFF] text-left"
              >
                <Image
                  src={item.url}
                  alt={item.altText || `${title} — image ${idx + 1}`}
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                  placeholder={item.lqipBase64 ? "blur" : "empty"}
                  blurDataURL={item.lqipBase64 ?? undefined}
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                />
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {selected ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t.previewDialogAria}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F2942]/90 p-4"
          onClick={() => setSelected(null)}
        >
          <button
            type="button"
            aria-label={t.closePreviewAria}
            onClick={() => setSelected(null)}
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-[4px] border border-[#2B547B] bg-[#0F2942] text-white hover:bg-[#183D61]"
          >
            <X size={20} weight="bold" aria-hidden="true" />
          </button>
          <div
            className="relative max-h-[85vh] w-full max-w-4xl aspect-[16/10]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={selected.url}
              alt={selected.altText || title}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>
        </div>
      ) : null}
    </section>
  );
}

