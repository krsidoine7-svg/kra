"use client";

import * as React from "react";
import {
  Check,
  Image as ImageIcon,
  Plus,
  Trash,
  UploadSimple,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import type { CmsSnapshot, PublicLogoItem, PublicSkillItem } from "@/lib/cms/repository";
import type {
  AboutCms,
  HeaderCms,
  HeroCms,
  SectionTitlesCms,
  SocialsCms,
} from "@/lib/validators/cms";
import { cn } from "@/lib/utils";

type CmsTab = "hero" | "sections" | "skills" | "logos";

interface CmsEditorClientProps {
  initialSnapshot: CmsSnapshot;
}

export function CmsEditorClient({ initialSnapshot }: CmsEditorClientProps) {
  const [activeTab, setActiveTab] = React.useState<CmsTab>("hero");
  const [hero, setHero] = React.useState<HeroCms>(initialSnapshot.hero);
  const [header, setHeader] = React.useState<HeaderCms>(initialSnapshot.header);
  const [about, setAbout] = React.useState<AboutCms>(initialSnapshot.about);
  const [socials, setSocials] = React.useState<SocialsCms>(
    initialSnapshot.socials
  );
  const [sectionTitles, setSectionTitles] = React.useState<SectionTitlesCms>(
    initialSnapshot.sectionTitles
  );
  const [skills, setSkills] = React.useState<PublicSkillItem[]>(
    initialSnapshot.skills
  );
  const [logos, setLogos] = React.useState<PublicLogoItem[]>(
    initialSnapshot.logos
  );

  const [newSkillTitle, setNewSkillTitle] = React.useState("");
  const [newSkillDesc, setNewSkillDesc] = React.useState("");
  const [newLogoName, setNewLogoName] = React.useState("");
  const [newLogoCategory, setNewLogoCategory] = React.useState<
    "client" | "partner" | "institution" | "tool"
  >("partner");
  const [newLogoUrl, setNewLogoUrl] = React.useState("");
  const [newLogoKey, setNewLogoKey] = React.useState("");

  const [saving, setSaving] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  async function saveSection(sectionKey: string, payload: unknown) {
    setFeedback(null);
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/cms/${sectionKey}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !data.ok) {
        setFeedback({
          type: "error",
          message: data.error ?? "Erreur lors de l'enregistrement.",
        });
        return;
      }
      setFeedback({
        type: "success",
        message: "Section enregistrée et publiée sur le site.",
      });
    } catch {
      setFeedback({ type: "error", message: "Erreur réseau." });
    } finally {
      setSaving(false);
    }
  }

  async function handleImageUpload(
    file: File,
    scope: string,
    onSuccess: (url: string, objectKey: string) => void
  ) {
    setFeedback(null);
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("scope", scope);
      const response = await fetch("/api/admin/media/upload", {
        method: "POST",
        body: formData,
      });
      const data = (await response.json()) as {
        ok?: boolean;
        url?: string;
        objectKey?: string;
        error?: string;
      };
      if (!response.ok || !data.ok || !data.objectKey) {
        setFeedback({
          type: "error",
          message: data.error ?? "Échec de l'envoi du fichier.",
        });
        return;
      }
      onSuccess(data.url ?? data.objectKey, data.objectKey);
      setFeedback({
        type: "success",
        message: "Média optimisé (WebP/SVG) et envoyé sur Neon Storage.",
      });
    } catch {
      setFeedback({ type: "error", message: "Erreur réseau lors de l'upload." });
    } finally {
      setSaving(false);
    }
  }

  async function handleAddSkill(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);
    setSaving(true);
    try {
      const response = await fetch("/api/admin/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newSkillTitle,
          description: newSkillDesc,
          displayOrder: skills.length + 1,
          isVisible: true,
        }),
      });
      const data = (await response.json()) as {
        ok?: boolean;
        item?: PublicSkillItem;
        error?: string;
      };
      if (!response.ok || !data.ok || !data.item) {
        setFeedback({
          type: "error",
          message: data.error ?? "Impossible d'ajouter la compétence.",
        });
        return;
      }
      setSkills((prev) => [...prev, data.item as PublicSkillItem]);
      setNewSkillTitle("");
      setNewSkillDesc("");
      setFeedback({ type: "success", message: "Compétence ajoutée." });
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteSkill(id: string) {
    const response = await fetch(`/api/admin/skills/${id}`, {
      method: "DELETE",
    });
    if (response.ok) {
      setSkills((prev) => prev.filter((item) => item.id !== id));
    }
  }

  async function handleAddLogo(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);
    setSaving(true);
    try {
      const response = await fetch("/api/admin/logos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newLogoName,
          category: newLogoCategory,
          objectKey: newLogoKey,
          websiteUrl: newLogoUrl,
          displayOrder: logos.length + 1,
          isVisible: true,
        }),
      });
      const data = (await response.json()) as {
        ok?: boolean;
        item?: PublicLogoItem;
        error?: string;
      };
      if (!response.ok || !data.ok || !data.item) {
        setFeedback({
          type: "error",
          message: data.error ?? "Impossible d'ajouter le logo.",
        });
        return;
      }
      setLogos((prev) => [...prev, data.item as PublicLogoItem]);
      setNewLogoName("");
      setNewLogoUrl("");
      setNewLogoKey("");
      setFeedback({ type: "success", message: "Logo ajouté." });
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteLogo(id: string) {
    const response = await fetch(`/api/admin/logos/${id}`, {
      method: "DELETE",
    });
    if (response.ok) {
      setLogos((prev) => prev.filter((item) => item.id !== id));
    }
  }

  const inputClass =
    "h-9 w-full rounded-[6px] border border-[var(--dash-border)] bg-[var(--dash-surface)] px-3 text-sm text-[var(--dash-text)] focus:border-[var(--dash-text)] focus:outline-none";

  const tabs: Array<{ id: CmsTab; label: string }> = [
    { id: "hero", label: "Hero & Header" },
    { id: "sections", label: "À propos, Titres & Réseaux" },
    { id: "skills", label: "Compétences" },
    { id: "logos", label: "Logos" },
  ];

  return (
    <div className="space-y-6">
      {/* Barre d'onglets Linear */}
      <div
        role="tablist"
        aria-label="Sections CMS"
        className="flex gap-6 overflow-x-auto border-b border-[var(--dash-border)]"
      >
        {tabs.map((tab) => {
          const selected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => {
                setFeedback(null);
                setActiveTab(tab.id);
              }}
              className={cn(
                "whitespace-nowrap border-b-2 pb-3 text-sm transition-colors",
                selected
                  ? "border-[var(--dash-text)] font-medium text-[var(--dash-text)]"
                  : "border-transparent text-[var(--dash-muted)] hover:text-[var(--dash-text)]"
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {feedback ? (
        <div
          role="status"
          className={
            feedback.type === "success"
              ? "flex items-center gap-2 rounded-[6px] bg-[var(--p-green-bg)] px-3.5 py-2.5 text-sm text-[var(--p-green-fg)]"
              : "rounded-[6px] bg-[var(--p-red-bg)] px-3.5 py-2.5 text-sm text-[var(--p-red-fg)]"
          }
        >
          {feedback.type === "success" ? (
            <Check size={16} weight="bold" aria-hidden="true" />
          ) : null}
          <span>{feedback.message}</span>
        </div>
      ) : null}

      {/* ONGLET 1 : HERO & HEADER */}
      {activeTab === "hero" ? (
        <div className="space-y-6">
          <section className="rounded-[8px] border border-[var(--dash-border)] bg-[var(--dash-surface)] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-medium text-[var(--dash-text)]">
                Hero ALTENNIS (Manu KRA)
              </h2>
              <Button
                type="button"
                disabled={saving}
                onClick={() => saveSection("hero", hero)}
              >
                {saving ? "Enregistrement..." : "Publier le Hero"}
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--dash-muted)]">
                  Marque / Nom affiché
                </label>
                <input
                  value={hero.brandName}
                  onChange={(e) =>
                    setHero((prev) => ({ ...prev, brandName: e.target.value }))
                  }
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--dash-muted)]">
                  Label Mono entre crochets
                </label>
                <input
                  value={hero.label}
                  onChange={(e) =>
                    setHero((prev) => ({ ...prev, label: e.target.value }))
                  }
                  className={inputClass}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-[var(--dash-muted)]">
                  Lignes du Titre Géant (Alignement en escalier desktop)
                </label>
                {hero.titleLines.length < 6 ? (
                  <button
                    type="button"
                    onClick={() =>
                      setHero((prev) => ({
                        ...prev,
                        titleLines: [
                          ...prev.titleLines,
                          { text: "NOUVELLE LIGNE", align: "left" },
                        ],
                      }))
                    }
                    className="inline-flex items-center gap-1 text-xs font-medium text-[var(--dash-text)] hover:underline"
                  >
                    <Plus size={14} weight="bold" aria-hidden="true" />
                    Ajouter une ligne
                  </button>
                ) : null}
              </div>

              {hero.titleLines.map((line, index) => (
                <div
                  key={index}
                  className="grid grid-cols-[1fr_110px_auto] items-center gap-2"
                >
                  <input
                    value={line.text}
                    onChange={(e) =>
                      setHero((prev) => ({
                        ...prev,
                        titleLines: prev.titleLines.map((item, idx) =>
                          idx === index ? { ...item, text: e.target.value } : item
                        ),
                      }))
                    }
                    className={inputClass}
                  />
                  <select
                    aria-label={`Alignement ligne ${index + 1}`}
                    value={line.align}
                    onChange={(e) =>
                      setHero((prev) => ({
                        ...prev,
                        titleLines: prev.titleLines.map((item, idx) =>
                          idx === index
                            ? {
                                ...item,
                                align: e.target.value as "left" | "center" | "right",
                              }
                            : item
                        ),
                      }))
                    }
                    className={inputClass}
                  >
                    <option value="left">Gauche</option>
                    <option value="center">Centre</option>
                    <option value="right">Droite</option>
                  </select>
                  <button
                    type="button"
                    disabled={hero.titleLines.length <= 1}
                    aria-label="Supprimer la ligne"
                    onClick={() =>
                      setHero((prev) => ({
                        ...prev,
                        titleLines: prev.titleLines.filter((_, idx) => idx !== index),
                      }))
                    }
                    className="flex h-9 w-9 items-center justify-center rounded-[6px] border border-[var(--dash-border)] text-[var(--dash-muted)] hover:text-[var(--dash-text)] disabled:opacity-40"
                  >
                    <Trash size={14} weight="bold" aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {hero.paragraphs.map((paragraph, index) => (
                <div key={index} className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--dash-muted)]">
                    Paragraphe {index + 1}
                  </label>
                  <textarea
                    rows={3}
                    value={paragraph}
                    onChange={(e) =>
                      setHero((prev) => ({
                        ...prev,
                        paragraphs: prev.paragraphs.map((p, idx) =>
                          idx === index ? e.target.value : p
                        ),
                      }))
                    }
                    className="w-full rounded-[6px] border border-[var(--dash-border)] bg-[var(--dash-surface)] p-3 text-sm text-[var(--dash-text)] focus:border-[var(--dash-text)] focus:outline-none"
                  />
                </div>
              ))}
            </div>

            <div className="grid gap-4 border-t border-[var(--dash-border)] pt-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--dash-muted)]">
                  URL Portrait (WebP Neon Storage ou URL)
                </label>
                <div className="flex gap-2">
                  <input
                    value={hero.portraitUrl}
                    onChange={(e) =>
                      setHero((prev) => ({ ...prev, portraitUrl: e.target.value }))
                    }
                    placeholder="https://..."
                    className={inputClass}
                  />
                  <label className="inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-[6px] border border-[var(--dash-border)] px-3 text-xs font-medium text-[var(--dash-text)] hover:bg-[var(--dash-active)]">
                    <UploadSimple size={14} weight="bold" aria-hidden="true" />
                    Importer
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="sr-only"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          void handleImageUpload(file, "hero", (url) =>
                            setHero((prev) => ({ ...prev, portraitUrl: url }))
                          );
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--dash-muted)]">
                  Texte alternatif portrait
                </label>
                <input
                  value={hero.portraitAlt}
                  onChange={(e) =>
                    setHero((prev) => ({ ...prev, portraitAlt: e.target.value }))
                  }
                  className={inputClass}
                />
              </div>
            </div>
          </section>

          {/* Header Navigation */}
          <section className="rounded-[8px] border border-[var(--dash-border)] bg-[var(--dash-surface)] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-medium text-[var(--dash-text)]">
                Navigation Header
              </h2>
              <Button
                type="button"
                variant="outline"
                disabled={saving}
                onClick={() => saveSection("header", header)}
              >
                Publier le Header
              </Button>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--dash-muted)]">
                Wordmark Header
              </label>
              <input
                value={header.wordmark}
                onChange={(e) =>
                  setHeader((prev) => ({ ...prev, wordmark: e.target.value }))
                }
                className={inputClass}
              />
            </div>
          </section>
        </div>
      ) : null}

      {/* ONGLET 2 : À PROPOS, TITRES & RÉSEAUX */}
      {activeTab === "sections" ? (
        <div className="space-y-6">
          <section className="rounded-[8px] border border-[var(--dash-border)] bg-[var(--dash-surface)] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-medium text-[var(--dash-text)]">
                Titres des Sections Publiques
              </h2>
              <Button
                type="button"
                disabled={saving}
                onClick={() => saveSection("section_titles", sectionTitles)}
              >
                Enregistrer les titres
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--dash-muted)]">
                  Titre Section Projets
                </label>
                <input
                  value={sectionTitles.projectsTitle}
                  onChange={(e) =>
                    setSectionTitles((prev) => ({
                      ...prev,
                      projectsTitle: e.target.value,
                    }))
                  }
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--dash-muted)]">
                  Titre Section Dossiers
                </label>
                <input
                  value={sectionTitles.foldersTitle}
                  onChange={(e) =>
                    setSectionTitles((prev) => ({
                      ...prev,
                      foldersTitle: e.target.value,
                    }))
                  }
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--dash-muted)]">
                  Titre Compétences
                </label>
                <input
                  value={sectionTitles.skillsTitle}
                  onChange={(e) =>
                    setSectionTitles((prev) => ({
                      ...prev,
                      skillsTitle: e.target.value,
                    }))
                  }
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--dash-muted)]">
                  Titre Logos
                </label>
                <input
                  value={sectionTitles.logosTitle}
                  onChange={(e) =>
                    setSectionTitles((prev) => ({
                      ...prev,
                      logosTitle: e.target.value,
                    }))
                  }
                  className={inputClass}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--dash-muted)]">
                Sous-titre Section Projets
              </label>
              <input
                value={sectionTitles.projectsSubtitle}
                onChange={(e) =>
                  setSectionTitles((prev) => ({
                    ...prev,
                    projectsSubtitle: e.target.value,
                  }))
                }
                className={inputClass}
              />
            </div>
          </section>

          <section className="rounded-[8px] border border-[var(--dash-border)] bg-[var(--dash-surface)] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-medium text-[var(--dash-text)]">
                À Propos
              </h2>
              <Button
                type="button"
                variant="outline"
                disabled={saving}
                onClick={() => saveSection("about", about)}
              >
                Publier À propos
              </Button>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--dash-muted)]">
                Titre À propos
              </label>
              <input
                value={about.sectionTitle}
                onChange={(e) =>
                  setAbout((prev) => ({ ...prev, sectionTitle: e.target.value }))
                }
                className={inputClass}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--dash-muted)]">
                Accroche À propos
              </label>
              <input
                value={about.lead}
                onChange={(e) =>
                  setAbout((prev) => ({ ...prev, lead: e.target.value }))
                }
                className={inputClass}
              />
            </div>
          </section>

          <section className="rounded-[8px] border border-[var(--dash-border)] bg-[var(--dash-surface)] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-medium text-[var(--dash-text)]">
                Réseaux Sociaux & Footer
              </h2>
              <Button
                type="button"
                variant="outline"
                disabled={saving}
                onClick={() => saveSection("socials", socials)}
              >
                Publier Réseaux & Footer
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--dash-muted)]">
                  E-mail public
                </label>
                <input
                  type="email"
                  value={socials.emailPublic}
                  onChange={(e) =>
                    setSocials((prev) => ({
                      ...prev,
                      emailPublic: e.target.value,
                    }))
                  }
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--dash-muted)]">
                  Ville / Pays
                </label>
                <input
                  value={socials.city}
                  onChange={(e) =>
                    setSocials((prev) => ({ ...prev, city: e.target.value }))
                  }
                  className={inputClass}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-[var(--dash-muted)]">
                  Liens sociaux
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setSocials((prev) => ({
                      ...prev,
                      links: [
                        ...prev.links,
                        { label: "Nouveau réseau", url: "https://" },
                      ],
                    }))
                  }
                  className="inline-flex items-center gap-1 text-xs font-medium text-[var(--dash-text)] hover:underline"
                >
                  <Plus size={14} weight="bold" aria-hidden="true" />
                  Ajouter un lien
                </button>
              </div>
              {socials.links.map((link, index) => (
                <div
                  key={index}
                  className="grid grid-cols-[140px_1fr_auto] gap-2"
                >
                  <input
                    value={link.label}
                    onChange={(e) =>
                      setSocials((prev) => ({
                        ...prev,
                        links: prev.links.map((l, idx) =>
                          idx === index ? { ...l, label: e.target.value } : l
                        ),
                      }))
                    }
                    className={inputClass}
                  />
                  <input
                    value={link.url}
                    onChange={(e) =>
                      setSocials((prev) => ({
                        ...prev,
                        links: prev.links.map((l, idx) =>
                          idx === index ? { ...l, url: e.target.value } : l
                        ),
                      }))
                    }
                    className={inputClass}
                  />
                  <button
                    type="button"
                    aria-label="Supprimer ce lien"
                    onClick={() =>
                      setSocials((prev) => ({
                        ...prev,
                        links: prev.links.filter((_, idx) => idx !== index),
                      }))
                    }
                    className="flex h-9 w-9 items-center justify-center rounded-[6px] border border-[var(--dash-border)] text-[var(--dash-muted)] hover:text-[var(--dash-text)]"
                  >
                    <Trash size={14} weight="bold" aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>
      ) : null}

      {/* ONGLET 3 : COMPÉTENCES */}
      {activeTab === "skills" ? (
        <div className="space-y-6">
          <form
            onSubmit={handleAddSkill}
            className="rounded-[8px] border border-[var(--dash-border)] bg-[var(--dash-surface)] p-5 space-y-4"
          >
            <h2 className="text-base font-medium text-[var(--dash-text)]">
              Ajouter un champ d&apos;intervention
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                value={newSkillTitle}
                onChange={(e) => setNewSkillTitle(e.target.value)}
                placeholder="Titre (ex. Analyse Macroéconomique)"
                required
                className={inputClass}
              />
              <input
                value={newSkillDesc}
                onChange={(e) => setNewSkillDesc(e.target.value)}
                placeholder="Courte description en une phrase..."
                required
                className={inputClass}
              />
            </div>
            <Button type="submit" disabled={saving}>
              <Plus size={15} weight="bold" aria-hidden="true" />
              Ajouter la compétence
            </Button>
          </form>

          <div className="divide-y divide-[var(--dash-border)] rounded-[8px] border border-[var(--dash-border)] bg-[var(--dash-surface)]">
            {skills.length === 0 ? (
              <p className="p-5 text-sm text-[var(--dash-muted)]">
                Aucune compétence enregistrée.
              </p>
            ) : (
              skills.map((skill) => (
                <div
                  key={skill.id}
                  className="flex items-center justify-between gap-4 p-4"
                >
                  <div>
                    <p className="text-sm font-medium text-[var(--dash-text)]">
                      {skill.title}
                    </p>
                    <p className="mt-0.5 text-xs text-[var(--dash-muted)]">
                      {skill.description}
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label={`Supprimer ${skill.title}`}
                    onClick={() => void handleDeleteSkill(skill.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-[6px] text-[var(--dash-muted)] hover:bg-[var(--dash-active)] hover:text-[var(--dash-text)]"
                  >
                    <Trash size={15} weight="bold" aria-hidden="true" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}

      {/* ONGLET 4 : LOGOS */}
      {activeTab === "logos" ? (
        <div className="space-y-6">
          <form
            onSubmit={handleAddLogo}
            className="rounded-[8px] border border-[var(--dash-border)] bg-[var(--dash-surface)] p-5 space-y-4"
          >
            <h2 className="text-base font-medium text-[var(--dash-text)]">
              Ajouter un logo (Client, Partenaire, Institution ou Outil)
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <input
                value={newLogoName}
                onChange={(e) => setNewLogoName(e.target.value)}
                placeholder="Nom (ex. Horizon Éco CI)"
                required
                className={inputClass}
              />
              <select
                value={newLogoCategory}
                onChange={(e) =>
                  setNewLogoCategory(
                    e.target.value as
                      | "client"
                      | "partner"
                      | "institution"
                      | "tool"
                  )
                }
                className={inputClass}
              >
                <option value="partner">Partenaire</option>
                <option value="client">Client</option>
                <option value="institution">Institution</option>
                <option value="tool">Outil</option>
              </select>
              <input
                value={newLogoUrl}
                onChange={(e) => setNewLogoUrl(e.target.value)}
                placeholder="Site web (optionnel, https://...)"
                className={inputClass}
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-[6px] border border-[var(--dash-border)] px-3 text-xs font-medium text-[var(--dash-text)] hover:bg-[var(--dash-active)]">
                <ImageIcon size={15} weight="bold" aria-hidden="true" />
                Importer un logo (SVG sanitizé / PNG / WebP)
                <input
                  type="file"
                  accept="image/svg+xml,image/png,image/webp,image/jpeg"
                  className="sr-only"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      void handleImageUpload(file, "logos", (_url, key) =>
                        setNewLogoKey(key)
                      );
                    }
                  }}
                />
              </label>
              {newLogoKey ? (
                <span className="font-mono-tech text-xs text-[var(--p-green-fg)]">
                  Fichier prêt : {newLogoKey}
                </span>
              ) : null}
            </div>

            <Button type="submit" disabled={saving}>
              <Plus size={15} weight="bold" aria-hidden="true" />
              Ajouter le logo
            </Button>
          </form>

          <div className="divide-y divide-[var(--dash-border)] rounded-[8px] border border-[var(--dash-border)] bg-[var(--dash-surface)]">
            {logos.length === 0 ? (
              <p className="p-5 text-sm text-[var(--dash-muted)]">
                Aucun logo enregistré.
              </p>
            ) : (
              logos.map((logo) => (
                <div
                  key={logo.id}
                  className="flex items-center justify-between gap-4 p-4"
                >
                  <div>
                    <p className="text-sm font-medium text-[var(--dash-text)]">
                      {logo.name}
                    </p>
                    <p className="font-mono-tech mt-0.5 text-xs text-[var(--dash-muted)]">
                      {logo.category}
                      {logo.websiteUrl ? ` · ${logo.websiteUrl}` : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label={`Supprimer ${logo.name}`}
                    onClick={() => void handleDeleteLogo(logo.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-[6px] text-[var(--dash-muted)] hover:bg-[var(--dash-active)] hover:text-[var(--dash-text)]"
                  >
                    <Trash size={15} weight="bold" aria-hidden="true" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

