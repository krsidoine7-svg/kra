# `DESIGN_SYSTEM.md` — La Bible UX / UI

> **Synthèse des directives :** [brainstorming.md](../brainstorming.md) (*ALTENNIS*), [brainstorming-framer.md](../brainstorming-framer.md) (*Framer*), `skills/minimalist-skill`, `skills/taste-skill` (`app-screens.md`, `scenes.md`, `motion.md`), `skills/design-system`, `skills/ui-ux-pro-max`.

---

## 1. Identité Visuelle & Règles Strictes

1. **Monochrome Noir & Blanc Éditorial :**
   - Vitrine publique construite sur le contraste net entre blanc cassé éditorial (`#F7F5F2`), blanc pur (`#FFFFFF`), encre charbon (`#111111`) et noir profond (`#0A0A0A`).
   - Alternance maîtrisée des chapitres (ex. section claire puis section sombre `#0A0A0A` sur `#FFFFFF` pour marquer les ruptures sans aucune couleur criarde).
2. **Zéro Ornement Superflu :**
   - Aucun gradient sur les fonds, textes ou boutons.
   - Aucune ombre portée sur les cartes au repos (`shadow-none`) ; séparation par espace blanc ou bordure nette `1px`.
   - Aucun emoji dans le code, l'interface, les titres ou les états vides.
   - Aucune icône enfermée dans un cercle ou carré coloré.
3. **Système d'Icônes (Règle `minimalist-skill` stricte) :**
   - **Lucide (`lucide-react`) est strictement interdit.**
   - Utilisation exclusive de **`@phosphor-icons/react`** (poids uniformisé `weight="bold"` ou `weight="regular"`, taille `16px`–`20px`) et de **`@radix-ui/react-icons`** pour les primitives système `shadcn/ui`.
   - Remplacement du mapping `lucide` dans `components.json` / wrappers UI dès l'initialisation.

---

## 2. Architecture de Tokens à 3 Couches (`Primitive → Semantic → Component`)

### Couche 1 — Primitive Tokens (Valeurs brutes)
```css
:root {
  /* Neutres Noir & Blanc */
  --p-white: #FFFFFF;
  --p-bone: #F7F5F2;
  --p-paper: #F2EFEA;
  --p-gray-100: #F4F4F4;
  --p-gray-200: #EAEAEA;
  --p-gray-300: #D4D4D4;
  --p-gray-500: #6B6B6B;
  --p-gray-600: #525252;
  --p-ink: #111111;
  --p-black: #0A0A0A;

  /* Statuts sémantiques sobres (Dashboard Linear uniquement) */
  --p-green-bg: #DCFAE5;
  --p-green-fg: #1F5E3B;
  --p-amber-bg: #FFFBEB;
  --p-amber-fg: #92400E;
  --p-red-bg: #FFEDEA;
  --p-red-fg: #9F2F2D;

  /* Typographie */
  --font-display: "Space Grotesk", "Helvetica Neue", system-ui, sans-serif;
  --font-serif: "Instrument Serif", Georgia, serif;
  --font-sans: "Plus Jakarta Sans", "Helvetica Neue", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;

  /* Courbes & Temps d'animation */
  --ease-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-out: cubic-bezier(0.22, 1, 0.36, 1);
  --ease-in-out: cubic-bezier(0.76, 0, 0.24, 1);
}
```

### Couche 2 — Semantic Tokens (Rôles de surface & contraste WCAG AA ≥ 4.5:1)
```css
:root {
  --bg-canvas: var(--p-bone);
  --bg-surface: var(--p-white);
  --bg-inverse: var(--p-black);
  --fg-primary: var(--p-ink);
  --fg-secondary: var(--p-gray-600);
  --fg-muted: var(--p-gray-500);
  --fg-inverse: var(--p-white);
  --border-subtle: var(--p-gray-200);
  --border-strong: var(--p-gray-300);

  /* Dashboard Linear (mode clair par défaut, switch mode sombre supporté) */
  --dash-ground: #F9FAFB;
  --dash-surface: #FFFFFF;
  --dash-sidebar: #F7F7F8;
  --dash-active: #EDEDED;
  --dash-border: #E8E8E8;
  --dash-text: #111111;
  --dash-muted: #5F6368;
}

:root[data-theme="dark"] {
  --dash-ground: #0A0A0A;
  --dash-surface: #111111;
  --dash-sidebar: #0E0E0E;
  --dash-active: #222222;
  --dash-border: #262626;
  --dash-text: #FFFFFF;
  --dash-muted: #A3A3A3;
}
```

### Couche 3 — Component Tokens
- `--btn-primary-bg`: `var(--fg-primary)` (`#111111`) · `--btn-primary-fg`: `var(--p-white)` (`#FFFFFF`) · `--btn-radius`: `4px` (net et éditorial).
- `--card-border`: `1px solid var(--border-subtle)` · `--card-radius`: `8px` (vitrine / dashboard).
- `--tag-mono-font`: `var(--font-mono)` · `--tag-tracking`: `0.06em`.

---

## 3. Typographie & Hiérarchie

*(Note `minimalist-skill` : pas d'Inter, Roboto ou Open Sans.)*

| Rôle | Police | Taille Desktop | Taille Mobile | Interlignage / Tracking |
| :--- | :--- | :--- | :--- | :--- |
| **Hero H1 (`ALTENNIS`)** | `Space Grotesk` (700) + `&` fin (300) | `clamp(2.5rem, 6.2vw, 5.5rem)` | `clamp(2rem, 8.5vw, 2.75rem)` | `leading-[0.95]`, `tracking-[-0.03em]` |
| **Titres de Section (H2)** | `Space Grotesk` (600) | `2rem` – `3rem` | `1.5rem` – `1.75rem` | `leading-[1.05]`, `tracking-[-0.02em]` |
| **Citation / Accent Éditorial** | `Instrument Serif` (Italic) | `1.5rem` – `2.25rem` | `1.25rem` – `1.5rem` | `leading-[1.2]` |
| **Corps de texte & Articles** | `Plus Jakarta Sans` (400/500) | `1rem` – `1.125rem` | `1rem` (≥ 16px) | `leading-[1.65]` |
| **Labels `[ ... ]`, Dates, Meta** | `JetBrains Mono` (400/500) | `0.75rem` – `0.875rem` | `0.75rem` (≥ 12px) | `tracking-[0.04em]`, `tabular-nums` |
| **Dashboard Linear (Titres)** | `Plus Jakarta Sans` (600) | `1.25rem` – `1.5rem` (20–24px max) | `1.125rem` – `1.25rem` | `leading-[1.3]` |
| **Dashboard Linear (Tableaux)** | `Plus Jakarta Sans` + `Mono` chiffres | `0.875rem` (14px) | `0.875rem` (14px) | `tabular-nums`, nombres alignés à droite |

---

## 4. Spécifications des Composants Clés

### 4.1 Hero *Manu KRA* (Calqué sur `brainstorming.md`)
- Conteneur centré `max-w-6xl`, marge extérieure fixe `16px` mobile / `32px` desktop.
- Titre H1 composé de lignes positionnables en escalier sur desktop (`lg:text-left`, `lg:text-center`, `lg:text-right`) ; empilé et aligné à gauche sur mobile pour une lisibilité immédiate.
- En dessous du H1 : grille asymétrique `1fr / 320px–380px` :
  - Gauche : Label `[ COMMUNICATION & ÉCONOMIE ]` + 2 paragraphes max 45–65 caractères par ligne + actions `[ VOIR LES PROJETS ]` `[ À PROPOS ]`.
  - Droite : Portrait `aspect-[4/5]` ou `aspect-square`, traitement monochrome/désaturé chaud avec grain léger (`opacity: 0.04`), sans bordure criarde.

### 4.2 Section Projets Scroll-Pinned (`scenes.md` + `motion.md`)
- Hauteur du conteneur parent : `300svh` sur desktop (`hold = 2` pour 3 projets).
- Scène interne : `position: sticky; top: 0; height: 100svh; overflow: hidden;`.
- Barre de progression discrète `1px` en haut ou en bas (`[ 01 / 03 ]`) + boutons précédent/suivant accessibles au clavier et au tactile.
- Chaque slide projet occupe tout le cadre avec : Image WebP (60 % largeur) + Fiche éditoriale (40 % : Dossier, Statut `Réalisé` / `À venir`, Titre, Résumé, Action `Explorer`, Menu `...` Phosphor `DotsThree`).
- **Règle d'accessibilité obligatoire :** Sous `@media (prefers-reduced-motion: reduce)` ou sans JS, la section bascule automatiquement en grille statique propre de 3 cartes empilées sans rien cacher.

### 4.3 Menu Contextuel Partage `...` (`DotsThree`)
- Déclencheur tactile ≥ `44x44px` sur mobile, icône `DotsThree` (Phosphor Bold).
- Menu Popover minimaliste (`1px solid var(--border-subtle)`, fond `#FFFFFF`, radius `6px`, légère ombre uniquement sur l'élément flottant `0 4px 16px rgba(0,0,0,0.08)`):
  - `Copier le lien` (icône `Link` / `Check`)
  - `Partager` (icône `ShareNetwork`)
  - `Ouvrir dans un nouvel onglet` (icône `ArrowUpRight`)

### 4.4 Articles Éditoriaux (Blocs Typés)
- Largeur de lecture optimale : `max-w-[68ch]` centrée pour confort de lecture.
- Rendu distinctif et hiérarchisé pour chaque bloc demandé :
  - `H1`, `H2`, `H3`, `H4` : échelle typographique nette.
  - **Liste à puces (`bullet_list`)** : puces carrées noires `4px` (`■` / carré CSS).
  - **Liste à tirets (`dash_list`)** : tirets cadratins (`—`) alignés en retrait propre.
  - **Liens (`link`)** : soulignement fin `1px` décalé (`underline-offset-4`), transition douce au survol.
  - **Citations (`quote`)** : bordure gauche `2px solid #111111`, typographie `Instrument Serif` italique `22px`, auteur en mono `12px`.
  - **Signature (`signature`)** : bloc de clôture sobre (trait fin `48px` + nom *Manu KRA* + titre/ville + date/empreinte).
  - **Commentaires** : liste chronologique épurée sous filet `1px`, zéro avatar coloré aléatoire (monogramme N&B sobre).

### 4.5 Dashboard Admin Style Linear (`taste-skill/app-screens.md`)
- **Shell :**
  - Desktop : Sidebar fixe `232px` sur fond `#F7F7F8` (ou `#0E0E0E` en dark), séparée du contenu par une ligne `1px`.
  - Mobile (< 768px) : Topbar compacte `48px` + bouton tiroir (`List` Phosphor) + navigation accessible au pouce (cibles ≥ `44px`).
- **Command Palette (`Cmd/Ctrl + K`) :** Accès instantané à tout projet, dossier, article ou section CMS au clavier.
- **Composants :**
  - **Zéro KPI décoratif avec icône dans un rond coloré :** Les statistiques utilisent un bloc divisé par lignes `1px` avec label `12px` gris au-dessus de la valeur `24px` `tabular-nums`.
  - **Listes & Tableaux Linear :** Lignes `44px` de haut, aucune alternance zébrée, bordure inférieure `1px`, badge statut en pilule pastel très sobre (`Publié`, `À venir`, `Brouillon`, `Corbeille`).
  - **Éditeur CMS Split View :** Colonne formulaire à gauche, aperçu structuré ou résumé en direct à droite.
  - **Modale Radiographie d'Impact (MVP 3) :** Affichage structuré en arbre (`Projets affectés`, `Liens partagés`, `Blocs CMS`) avec case de confirmation explicite avant Soft Delete ou purge.

