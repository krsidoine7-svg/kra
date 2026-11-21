# Capture Brute — Brief Initial & Cadrage (2026-11-21)

Source : Prompts utilisateur + références [brainstorming.md](../../../brainstorming.md) & [brainstorming-framer.md](../../../brainstorming-framer.md) + skills dans `skills/`.

## 1. Exigences brutes exprimées
- Site web fonctionnant comme un **portfolio minimaliste** en **noir et blanc**.
- **Hero** obligatoirement fidèle à [brainstorming.md](../../../brainstorming.md) (référence *ALTENNIS*), enrichi de la structure de crédibilité de [brainstorming-framer.md](../../../brainstorming-framer.md) (compétences, logos, à propos — sans statistiques inventées).
- Présenter les **projets actuels** et les **futurs projets à venir**, ainsi que les **articles écrits** par le propriétaire.
- **Scroll-driven effects / animations au scroll** : la page d'accueil ne doit **pas être longue** ; les visiteurs doivent pouvoir **scroller tout en restant sur la même section** pour la section Projets, avec **au maximum 3 projets** sur l'accueil, puis un bouton **« Voir plus de projets »** menant vers une page dédiée (`/projets`) pour voir tous les projets, les trier, filtrer, etc.
- **Partage & Liens** : page publique partageable ; chaque projet est partageable par lien direct ; menu **`...` (trois petits points)** contenant les boutons **Copier le lien** et **Partager le lien**.
- **Connexion masquée** : aucun bouton de connexion visible sur le portfolio public.
- **Dashboard Admin (style Linear)** :
  - Sidebar responsive (mobile, tablette, desktop).
  - Onglets & sections : Vue d'ensemble / **Statistiques**, **Projets** (ajouter, modifier, publier sur la page d'accueil, gérer multi-photos + vidéos), **Dossiers** (créer des dossiers et y placer des projets affichés sur le portfolio dans la section des projets réalisés), **Articles**, **CMS complet** (modifier tous les textes, images, logos, réseaux sociaux, descriptions, titres de sections, etc.), **Paramètres personnels** (nom, prénom, mail, numéro de téléphone, modifier mot de passe, bouton supprimer le compte).
- **Articles riches** : titres de différentes tailles, listes à puces, listes à tirets, liens, citations, commentaires, signature.
- **Contexte Côte d'Ivoire (réseau faible / mobile-first)** : conception mobile-first, chargement rapide sur connexion instable/3G, affichage progressif des informations, optimisation multi-photos et vidéos.
- **Stack & Contraintes techniques** :
  - React, Next.js stable, Tailwind CSS, `shadcn/ui`, Neon (Postgres, Object Storage), `bcrypt`, `AES`, hachage, sécurité OWASP, SEO, GEO, Scalar.
  - **Interdiction de `any` côté front-end** (TypeScript strict), composants réutilisables, bonnes pratiques Git & GitHub.
- **Fonctionnalités ciblées MVP 3 / MVP 4** :
  - Filtres avancés
  - Sauvegarde de recherche
  - Soft delete & Radiographie d'impact
  - Carte interactive
  - Mémoire qui enregistre toutes les sections
- **Méthode de construction** :
  - Feature par feature, test à chaque feature avant de passer à la suivante.
  - Découpage en **Phases → Modules → Tâches → Micro-tâches**.

## 2. Réponses de Cadrage Validées (2026-11-21)
- **Identité du propriétaire :** **Manu KRA**
- **Domaine :** **Communication & Économie**
- **Palette :** Monochrome éditorial Noir & Blanc (`#F7F5F2` / `#FFFFFF` et `#111111` / `#0A0A0A`).
- **Plafond de projets sur la page d'accueil :** **3 projets maximum** (section scroll-pinned).
- **Typage :** TypeScript strict validé (zéro `any`).
- **Icônes :** Respect strict de `minimalist-skill` — **interdiction de Lucide** ; utilisation de **Phosphor Icons** (`@phosphor-icons/react`, poids Bold/Fill/Regular unifié) et/ou **Radix UI Icons**.
- **Commentaires sur les articles :** Ouverts aux visiteurs **sans création de compte** (avec protection anti-spam et modération admin).
- **Contenu initial :** Exemples réalistes à générer pour Manu KRA (Communication & Économie), 100 % modifiables depuis le CMS.

## 3. Liens de référence fournis
- https://ui.shadcn.com/
- https://vercel.com/docs
- https://docs.github.com/en
- https://scalar.com/
- https://developer.mozilla.org/fr/docs/Web/JavaScript
- https://developer.mozilla.org/fr/docs/Web/API
- https://developer.mozilla.org/fr/docs/Web
- https://skills.sh/
- https://app.itsasync.fr/herald
- https://github.com/itsasync/AsyncHerald

