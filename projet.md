# `projet.md` — Dossier Maître du Portfolio Minimaliste, CMS & Dashboard Linear de **Manu KRA**

> **Propriétaire :** **Manu KRA** — Domaine : **Communication & Économie** (Côte d'Ivoire & International)
> **Statut global :** Cadrage & Documentation complète livrés — Prêt pour la construction incrémentale **MVP 1 → Module par Module → Micro-tâche par Micro-tâche**
> **Règle d'or :** Construire **feature par feature** et valider les tests de chaque feature avant de passer à la suivante.

---

## 1. Vision & Objectif du Produit

Concevoir un **portfolio web minimaliste noir et blanc**, immersif, **mobile-first** et optimisé pour les **connexions internet faibles en Côte d'Ivoire (3G/réseau instable)**, servant simultanément :
1. **De vitrine publique partageable** présentant le positionnement de **Manu KRA** en **Communication et Économie**, ses **projets actuels et futurs projets à venir** (organisés par dossiers), ses **articles éditoriaux**, ses **compétences** et les **logos** de ses partenaires, institutions ou clients.
2. **D'outil de gestion autonome (Dashboard style Linear + CMS intégral)** accessible uniquement via une **connexion masquée** (aucun bouton de connexion sur la page publique), permettant de modifier chaque texte, image, vidéo, logo, titre de section, réseau social, dossier, projet et article sans toucher au code.

---

## 2. Principes Non Négociables

| Pilier | Règle stricte retenue |
| :--- | :--- |
| **Identité & Hero Obligatoire** | Structure éditoriale issue de [brainstorming.md](./brainstorming.md) (*ALTENNIS*) adaptée à **Manu KRA** (Communication & Économie) : header ultra-épuré, titre géant décalé sur desktop (responsive mobile), tag mono `[ COMMUNICATION & ÉCONOMIE ]`, 2 paragraphes courts + portrait. |
| **Page d'accueil courte & Scroll-Driven** | La section Projets reste **épinglée (`position: sticky`)** pendant le scroll : les projets défilent dans la même section sans allonger la page. **Maximum 3 projets** affichés sur l'accueil, suivis d'un bouton **« Voir plus de projets »** menant à `/projets`. |
| **Esthétique Noir & Blanc** | Monochrome éditorial pur et chaud (`#F7F5F2` / `#FFFFFF` et `#111111` / `#0A0A0A`), contrastes WCAG AA ≥ 4.5:1, zéro gradient décoratif, zéro ombre lourde, zéro emoji. |
| **Icônes (`minimalist-skill`)** | **Lucide est banni** conformément à `minimalist-skill`. Utilisation exclusive de **`@phosphor-icons/react`** (poids uniformisé) et/ou **Radix UI Icons**, y compris dans les composants `shadcn/ui`. |
| **Partage par lien (`...`)** | Page publique partageable ; chaque projet possède son URL canonique avec aperçu OpenGraph et un menu **`...` (trois petits points)** proposant **Copier le lien** et **Partager le lien**. |
| **Articles & Commentaires sans compte** | Articles riches (titres H1–H4, listes à puces, listes à tirets, liens, citations, signature) avec **commentaires ouverts aux visiteurs sans création de compte** (anti-spam + modération admin). |
| **Dashboard style Linear** | Connexion totalement masquée. Sidebar responsive, navigation clavier (`Cmd/Ctrl+K`), vues Statistiques, Projets (multi-photos + vidéos + toggle Home + statut actuel/à venir), Dossiers, Articles, CMS complet, Paramètres personnels (nom, prénom, mail, téléphone, mot de passe, suppression de compte). |
| **Performance Côte d'Ivoire (3G)** | Mobile-first strict, RSC Next.js, images **WebP/AVIF + LQIP (< 1 Ko)**, vidéos avec poster léger et `preload="none"`, lazy-loading des modules lourds. |
| **Code & Sécurité OWASP** | **TypeScript strict avec zéro `any`** (`@typescript-eslint/no-explicit-any: error`), Zod, `bcryptjs`, `AES-256-GCM`, `SHA-256/HMAC`, protection OWASP Top 10, Neon Postgres + Neon Object Storage. |

---

## 3. Cartographie Complète de la Documentation

| Document | Rôle & Périmètre | Lien |
| :--- | :--- | :--- |
| **PRD (Bible Fonctionnelle)** | Personas, user stories, règles fonctionnelles Front & Back de chaque section | [docs/PRD.md](./docs/PRD.md) |
| **Product Flow** | Diagrammes de parcours complets (Public, Partage `...`, Auth masquée, Dashboard, Radiographie, Mémoire) | [docs/PRODUCT_FLOW.md](./docs/PRODUCT_FLOW.md) |
| **Design System** | Tokens 3 couches (`Primitive → Semantic → Component`), N&B, Typo, Phosphor Icons, Scroll-Pinned, Linear UI | [docs/DESIGN_SYSTEM.md](./docs/DESIGN_SYSTEM.md) |
| **TDD (Bible Technique)** | Next.js App Router, TypeScript strict sans `any`, Zod, ScrollTrigger/CSS scroll-timelines, Média 3G | [docs/TDD.md](./docs/TDD.md) |
| **Architecture Système** | Front, Back, Edge CDN, Neon Lakebase Postgres, Neon Object Storage, Revalidation On-demand | [docs/ARCHITECTE.md](./docs/ARCHITECTE.md) |
| **Stack Technologique** | Inventaire complet des outils, versions cibles, liens officiels et justifications | [docs/STACK.md](./docs/STACK.md) |
| **MCD (Modèle Conceptuel)** | Entités, relations, cardinalités (`erDiagram` Mermaid) | [docs/MCD.md](./docs/MCD.md) |
| **Schéma BDD (PostgreSQL)** | Tables Drizzle/SQL, `deleted_at` (Soft Delete), champs chiffrés AES, hashes SHA-256, pooled vs unpooled | [docs/DB_SCHEMA.md](./docs/DB_SCHEMA.md) |
| **API & OpenAPI Scalar** | Endpoints REST Publics & Admin, schémas Zod, codes d'erreur, spec OpenAPI 3.1 pour **Scalar** | [docs/API.md](./docs/API.md) |
| **Sécurité & Cryptographie** | OWASP Top 10, Auth masquée, `bcrypt`, `AES-256-GCM`, `SHA-256`, CSP, rate limit, sanitisation XSS | [docs/SECURITY.md](./docs/SECURITY.md) |
| **Conformité Légale (CI & Monde)** | Loi n° 2013-450 (Côte d'Ivoire / ARTCI), Loi n° 2013-546, RGPD, mentions légales, commentaires | [docs/LEGAL_WORLD_CI.md](./docs/LEGAL_WORLD_CI.md) |
| **Git & GitHub** | Branches, Conventional Commits, PR, CI GitHub Actions (`tsc`, `eslint`, `vitest`, `build`), secrets | [docs/GITHUB.md](./docs/GITHUB.md) |
| **KPI & Budget 3G** | Budget poids réseau faible CI, Core Web Vitals, SEO, GEO (`llms.txt`) & indicateurs d'engagement | [docs/KPI.md](./docs/KPI.md) |
| **Roadmap (PRD → MVP → Versions)** | Stratégie de livraison par paliers MVP 1 → MVP 4 adaptée à la Côte d'Ivoire | [docs/ROADMAP.md](./docs/ROADMAP.md) |
| **Plan MVP 1** | Socle, Hero ALTENNIS, Scroll 3 Projets, Partage `...`, Auth Masquée, Dashboard Linear, Dossiers, CMS | [docs/MVP_1.md](./docs/MVP_1.md) |
| **Plan MVP 2** | Articles riches, Commentaires sans compte, Vidéos 3G, Stats, AES-256-GCM / SHA-256, Suppression Compte | [docs/MVP_2.md](./docs/MVP_2.md) |
| **Plan MVP 3** | Filtres avancés, Sauvegarde recherche, Soft Delete & Radiographie d'impact, Scalar, SEO/GEO | [docs/MVP_3.md](./docs/MVP_3.md) |
| **Plan MVP 4** | Carte interactive (lazy 3G), Mémoire globale des sections & restauration, Résilience hors-ligne | [docs/MVP_4.md](./docs/MVP_4.md) |
| **Mémoire du Projet** | Double mémoire : Inbox brute + Brain structuré + Arbitrages LLM Council | [MEMORY/02_STRUCTURED_BRAIN/INDEX.md](./MEMORY/02_STRUCTURED_BRAIN/INDEX.md) |

---

## 4. Synthèse du Découpage MVP 1 → MVP 4

| Version | Objectif Principal | Livrable Testable |
| :--- | :--- | :--- |
| **MVP 1** | **Vitrine Minimaliste Opérationnelle + CMS & Dashboard Core** | Site public rapide en 3G avec Hero *Manu KRA*, 3 projets scroll-pinned, dossiers, `/projets`, partage `...`, auth masquée, dashboard Linear (Projets, Dossiers, CMS complet, Logos, Profil). |
| **MVP 2** | **Éditorial, Médias Vidéo & Cryptographie Complète** | Articles complets (H1–H4, listes, citations, signature, commentaires sans compte), vidéos lazy 3G, multi-photos HD/WebP, Statistiques, `AES-256-GCM` & `SHA-256`, suppression compte, corbeille simple. |
| **MVP 3** | **Découverte Avancée, Intégrité des Suppressions & GEO/SEO** | Filtres avancés, sauvegarde de recherches, **Soft Delete + Radiographie d'impact**, documentation **Scalar**, `llms.txt` & JSON-LD complets. |
| **MVP 4** | **Exploration Géographique & Mémoire Temporelle** | **Carte interactive** des projets (lazy-loaded 3G), **Mémoire globale des sections** (snapshots/historique CMS avec diff & restauration), cache hors-ligne avancé. |

---

## 5. Références Utiles
- UI & Primitives : [shadcn/ui](https://ui.shadcn.com/) · [Phosphor Icons](https://phosphoricons.com/)
- Déploiement & Edge : [Vercel Docs](https://vercel.com/docs) · [Neon Docs](https://neon.com/docs)
- Versioning & CI : [GitHub Docs](https://docs.github.com/en)
- API Explorer : [Scalar](https://scalar.com/)
- Standards Web : [MDN Web Docs (FR)](https://developer.mozilla.org/fr/docs/Web) · [MDN JavaScript](https://developer.mozilla.org/fr/docs/Web/JavaScript) · [MDN Web APIs](https://developer.mozilla.org/fr/docs/Web/API)
- Skills & Veille : [skills.sh](https://skills.sh/) · [AsyncHerald](https://app.itsasync.fr/herald) · [GitHub AsyncHerald](https://github.com/itsasync/AsyncHerald)

---

## 6. Journal des Décisions
- `2026-11-20` — Analyse référence Hero ALTENNIS ([brainstorming.md](./brainstorming.md)).
- `2026-11-21` — Analyse référence Framer ([brainstorming-framer.md](./brainstorming-framer.md)), arbitrage `LLM Council` (identifiant **Manu KRA**, domaine **Communication & Économie**, max **3 projets** sur l'accueil, **zéro Lucide → Phosphor Icons**, **zéro `any` TS strict**, **commentaires sans compte**).
- `2026-11-21` — Génération complète des 18 documents de référence (`projet.md`, `docs/*`, `MEMORY/*`).
- **Prochaine étape :** Lancer **MVP 1 — Phase 1 — Module M01** sur validation finale des documents.

