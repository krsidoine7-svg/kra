"use client";

import * as React from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  Plus,
  Trash,
  X,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { ProjectShareMenu } from "@/components/public/ProjectShareMenu";
import { slugify } from "@/lib/utils";
import type { ArticleBlockSchemaRecord } from "@/lib/db/schema";

export interface DashboardArticleRow {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  status: "draft" | "published" | "archived";
  blocks: ArticleBlockSchemaRecord[];
  tags: string[];
  readingMinutes: number;
}

export interface DashboardCommentRow {
  id: string;
  articleId: string;
  articleTitle: string;
  articleSlug: string;
  authorName: string;
  bodySanitized: string;
  moderationStatus: "pending" | "approved" | "rejected";
  createdAt: string;
}

interface ArticlesManagerClientProps {
  initialArticles: DashboardArticleRow[];
  initialComments?: DashboardCommentRow[];
}

const DRAFT_STORAGE_KEY = "kra_article_draft_v1";

function newBlockId(): string {
  return `blk-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function ArticlesManagerClient({
  initialArticles,
  initialComments = [],
}: ArticlesManagerClientProps) {
  const [activeTab, setActiveTab] = React.useState<"articles" | "comments">(
    "articles"
  );
  const [articles, setArticles] =
    React.useState<DashboardArticleRow[]>(initialArticles);
  const [comments, setComments] =
    React.useState<DashboardCommentRow[]>(initialComments);
  const [commentFilter, setCommentFilter] = React.useState<
    "all" | "pending" | "approved" | "rejected"
  >("pending");
  const [showEditor, setShowEditor] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);

  const [title, setTitle] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [excerpt, setExcerpt] = React.useState("");
  const [status, setStatus] =
    React.useState<DashboardArticleRow["status"]>("published");
  const [tagsRaw, setTagsRaw] = React.useState("");
  const [blocks, setBlocks] = React.useState<ArticleBlockSchemaRecord[]>([
    { id: "init-1", type: "heading", level: 2, text: "" },
    { id: "init-2", type: "paragraph", text: "" },
  ]);

  const [saving, setSaving] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [hasLocalDraft, setHasLocalDraft] = React.useState(false);

  React.useEffect(() => {
    try {
      const saved = window.localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) setHasLocalDraft(true);
    } catch {
      // Storage indisponible
    }
  }, []);

  React.useEffect(() => {
    if (!showEditor || editingId) return;
    if (!title && !excerpt) return;
    try {
      window.localStorage.setItem(
        DRAFT_STORAGE_KEY,
        JSON.stringify({ title, slug, excerpt, status, tagsRaw, blocks })
      );
      setHasLocalDraft(true);
    } catch {
      // Ignorer quota
    }
  }, [showEditor, editingId, title, slug, excerpt, status, tagsRaw, blocks]);

  function restoreLocalDraft() {
    try {
      const raw = window.localStorage.getItem(DRAFT_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as {
        title?: string;
        slug?: string;
        excerpt?: string;
        status?: DashboardArticleRow["status"];
        tagsRaw?: string;
        blocks?: ArticleBlockSchemaRecord[];
      };
      setEditingId(null);
      setTitle(parsed.title ?? "");
      setSlug(parsed.slug ?? "");
      setExcerpt(parsed.excerpt ?? "");
      setStatus(parsed.status ?? "draft");
      setTagsRaw(parsed.tagsRaw ?? "");
      if (Array.isArray(parsed.blocks) && parsed.blocks.length > 0) {
        setBlocks(parsed.blocks);
      }
      setShowEditor(true);
    } catch {
      setHasLocalDraft(false);
    }
  }

  function startEditArticle(article: DashboardArticleRow) {
    setEditingId(article.id);
    setTitle(article.title);
    setSlug(article.slug);
    setExcerpt(article.excerpt);
    setStatus(article.status);
    setTagsRaw(article.tags.join(", "));
    setBlocks(article.blocks);
    setErrorMsg(null);
    setShowEditor(true);
  }

  function resetForm() {
    setEditingId(null);
    setTitle("");
    setSlug("");
    setExcerpt("");
    setStatus("published");
    setTagsRaw("");
    setBlocks([
      { id: newBlockId(), type: "heading", level: 2, text: "" },
      { id: newBlockId(), type: "paragraph", text: "" },
    ]);
    setErrorMsg(null);
  }

  function addBlock(type: ArticleBlockSchemaRecord["type"]) {
    const id = newBlockId();
    if (type === "heading") {
      setBlocks((prev) => [...prev, { id, type: "heading", level: 2, text: "" }]);
    } else if (type === "paragraph") {
      setBlocks((prev) => [...prev, { id, type: "paragraph", text: "" }]);
    } else if (type === "bullet_list") {
      setBlocks((prev) => [...prev, { id, type: "bullet_list", items: [""] }]);
    } else if (type === "dash_list") {
      setBlocks((prev) => [...prev, { id, type: "dash_list", items: [""] }]);
    } else if (type === "quote") {
      setBlocks((prev) => [...prev, { id, type: "quote", text: "", author: "Manu KRA" }]);
    } else if (type === "signature") {
      setBlocks((prev) => [
        ...prev,
        {
          id,
          type: "signature",
          name: "Manu KRA",
          role: "Communication & Économie",
          city: "Abidjan",
          date: "2026",
        },
      ]);
    }
  }

  function moveBlock(index: number, delta: -1 | 1) {
    const target = index + delta;
    if (target < 0 || target >= blocks.length) return;
    setBlocks((prev) => {
      const next = [...prev];
      const currentItem = next[index];
      const targetItem = next[target];
      if (!currentItem || !targetItem) return prev;
      next[index] = targetItem;
      next[target] = currentItem;
      return next;
    });
  }

  function removeBlock(index: number) {
    setBlocks((prev) => prev.filter((_, idx) => idx !== index));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMsg(null);
    setSaving(true);

    const parsedTags = tagsRaw
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const cleanBlocks = blocks.map((block) => {
      if (block.type === "paragraph" && block.link && !block.link.url.trim()) {
        return { id: block.id, type: "paragraph" as const, text: block.text };
      }
      if (block.type === "bullet_list" || block.type === "dash_list") {
        return {
          ...block,
          items: block.items.map((item) => item.trim()).filter(Boolean),
        };
      }
      return block;
    });

    try {
      const endpoint = editingId
        ? `/api/admin/articles/${editingId}`
        : "/api/admin/articles";
      const method = editingId ? "PATCH" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug: slug || slugify(title),
          excerpt,
          status,
          tags: parsedTags,
          blocks: cleanBlocks,
        }),
      });

      const data = (await response.json()) as {
        ok?: boolean;
        item?: DashboardArticleRow;
        error?: string;
      };

      if (!response.ok || !data.ok || !data.item) {
        setErrorMsg(data.error ?? "Impossible d'enregistrer l'article.");
        return;
      }

      if (editingId) {
        setArticles((prev) =>
          prev.map((a) => (a.id === editingId ? data.item! : a))
        );
      } else {
        setArticles((prev) => [data.item!, ...prev]);
        try {
          window.localStorage.removeItem(DRAFT_STORAGE_KEY);
          setHasLocalDraft(false);
        } catch {
          // Ignorer
        }
      }

      setShowEditor(false);
      resetForm();
    } catch {
      setErrorMsg("Erreur réseau. Votre brouillon local reste conservé.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSoftDelete(id: string) {
    const response = await fetch(`/api/admin/articles/${id}`, {
      method: "DELETE",
    });
    if (response.ok) {
      setArticles((prev) => prev.filter((item) => item.id !== id));
    }
  }

  async function handleModerateComment(
    commentId: string,
    moderationStatus: "approved" | "rejected"
  ) {
    const response = await fetch(`/api/admin/comments/${commentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ moderationStatus }),
    });
    if (response.ok) {
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId ? { ...c, moderationStatus } : c
        )
      );
    }
  }

  async function handleDeleteComment(commentId: string) {
    const response = await fetch(`/api/admin/comments/${commentId}`, {
      method: "DELETE",
    });
    if (response.ok) {
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    }
  }

  const pendingCount = comments.filter(
    (c) => c.moderationStatus === "pending"
  ).length;
  const filteredComments =
    commentFilter === "all"
      ? comments
      : comments.filter((c) => c.moderationStatus === commentFilter);

  const inputClass =
    "h-9 w-full rounded-[6px] border border-[var(--dash-border)] bg-[var(--dash-surface)] px-3 text-sm text-[var(--dash-text)] focus:border-[var(--dash-text)] focus:outline-none";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--dash-border)] pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("articles")}
            className={
              activeTab === "articles"
                ? "rounded-[6px] bg-[#111111] px-3 py-1.5 text-xs font-medium text-white"
                : "rounded-[6px] border border-[var(--dash-border)] px-3 py-1.5 text-xs text-[var(--dash-muted)]"
            }
          >
            Articles ({articles.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("comments")}
            className={
              activeTab === "comments"
                ? "rounded-[6px] bg-[#111111] px-3 py-1.5 text-xs font-medium text-white"
                : "rounded-[6px] border border-[var(--dash-border)] px-3 py-1.5 text-xs text-[var(--dash-muted)]"
            }
          >
            Modération commentaires ({pendingCount} en attente)
          </button>
        </div>

        {activeTab === "articles" ? (
          <div className="flex flex-wrap items-center gap-2">
            {hasLocalDraft && !showEditor ? (
              <button
                type="button"
                onClick={restoreLocalDraft}
                className="rounded-[6px] border border-[var(--dash-border)] px-2.5 py-1 text-xs text-[var(--dash-text)] hover:bg-[var(--dash-active)]"
              >
                Restaurer le brouillon local
              </button>
            ) : null}

            <Button
              type="button"
              onClick={() => {
                if (showEditor) {
                  setShowEditor(false);
                  resetForm();
                } else {
                  resetForm();
                  setShowEditor(true);
                }
              }}
            >
              <Plus size={15} weight="bold" aria-hidden="true" />
              {showEditor ? "Fermer l'éditeur" : "Nouvel article"}
            </Button>
          </div>
        ) : null}
      </div>

      {activeTab === "comments" ? (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {(["pending", "approved", "rejected", "all"] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setCommentFilter(st)}
                className={
                  commentFilter === st
                    ? "rounded-[6px] bg-[var(--dash-active)] px-3 py-1.5 text-xs font-medium text-[var(--dash-text)]"
                    : "rounded-[6px] border border-[var(--dash-border)] px-3 py-1.5 text-xs text-[var(--dash-muted)]"
                }
              >
                {st === "pending"
                  ? "En attente"
                  : st === "approved"
                    ? "Approuvés"
                    : st === "rejected"
                      ? "Rejetés"
                      : "Tous"}
              </button>
            ))}
          </div>

          <div className="divide-y divide-[var(--dash-border)] rounded-[8px] border border-[var(--dash-border)] bg-[var(--dash-surface)]">
            {filteredComments.length === 0 ? (
              <p className="p-6 text-sm text-[var(--dash-muted)]">
                Aucun commentaire dans cette file.
              </p>
            ) : (
              filteredComments.map((comment) => (
                <div
                  key={comment.id}
                  className="flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-start"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-[var(--dash-text)]">
                        {comment.authorName}
                      </span>
                      <span className="font-mono-tech text-[11px] text-[var(--dash-muted)]">
                        sur {comment.articleTitle}
                      </span>
                      <span className="rounded-full bg-[var(--dash-active)] px-2 py-0.5 text-[10px] uppercase text-[var(--dash-text)]">
                        {comment.moderationStatus}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--dash-text)]">
                      {comment.bodySanitized}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {comment.moderationStatus !== "approved" ? (
                      <button
                        type="button"
                        onClick={() =>
                          void handleModerateComment(comment.id, "approved")
                        }
                        aria-label={`Approuver le commentaire de ${comment.authorName}`}
                        className="inline-flex h-8 items-center gap-1 rounded-[6px] border border-[var(--dash-border)] px-2.5 text-xs text-[var(--dash-text)] hover:bg-[var(--dash-active)]"
                      >
                        <Check size={13} weight="bold" aria-hidden="true" />
                        Approuver
                      </button>
                    ) : null}
                    {comment.moderationStatus !== "rejected" ? (
                      <button
                        type="button"
                        onClick={() =>
                          void handleModerateComment(comment.id, "rejected")
                        }
                        aria-label={`Rejeter le commentaire de ${comment.authorName}`}
                        className="inline-flex h-8 items-center gap-1 rounded-[6px] border border-[var(--dash-border)] px-2.5 text-xs text-[var(--dash-muted)] hover:bg-[var(--dash-active)]"
                      >
                        <X size={13} weight="bold" aria-hidden="true" />
                        Rejeter
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => void handleDeleteComment(comment.id)}
                      aria-label={`Supprimer le commentaire de ${comment.authorName}`}
                      className="flex h-8 w-8 items-center justify-center rounded-[6px] text-[var(--dash-muted)] hover:bg-[var(--dash-active)]"
                    >
                      <Trash size={14} weight="bold" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}

      {activeTab === "articles" && showEditor ? (
        <form
          onSubmit={handleSubmit}
          className="rounded-[8px] border border-[var(--dash-border)] bg-[var(--dash-surface)] p-5 space-y-5"
        >
          <h2 className="text-base font-medium text-[var(--dash-text)]">
            {editingId ? "Modifier l'article" : "Rédiger un article structuré"}
          </h2>

          {errorMsg ? (
            <p role="alert" className="text-sm text-[var(--p-red-fg)]">
              {errorMsg}
            </p>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--dash-muted)]">
                Titre principal
              </label>
              <input
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (!editingId) setSlug(slugify(e.target.value));
                }}
                required
                className={inputClass}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--dash-muted)]">
                Slug partageable
              </label>
              <input
                value={slug}
                onChange={(e) => setSlug(slugify(e.target.value))}
                required
                className={`${inputClass} font-mono-tech`}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--dash-muted)]">
                Statut de publication
              </label>
              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as DashboardArticleRow["status"])
                }
                className={inputClass}
              >
                <option value="published">Publié</option>
                <option value="draft">Brouillon</option>
                <option value="archived">Archivé</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--dash-muted)]">
                Tags (séparés par virgule)
              </label>
              <input
                value={tagsRaw}
                onChange={(e) => setTagsRaw(e.target.value)}
                placeholder="Économie, Communication, Abidjan"
                className={inputClass}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[var(--dash-muted)]">
              Résumé introductif
            </label>
            <textarea
              rows={2}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              required
              className="w-full rounded-[6px] border border-[var(--dash-border)] bg-[var(--dash-surface)] p-3 text-sm text-[var(--dash-text)] focus:border-[var(--dash-text)] focus:outline-none"
            />
          </div>

          {/* Éditeur de blocs */}
          <div className="space-y-3 border-t border-[var(--dash-border)] pt-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-medium text-[var(--dash-muted)]">
                Blocs éditoriaux ({blocks.length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                <Button type="button" size="sm" variant="outline" onClick={() => addBlock("heading")}>
                  + Titre H1-H4
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={() => addBlock("paragraph")}>
                  + Paragraphe &amp; Lien
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={() => addBlock("bullet_list")}>
                  + Liste à puces
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={() => addBlock("dash_list")}>
                  + Liste à tirets
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={() => addBlock("quote")}>
                  + Citation
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={() => addBlock("signature")}>
                  + Signature
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {blocks.map((block, index) => (
                <div
                  key={block.id}
                  className="rounded-[6px] border border-[var(--dash-border)] p-3.5 space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono-tech text-[11px] uppercase text-[var(--dash-muted)]">
                      {block.type === "heading"
                        ? `Titre H${block.level}`
                        : block.type === "paragraph"
                          ? "Paragraphe & Lien"
                          : block.type === "bullet_list"
                            ? "Liste à puces"
                            : block.type === "dash_list"
                              ? "Liste à tirets"
                              : block.type === "quote"
                                ? "Citation"
                                : "Signature"}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        aria-label="Monter le bloc"
                        onClick={() => moveBlock(index, -1)}
                        className="flex h-7 w-7 items-center justify-center rounded-[4px] hover:bg-[var(--dash-active)]"
                      >
                        <ArrowUp size={13} weight="bold" />
                      </button>
                      <button
                        type="button"
                        aria-label="Descendre le bloc"
                        onClick={() => moveBlock(index, 1)}
                        className="flex h-7 w-7 items-center justify-center rounded-[4px] hover:bg-[var(--dash-active)]"
                      >
                        <ArrowDown size={13} weight="bold" />
                      </button>
                      <button
                        type="button"
                        aria-label="Retirer le bloc"
                        onClick={() => removeBlock(index)}
                        className="flex h-7 w-7 items-center justify-center rounded-[4px] hover:bg-[var(--dash-active)]"
                      >
                        <Trash size={13} weight="bold" />
                      </button>
                    </div>
                  </div>

                  {block.type === "heading" ? (
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <select
                        value={block.level}
                        onChange={(e) => {
                          const lvl = Number(e.target.value) as 1 | 2 | 3 | 4;
                          setBlocks((prev) =>
                            prev.map((b, i) =>
                              i === index && b.type === "heading"
                                ? { ...b, level: lvl }
                                : b
                            )
                          );
                        }}
                        className="h-9 w-24 rounded-[6px] border border-[var(--dash-border)] bg-[var(--dash-surface)] px-2 text-xs"
                      >
                        <option value={1}>H1</option>
                        <option value={2}>H2</option>
                        <option value={3}>H3</option>
                        <option value={4}>H4</option>
                      </select>
                      <input
                        value={block.text}
                        placeholder="Texte du titre..."
                        onChange={(e) =>
                          setBlocks((prev) =>
                            prev.map((b, i) =>
                              i === index && b.type === "heading"
                                ? { ...b, text: e.target.value }
                                : b
                            )
                          )
                        }
                        required
                        className={inputClass}
                      />
                    </div>
                  ) : null}

                  {block.type === "paragraph" ? (
                    <div className="space-y-2">
                      <textarea
                        rows={3}
                        value={block.text}
                        placeholder="Contenu du paragraphe..."
                        onChange={(e) =>
                          setBlocks((prev) =>
                            prev.map((b, i) =>
                              i === index && b.type === "paragraph"
                                ? { ...b, text: e.target.value }
                                : b
                            )
                          )
                        }
                        required
                        className="w-full rounded-[6px] border border-[var(--dash-border)] bg-[var(--dash-surface)] p-2.5 text-sm"
                      />
                      <div className="grid gap-2 sm:grid-cols-2">
                        <input
                          value={block.link?.label ?? ""}
                          placeholder="Libellé du lien (optionnel)"
                          onChange={(e) =>
                            setBlocks((prev) =>
                              prev.map((b, i) =>
                                i === index && b.type === "paragraph"
                                  ? {
                                      ...b,
                                      link: {
                                        label: e.target.value,
                                        url: b.link?.url ?? "",
                                      },
                                    }
                                  : b
                              )
                            )
                          }
                          className={inputClass}
                        />
                        <input
                          value={block.link?.url ?? ""}
                          placeholder="https://... (optionnel)"
                          onChange={(e) =>
                            setBlocks((prev) =>
                              prev.map((b, i) =>
                                i === index && b.type === "paragraph"
                                  ? {
                                      ...b,
                                      link: {
                                        label: b.link?.label ?? "En savoir plus",
                                        url: e.target.value,
                                      },
                                    }
                                  : b
                              )
                            )
                          }
                          className={inputClass}
                        />
                      </div>
                    </div>
                  ) : null}

                  {block.type === "bullet_list" || block.type === "dash_list" ? (
                    <textarea
                      rows={3}
                      value={block.items.join("\n")}
                      placeholder="Un élément par ligne..."
                      onChange={(e) => {
                        const lines = e.target.value.split("\n");
                        setBlocks((prev) =>
                          prev.map((b, i) =>
                            i === index &&
                            (b.type === "bullet_list" || b.type === "dash_list")
                              ? { ...b, items: lines }
                              : b
                          )
                        );
                      }}
                      className="w-full rounded-[6px] border border-[var(--dash-border)] bg-[var(--dash-surface)] p-2.5 text-sm"
                    />
                  ) : null}

                  {block.type === "quote" ? (
                    <div className="space-y-2">
                      <textarea
                        rows={2}
                        value={block.text}
                        placeholder="Texte de la citation..."
                        onChange={(e) =>
                          setBlocks((prev) =>
                            prev.map((b, i) =>
                              i === index && b.type === "quote"
                                ? { ...b, text: e.target.value }
                                : b
                            )
                          )
                        }
                        required
                        className="w-full rounded-[6px] border border-[var(--dash-border)] bg-[var(--dash-surface)] p-2.5 text-sm"
                      />
                      <input
                        value={block.author ?? ""}
                        placeholder="Auteur (optionnel)"
                        onChange={(e) =>
                          setBlocks((prev) =>
                            prev.map((b, i) =>
                              i === index && b.type === "quote"
                                ? { ...b, author: e.target.value }
                                : b
                            )
                          )
                        }
                        className={inputClass}
                      />
                    </div>
                  ) : null}

                  {block.type === "signature" ? (
                    <div className="grid gap-2 sm:grid-cols-2">
                      <input
                        value={block.name}
                        placeholder="Nom"
                        onChange={(e) =>
                          setBlocks((prev) =>
                            prev.map((b, i) =>
                              i === index && b.type === "signature"
                                ? { ...b, name: e.target.value }
                                : b
                            )
                          )
                        }
                        className={inputClass}
                      />
                      <input
                        value={block.role}
                        placeholder="Fonction"
                        onChange={(e) =>
                          setBlocks((prev) =>
                            prev.map((b, i) =>
                              i === index && b.type === "signature"
                                ? { ...b, role: e.target.value }
                                : b
                            )
                          )
                        }
                        className={inputClass}
                      />
                      <input
                        value={block.city}
                        placeholder="Ville"
                        onChange={(e) =>
                          setBlocks((prev) =>
                            prev.map((b, i) =>
                              i === index && b.type === "signature"
                                ? { ...b, city: e.target.value }
                                : b
                            )
                          )
                        }
                        className={inputClass}
                      />
                      <input
                        value={block.date}
                        placeholder="Date"
                        onChange={(e) =>
                          setBlocks((prev) =>
                            prev.map((b, i) =>
                              i === index && b.type === "signature"
                                ? { ...b, date: e.target.value }
                                : b
                            )
                          )
                        }
                        className={inputClass}
                      />
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="submit" disabled={saving}>
              {saving
                ? "Enregistrement..."
                : editingId
                  ? "Mettre à jour"
                  : "Publier / Enregistrer"}
            </Button>
          </div>
        </form>
      ) : null}

      {activeTab === "articles" ? (
      <div className="divide-y divide-[var(--dash-border)] rounded-[8px] border border-[var(--dash-border)] bg-[var(--dash-surface)]">
        {articles.length === 0 ? (
          <p className="p-6 text-sm text-[var(--dash-muted)]">
            Aucun article rédigé pour le moment.
          </p>
        ) : (
          articles.map((article) => (
            <div
              key={article.id}
              className="flex flex-wrap items-center justify-between gap-3 p-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-sm font-medium text-[var(--dash-text)]">
                    {article.title}
                  </p>
                  <span className="rounded-full bg-[var(--dash-active)] px-2 py-0.5 text-[11px] font-medium text-[var(--dash-text)]">
                    {article.status}
                  </span>
                </div>
                <p className="font-mono-tech mt-0.5 text-xs text-[var(--dash-muted)]">
                  /articles/{article.slug} · {article.readingMinutes} min
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => startEditArticle(article)}
                  className="inline-flex h-9 items-center rounded-[6px] border border-[var(--dash-border)] px-3 text-xs text-[var(--dash-text)] hover:bg-[var(--dash-active)]"
                >
                  Modifier
                </button>
                <ProjectShareMenu
                  title={article.title}
                  slug={article.slug}
                  summary={article.excerpt}
                  pathPrefix="/articles"
                />
                <button
                  type="button"
                  aria-label={`Supprimer ${article.title}`}
                  onClick={() => void handleSoftDelete(article.id)}
                  className="flex h-9 w-9 items-center justify-center rounded-[6px] text-[var(--dash-muted)] hover:bg-[var(--dash-active)] hover:text-[var(--dash-text)]"
                >
                  <Trash size={15} weight="bold" aria-hidden="true" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      ) : null}
    </div>
  );
}

