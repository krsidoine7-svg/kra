export default function StudioMemoryPlaceholderPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-[-0.02em] text-[var(--dash-text)]">
        Mémoire des Sections
      </h1>
      <div className="rounded-[8px] border border-[var(--dash-border)] bg-[var(--dash-surface)] p-6 text-sm text-[var(--dash-muted)]">
        Module planifié en <strong>MVP 4</strong> : historique versionné SHA-256 de chaque section CMS, projet et article avec comparaison et restauration en 1 clic.
      </div>
    </div>
  );
}

