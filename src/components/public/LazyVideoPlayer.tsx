"use client";

import * as React from "react";
import Image from "next/image";
import { Play, SpinnerGap, Warning } from "@phosphor-icons/react";
import { getDictionary, type Locale } from "@/lib/i18n/dictionary";

interface LazyVideoPlayerProps {
  src: string;
  posterUrl: string | null;
  lqipBase64: string | null;
  title: string;
  locale?: Locale;
}

/**
 * Lecteur vidéo optimisé réseau faible (Côte d'Ivoire 3G) :
 * aucun octet vidéo n'est téléchargé tant que l'utilisateur n'a pas cliqué sur Lecture.
 */
export function LazyVideoPlayer({
  src,
  posterUrl,
  lqipBase64,
  title,
  locale = "fr",
}: LazyVideoPlayerProps) {
  const t = getDictionary(locale).videoPlayer;
  const [activated, setActivated] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [failed, setFailed] = React.useState(false);

  if (!activated) {
    return (
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[6px] border border-[#D5E0EC] bg-[#0F2942]">
        {posterUrl ? (
          <Image
            src={posterUrl}
            alt={`${t.previewAltPrefix} ${title}`}
            fill
            sizes="(max-width: 768px) 100vw, 800px"
            placeholder={lqipBase64 ? "blur" : "empty"}
            blurDataURL={lqipBase64 ?? undefined}
            className="object-cover opacity-90"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#143554]">
            <span className="font-mono-tech text-xs uppercase tracking-[0.08em] text-[#B8CCE0]">
              {t.modeBadge}
            </span>
          </div>
        )}

        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0F2942]/45 p-4 text-center">
          <button
            type="button"
            onClick={() => {
              setFailed(false);
              setLoading(true);
              setActivated(true);
            }}
            aria-label={`${t.playAriaPrefix} ${title}`}
            className="inline-flex h-12 items-center gap-2.5 rounded-[6px] bg-[#FFFFFF] px-5 text-sm font-medium text-[#111111] transition-colors hover:bg-[#EBF1F7]"
          >
            <Play size={16} weight="fill" aria-hidden="true" className="text-[#0F2942]" />
            {t.playButton}
          </button>
          <span className="font-mono-tech mt-2 text-[11px] uppercase tracking-[0.06em] text-[#EBF1F7]">
            {t.streamingHint}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[6px] border border-[#D5E0EC] bg-[#0F2942]">
      {loading ? (
        <div
          role="status"
          className="pointer-events-none absolute inset-x-0 top-3 z-10 flex justify-center"
        >
          <span className="font-mono-tech inline-flex items-center gap-1.5 rounded-[4px] bg-[#0F2942]/95 px-3 py-1 text-[11px] text-[#FFFFFF]">
            <SpinnerGap size={13} className="animate-spin" aria-hidden="true" />
            {t.loadingWeakNetwork}
          </span>
        </div>
      ) : null}

      {failed ? (
        <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center text-[#FFFFFF]">
          <Warning size={22} weight="bold" aria-hidden="true" />
          <p className="text-sm text-[#D5E3F0]">{t.errorText}</p>
          <button
            type="button"
            onClick={() => {
              setFailed(false);
              setLoading(true);
            }}
            className="rounded-[4px] border border-[#FFFFFF] px-4 py-1.5 text-xs font-medium hover:bg-[#FFFFFF] hover:text-[#111111]"
          >
            {t.retry}
          </button>
        </div>
      ) : (
        <video
          src={src}
          poster={posterUrl ?? undefined}
          controls
          playsInline
          autoPlay
          preload="metadata"
          onCanPlay={() => setLoading(false)}
          onWaiting={() => setLoading(true)}
          onError={() => {
            setLoading(false);
            setFailed(true);
          }}
          className="h-full w-full bg-[#0F2942] object-contain"
        />
      )}
    </div>
  );
}

