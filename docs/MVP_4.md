# `MVP_4.md` — Plan d'Exécution Détaillé : Carte Interactive, Mémoire Globale des Sections & Résilience 3G

> **Prérequis :** 100 % des tests de `MVP_3.md` sont à `[x] OK`.
> **Rappel Scope :** La **Carte interactive** et la **Mémoire globale qui enregistre toutes les sections** sont construites dans ce **MVP 4**.

---

## Phase 4.1 — Carte Interactive des Projets (Lazy-Loaded 3G-Friendly)

### Module M4.1 — Exploration Géographique (Côte d'Ivoire & International)
- **Tâche M4.1-T1 — Données Géographiques & API (Back-End) :**
  - `M4.1-T1.1` Ajouter les champs ville, pays, latitude, longitude dans l'éditeur projet du Dashboard (avec sélection par liste de villes prédéfinies CI/Monde pour éviter la saisie manuelle fastidieuse).
  - `M4.1-T1.2` Exposer `GET /api/public/map` retournant uniquement les marqueurs publics légers (`id`, `slug`, `title`, `status`, `city`, `country`, `lat`, `lng`).
- **Tâche M4.1-T2 — Composant Carte Monochrome Lazy-Loaded (Front-End) :**
  - `M4.1-T2.1` Intégrer la carte sur `/projets?vue=carte` (ou tiroir dédié) via `next/dynamic(..., { ssr: false })` **chargé uniquement lorsque l'utilisateur active la vue Carte** (0 Ko sur le chargement initial `/` en 3G).
  - `M4.1-T2.2` Style de tuiles monochrome N&B cohérent avec le Design System + marqueurs cliquables ouvrant la fiche projet et son menu partage `...` + fallback liste accessible en cas de blocage réseau des tuiles.

#### Tests de Recette M4.1
| ID | Scénario | Résultat Attendu | Statut |
| :--- | :--- | :--- | :--- |
| `T-M4.1-01` | Charger `/` et `/projets` en mode liste | Le bundle JavaScript de la carte n'est **pas** téléchargé | `[ ] OK [ ] KO [ ] NA` |
| `T-M4.1-02` | Cliquer sur l'onglet « Vue Carte » puis sur un marqueur (ex. Abidjan) | Carte affichée en monochrome, fiche projet correspondante ouverte avec lien direct | `[ ] OK [ ] KO [ ] NA` |
| `T-M4.1-03` | Couper les tuiles cartographiques (mode hors-ligne partiel) | Les marqueurs et la liste des villes restent utilisables sans crash | `[ ] OK [ ] KO [ ] NA` |

---

## Phase 4.2 — Mémoire Globale qui Enregistre Toutes les Sections

### Module M4.2 — Historique, Snapshots `SHA-256` & Restauration (`project-memory` en Prod)
- **Tâche M4.2-T1 — Capture Automatique des Versions (Back-End) :**
  - `M4.2-T1.1` Implémenter `MemorySnapshotService.capture(...)` appelé automatiquement à chaque sauvegarde d'une section CMS (`hero`, `header`, `about`, `socials`, `footer`, `section_titles`), d'un projet, d'un dossier ou d'un article.
  - `M4.2-T1.2` Calculer le numéro de version séquentiel et le checksum `SHA-256` dans `section_memory_snapshots`, avec déduplication si le contenu est strictement identique.
  - `M4.2-T1.3` Créer `GET /api/admin/memory` (filtrable par section/entité) et `POST /api/admin/memory/[snapshotId]/restore` (restaure la version dans une transaction + crée un nouveau snapshot de restauration + revalide ISR).
- **Tâche M4.2-T2 — Interface « Mémoire & Historique » dans Dashboard Linear (Front-End) :**
  - `M4.2-T2.1` Ajouter l'onglet **Mémoire des Sections** dans la sidebar Linear : timeline chronologique propre, comparaison avant/après (diff lisible des textes modifiés), et bouton **« Restaurer cette version »**.

#### Tests de Recette M4.2
| ID | Scénario | Résultat Attendu | Statut |
| :--- | :--- | :--- | :--- |
| `T-M4.2-01` | Modifier le texte du Hero 3 fois dans le CMS | 3 versions horodatées distinctes enregistrées dans `section_memory_snapshots` avec checksums `SHA-256` différents | `[ ] OK [ ] KO [ ] NA` |
| `T-M4.2-02` | Cliquer « Restaurer la version 1 » dans l'onglet Mémoire | Le Hero public revient immédiatement à la version 1 et une version 4 (copie de V1) est tracée sans perte d'historique | `[ ] OK [ ] KO [ ] NA` |

---

## Phase 4.3 — Résilience Réseau Faible & Audit Final

### Module M4.3 — Cache Résilient 3G & Recette Finale de Production
- **Tâche M4.3-T1 — Résilience Offline Légère :**
  - `M4.3-T1.1` Service Worker minimaliste (ou cache HTTP `stale-while-revalidate`) pour que les pages déjà consultées (projets & articles lus par un visiteur en déplacement en Côte d'Ivoire) restent lisibles en cas de perte de signal temporaire.
  - `M4.3-T1.2` Indicateur discret dans le Dashboard Linear signalant la perte/reprise de connexion pendant la rédaction d'articles sans jamais perdre les données saisies.

#### Tests de Recette M4.3 (Validation Finale Produit)
| ID | Scénario | Résultat Attendu | Statut |
| :--- | :--- | :--- | :--- |
| `T-M4.3-01` | Couper le réseau dans l'éditeur d'articles puis le rétablir | Brouillon conservé localement, synchronisation réussie dès le retour réseau | `[ ] OK [ ] KO [ ] NA` |
| `T-M4.3-02` | Audit global `tchor-rectte-pr` (Desktop 1440px, Tablette 768px, Mobile 390px Slow 3G) | 100 % des modules MVP 1 à 4 conformes, zéro `any`, zéro `lucide-react`, 0 vulnérabilité critique | `[ ] OK [ ] KO [ ] NA` |

