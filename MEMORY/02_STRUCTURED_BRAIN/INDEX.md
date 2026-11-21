# Mémoire Structurée — Index Central (`INDEX.md`)

> Protocole **project-memory** : Index vivant reliant la capture brute (`01_RAW_INBOX/`), la mémoire structurée (`02_STRUCTURED_BRAIN/`), la source de vérité maître ([projet.md](../../projet.md)) et l'ensemble des bibles documentaires (`docs/`).

---

## 1. Source Unique & Capture Brute

| Type | Fichier | Rôle |
| :--- | :--- | :--- |
| **Source Maître** | [projet.md](../../projet.md) | Point d'entrée unique (Manu KRA — Communication & Économie) |
| **Brief Brut** | [2026-11-21_brief-initial.md](../01_RAW_INBOX/raw_prompts/2026-11-21_brief-initial.md) | Capture intégrale du prompt et des réponses de cadrage |
| **Référence Hero** | [brainstorming.md](../../brainstorming.md) | Analyse de la maquette *ALTENNIS* (Hero obligatoire) |
| **Référence Structure** | [brainstorming-framer.md](../../brainstorming-framer.md) | Analyse du template *Framer* (Compétences, Logos, À propos, Portfolio) |
| **Arbitrages Conseil** | [decisions_llm_council.md](./decisions_llm_council.md) | Verdicts Alpha/Beta/Gamma/Delta (TS strict, Phosphor Icons, Neon, 3G, Scroll-pinned) |

---

## 2. Bibles Produit, Technique & Design (`docs/`)

| Domaine | Document | Statut |
| :--- | :--- | :--- |
| **Produit & Exigences** | [PRD.md](../../docs/PRD.md) | Rédigé |
| **Parcours Utilisateurs** | [PRODUCT_FLOW.md](../../docs/PRODUCT_FLOW.md) | Rédigé |
| **UX / UI & Tokens** | [DESIGN_SYSTEM.md](../../docs/DESIGN_SYSTEM.md) | Rédigé |
| **Technique & Front/Back** | [TDD.md](../../docs/TDD.md) | Rédigé |
| **Architecture Système** | [ARCHITECTE.md](../../docs/ARCHITECTE.md) | Rédigé |
| **Stack & Dépendances** | [STACK.md](../../docs/STACK.md) | Rédigé |
| **Modèle Conceptuel** | [MCD.md](../../docs/MCD.md) | Rédigé |
| **Schéma SQL / Drizzle** | [DB_SCHEMA.md](../../docs/DB_SCHEMA.md) | Rédigé |
| **Contrats API & Scalar** | [API.md](../../docs/API.md) | Rédigé |
| **Sécurité & Crypto** | [SECURITY.md](../../docs/SECURITY.md) | Rédigé |
| **Conformité CI & Monde** | [LEGAL_WORLD_CI.md](../../docs/LEGAL_WORLD_CI.md) | Rédigé |
| **Git & GitHub** | [GITHUB.md](../../docs/GITHUB.md) | Rédigé |
| **Indicateurs & Budget 3G** | [KPI.md](../../docs/KPI.md) | Rédigé |

---

## 3. Plan d'Exécution & Cahiers de Recette (`docs/MVP_*.md`)

| Document | Périmètre | Statut |
| :--- | :--- | :--- |
| [ROADMAP.md](../../docs/ROADMAP.md) | Stratégie PRD → MVP 1 → MVP 2 → MVP 3 → MVP 4 (Contexte CI) | Rédigé |
| [MVP_1.md](../../docs/MVP_1.md) | Socle, Hero ALTENNIS, Scroll 3 Projets, Partage `...`, Auth Masquée, Dashboard Linear, Dossiers, CMS | MVP 1 complet (`M1.1` à `M1.6` implémentés & buildés — en attente tests finaux & liaison DB Neon) |
| [MVP_2.md](../../docs/MVP_2.md) | Articles riches, Commentaires sans compte, Vidéos 3G, Stats, AES-256-GCM / SHA-256, Suppression compte, Corbeille | Planifié |
| [MVP_3.md](../../docs/MVP_3.md) | Filtres avancés, Sauvegarde recherche, Soft Delete & Radiographie d'impact, Scalar, SEO/GEO | Planifié |
| [MVP_4.md](../../docs/MVP_4.md) | Carte interactive (lazy 3G), Mémoire globale des sections & restauration, Résilience hors-ligne | Planifié |

---

## 4. Règles Opératoires de Maintenance
1. Toute nouvelle demande ou modification utilisateur est enregistrée d'abord dans `MEMORY/01_RAW_INBOX/`.
2. À chaque micro-tâche terminée et validée par son test (`OK`), mettre à jour le statut dans `MVP_X.md`, `projet.md` et cet `INDEX.md`.
3. Ne jamais coder une micro-tâche suivante avant que la feature en cours soit testée et validée.

