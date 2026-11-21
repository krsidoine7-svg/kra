"use client";

import * as React from "react";
import { ChatText, CheckCircle } from "@phosphor-icons/react";
import { getDictionary, type Locale } from "@/lib/i18n/dictionary";
import type { PublicArticleCommentDTO } from "@/lib/articles/repository";

interface ArticleCommentsSectionProps {
  slug: string;
  initialComments: readonly PublicArticleCommentDTO[];
  locale?: Locale;
}

export function ArticleCommentsSection({
  slug,
  initialComments,
  locale = "fr",
}: ArticleCommentsSectionProps) {
  const t = getDictionary(locale).comments;
  const dateLocale = locale === "en" ? "en-GB" : "fr-FR";
  const [authorName, setAuthorName] = React.useState("");
  const [authorEmail, setAuthorEmail] = React.useState("");
  const [body, setBody] = React.useState("");
  const [website, setWebsite] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);
    setSubmitting(true);

    try {
      const response = await fetch(`/api/public/articles/${slug}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorName,
          authorEmail,
          body,
          website,
        }),
      });
      const data = (await response.json()) as {
        ok?: boolean;
        message?: string;
        error?: string;
      };

      if (!response.ok || !data.ok) {
        setFeedback({
          type: "error",
          message: data.error ?? t.sendError,
        });
        return;
      }

      setAuthorName("");
      setAuthorEmail("");
      setBody("");
      setFeedback({
        type: "success",
        message: data.message ?? t.defaultSuccess,
      });
    } catch {
      setFeedback({
        type: "error",
        message: t.networkError,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section
      aria-label={t.sectionAria}
      className="mt-14 border-t border-[#EAEAEA] pt-10 space-y-8"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-mono-tech text-xs uppercase tracking-[0.06em] text-[#6B6B6B]">
            [ {t.eyebrow} · {initialComments.length} ]
          </p>
          <h2 className="font-display mt-1 text-2xl font-bold tracking-[-0.02em] text-[#111111]">
            {t.heading}
          </h2>
        </div>
        <ChatText size={20} weight="bold" className="text-[#525252]" aria-hidden="true" />
      </div>

      {initialComments.length === 0 ? (
        <p className="text-sm text-[#525252]">{t.emptyText}</p>
      ) : (
        <div className="divide-y divide-[#EAEAEA] rounded-[6px] border border-[#EAEAEA] bg-[#FFFFFF]">
          {initialComments.map((comment) => (
            <div key={comment.id} className="p-5 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-[#111111]">
                  {comment.authorName}
                </p>
                <span className="font-mono-tech text-[11px] text-[#6B6B6B]">
                  {new Date(comment.createdAt).toLocaleDateString(dateLocale, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-[#2F3437]">
                {comment.bodySanitized}
              </p>
            </div>
          ))}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="rounded-[6px] border border-[#EAEAEA] bg-[#FFFFFF] p-6 space-y-4"
      >
        <div>
          <h3 className="font-display text-lg font-bold text-[#111111]">
            {t.formHeading}
          </h3>
          <p className="mt-1 text-xs text-[#525252]">{t.privacyNotice}</p>
        </div>

        {feedback ? (
          <div
            role="status"
            className={
              feedback.type === "success"
                ? "flex items-center gap-2 rounded-[4px] border border-[#0F2942] bg-[#EBF1F7] px-3 py-2 text-xs text-[#111111]"
                : "rounded-[4px] border border-[#991B1B] bg-[#FEF2F2] px-3 py-2 text-xs text-[#991B1B]"
            }
          >
            {feedback.type === "success" ? (
              <CheckCircle size={15} weight="bold" aria-hidden="true" className="text-[#0F2942]" />
            ) : null}
            <span>{feedback.message}</span>
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label
              htmlFor="comment-author-name"
              className="block text-xs font-medium text-[#111111]"
            >
              {t.nameLabel}
            </label>
            <input
              id="comment-author-name"
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              required
              minLength={2}
              maxLength={80}
              placeholder={t.namePlaceholder}
              className="h-10 w-full rounded-[4px] border border-[#D5E0EC] bg-[#FFFFFF] px-3 text-sm text-[#111111] focus:border-[#0F2942] focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="comment-author-email"
              className="block text-xs font-medium text-[#111111]"
            >
              {t.emailLabel}
            </label>
            <input
              id="comment-author-email"
              type="email"
              value={authorEmail}
              onChange={(e) => setAuthorEmail(e.target.value)}
              placeholder={t.emailPlaceholder}
              className="h-10 w-full rounded-[4px] border border-[#D5E0EC] bg-[#FFFFFF] px-3 text-sm text-[#111111] focus:border-[#0F2942] focus:outline-none"
            />
          </div>
        </div>

        {/* Honeypot invisible */}
        <div aria-hidden="true" className="hidden">
          <label htmlFor="comment-website">Site web</label>
          <input
            id="comment-website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="comment-body"
            className="block text-xs font-medium text-[#111111]"
          >
            {t.bodyLabel}
          </label>
          <textarea
            id="comment-body"
            rows={4}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
            minLength={3}
            maxLength={1500}
            placeholder={t.bodyPlaceholder}
            className="w-full rounded-[4px] border border-[#D5E0EC] bg-[#FFFFFF] p-3 text-sm text-[#111111] focus:border-[#0F2942] focus:outline-none"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-11 items-center rounded-[6px] bg-[#0F2942] px-5 text-sm font-medium text-[#FFFFFF] transition-colors hover:bg-[#183D61] disabled:opacity-50"
          >
            {submitting ? t.submittingBtn : t.submitBtn}
          </button>
        </div>
      </form>
    </section>
  );
}

