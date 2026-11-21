# `PRD.md` — Product Requirements Document (La Bible Fonctionnelle)

> **Produit :** Portfolio Minimaliste, CMS & Studio Linear de **Manu KRA**
> **Secteur :** **Communication & Économie** (Conseil stratégique, Analyse économique, Éditorial, Projets numériques)
> **Zone cible :** Côte d'Ivoire (réseau 3G / Mobile-First) & International

---

## 1. Positionnement & Proposition de Valeur

Le produit est une plateforme web personnelle unifiant :
1. **Une vitrine publique minimaliste et partageable** conçue pour convaincre un client, une institution ou un partenaire en moins de 5 secondes, tout en restant fluide sur une connexion mobile faible en Côte d'Ivoire.
2. **Un espace d'administration privé (style Linear)** totalement invisible depuis l'interface publique, permettant à Manu KRA de gérer ses **projets actuels et futurs**, ses **dossiers thématiques**, ses **articles économiques/communication**, ses **logos**, **tout le contenu CMS du site** et ses **paramètres personnels**.

---

## 2. Personas & Droits d'Accès

| Persona | Description | Accès & Capacités |
| :--- | :--- | :--- |
| **Visiteur Public** | Recruteur, client institutionnel, partenaire économique, lecteur (mobile/desktop) | Consulte la vitrine `/`, explore les 3 projets phares au scroll, navigue vers `/projets`, lit `/articles`, partage via `...`, laisse des commentaires **sans créer de compte**. Ne voit **jamais** de bouton de connexion. |
| **Administrateur Unique (Manu KRA)** | Propriétaire du portfolio | Accède via une **URL secrète masquée** (`ADMIN_LOGIN_PATH`), s'authentifie (`bcrypt` + cookie sécurisé), pilote l'ensemble du **Dashboard Linear** et du **CMS**. |

---

## 3. Exigences Détaillées par Section (Front-End & Back-End)

### S01 — Header Public Minimaliste
- **Front-End :**
  - Structure héritée de [brainstorming.md](../brainstorming.md) :
    - Gauche : Logo SVG/image modifiable via CMS + wordmark **`MANU KRA`**.
    - Centre (desktop) : Navigation sobre de 4 liens max (`Accueil`, `Projets`, `Articles`, `À propos`).
    - Droite : Bouton menu burger (mobile/tablette) ouvrant un tiroir épuré plein écran.
  - **Règle de discrétion :** Aucun bouton « Connexion », « Login », « Admin » ou icône cadenas visible.
- **Back-End :**
  - Les libellés, liens et logos du header sont lus depuis `cms_sections` (`section_key = 'header'`) avec mise en cache Edge/ISR et revalidation immédiate après modification dans le Dashboard.

---

### S02 — Hero Obligatoire (*Référence ALTENNIS — `brainstorming.md`*)
- **Front-End :**
  - **Titre géant (H1)** sur plusieurs lignes décalées sur desktop (gauche / centre / droite) et alignées à gauche sur mobile/tablette, avec jeu typographique fin sur le `&` :
    > *Exemple initial généré pour Manu KRA (modifiable via CMS) :*
    > `COMMUNICATION` / `STRATÉGIQUE &` / `ANALYSE ÉCONOMIQUE` / `AU SERVICE DE` / `L'IMPACT.`
  - **Label monospace technique :** `[ COMMUNICATION & ÉCONOMIE ]` (100 % éditable).
  - **Bloc bas gauche :** 2 paragraphes courts éditables (1 : approche / philosophie de travail ; 2 : ancrage Côte d'Ivoire / international & disponibilité).
  - **Bloc bas droit :** Portrait de Manu KRA (chargé en WebP/AVIF + placeholder flouté LQIP < 1 Ko).
  - **Liens bas de Hero :** `[ VOIR LES PROJETS ]` `[ À PROPOS ]` (actions rapides sans bruit visuel).
  - **Animation d'entrée :** Révélation propre des lignes au chargement (≤ 800 ms, texte lisible dès le frame 0 sans preloader bloquant, respect strict de `prefers-reduced-motion`).
- **Back-End :**
  - Lecture SSR depuis `cms_sections` (`section_key = 'hero'`), incluant les URLs signées/CDN du portrait et des textes. Validation Zod des champs (longueur max pour éviter de casser la mise en page en escalier).

---

### S03 — Section Projets sur l'Accueil (Scroll-Driven, Courte, Max 3 Projets)
- **Contrainte stricte :** La page d'accueil **ne doit pas être longue**. Le visiteur doit pouvoir **scroller tout en restant sur la même section** pour découvrir les projets phares.
- **Plafond strict :** **Maximum 3 projets** publiés sur la page d'accueil (`is_featured_home = true`, limit `3`).
- **Front-End :**
  - Desktop & Tablette : Conteneur `section` épinglé (`position: sticky; top: 0; height: 100svh`) d'une hauteur de défilement de ~`300vh` (1 écran par projet). Au fur et à mesure du scroll vertical natif (sans capturer la molette), la scène fait transitionner les 3 projets horizontalement/en couches avec indicateur discret (`1 / 3`).
  - Mobile (390px) : Version fluide allégée (scroll snap horizontal tactile ou cartes empilées compactes selon préférence de lisibilité sans bloquer le pouce).
  - Chaque carte projet affiche : vignette optimisée (WebP + LQIP), badge sobre de statut (`Réalisé` ou `À venir`), nom du dossier, titre, résumé court, année, bouton **« Voir le projet »** et menu **`...` (Copier le lien / Partager)**.
  - Fin de section : Bouton bien visible **`Voir plus de projets →`** redirigeant vers `/projets`.
- **Back-End :**
  - Requête optimisée `SELECT` plafonnée à `LIMIT 3` sur `projects` où `is_featured_home = true AND deleted_at IS NULL AND status IN ('published', 'upcoming')`, triée par `featured_order ASC`.
  - Contrainte métier côté API : si l'admin active le 4e projet sur l'accueil, l'API propose soit de remplacer le plus ancien, soit de refuser tant que 3 projets sont déjà épinglés (garde-fou garanti Front + Back).

---

### S04 — Section Dossiers / Projets Réalisés & Projets à Venir
- **Front-End :**
  - Présentation synthétique et minimaliste des **Dossiers** créés par Manu KRA (ex. *Stratégie & Image*, *Études Économiques*, *Initiatives à Venir*).
  - Cliquer sur un dossier ouvre soit l'aperçu rapide de ses projets, soit `/projets?dossier=<slug>`.
  - Distinction claire entre **Projets réalisés (actuels)** et **Projets à venir (roadmap / en préparation)**.
- **Back-End :**
  - Table `folders` reliée aux projets (relation `1:N` ou `N:N` via `project_folders`), comptage dynamique des projets publiés par dossier (excluant les éléments soft-deleted).

---

### S05 — Crédibilité : Compétences, Logos & À Propos (*Inspiré de `brainstorming-framer.md`*)
- **Front-End :**
  - **Compétences** : Grille minimaliste en 4 colonnes (1 ligne titre + 1 phrase courte) modifiable via CMS.
    *Exemples générés :* `Conseil en Communication`, `Analyse Économique & Marchés`, `Stratégie Éditoriale`, `Pilotage de Projets & Plaidoyer`.
  - **Logos (Clients / Partenaires / Institutions / Outils)** : Bandeau sobre monochrome (niveaux de gris, séparation `1px`) 100 % géré depuis le Dashboard (ajout/suppression/ordre de logos SVG/WebP).
  - **À Propos & Réseaux Sociaux + Footer** : Biographie courte en 2 colonnes + liens réseaux sociaux (LinkedIn, X, Email, etc.) éditables depuis le CMS.
- **Back-End :**
  - Tables dédiées `skills`, `logos` et `cms_sections` (`about`, `socials`, `footer`) avec support SVG sanitizé ou image WebP sur Neon Object Storage.

---

### S06 — Page Catalogue Complète (`/projets`) & Page Détail (`/projets/[slug]`)
- **Front-End (`/projets`) :**
  - Affiche tous les projets publics (actuels et à venir).
  - Barre de recherche instantanée, tri (plus récents, alphabétique, statut), sélection par **Dossier**.
  - *(MVP 3)* **Filtres avancés** (dossier, statut `Réalisé` / `À venir`, type média, année, ville/pays) + **Sauvegarde de recherche** (sauvegarde d'une combinaison de filtres en raccourci).
- **Front-End (`/projets/[slug]`) :**
  - Page complète partageable : titre, dossier, statut (`Réalisé` / `À venir`), contexte économique/communication, galerie **multi-photos** optimisée (WebP + lightbox légère), **vidéos** (poster WebP + lecture à la demande `preload="none"`), liens externes.
  - **Menu `...` (trois petits points)** présent sur les cartes ET sur la page détail :
    1. **Copier le lien** (copie l'URL canonique + toast de confirmation discret).
    2. **Partager le lien** (déclenche `navigator.share` sur mobile/navigateurs compatibles, ou menu fallback WhatsApp / LinkedIn / X / Email).
- **Back-End :**
  - Génération dynamique de métadonnées **OpenGraph / Twitter Card** (`/api/og` ou `opengraph-image.tsx`) pour qu'un lien collé sur WhatsApp ou LinkedIn affiche le titre, la description et la couverture du projet.
  - Compteur de vues & de partages enregistré de façon anonyme dans `analytics_events` (sans cookies publicitaires).

---

### S07 — Section Articles & Éditorial Riche (`/articles` & `/articles/[slug]`)
- **Front-End :**
  - Liste minimaliste d'articles (aperçu des 2–3 derniers sur la page dédiée ou section compacte).
  - Contenu riche pris en charge par l'éditeur structuré (rendu propre N&B) :
    - **Titres de différentes tailles** (`H1`, `H2`, `H3`, `H4`),
    - **Listes à puces** (`ul`),
    - **Listes à tirets** (`ul.list-dash`),
    - **Liens hypertextes** (internes et externes `rel="noopener noreferrer"`),
    - **Citations** (`blockquote` avec source/auteur),
    - **Signature** personnalisée de fin d'article (ex. *Manu KRA — Abidjan*, éditable/globale ou par article).
  - **Section Commentaires (Sans création de compte)** :
    - Formulaire simple : Nom / Pseudo, Email (optionnel, jamais affiché en public), Commentaire.
    - Affichage clair des commentaires approuvés + horodatage.
- **Back-End :**
  - Stockage des articles en **blocs JSON typés stricts** (validés par Zod, zéro HTML brut dangereux) ou Markdown strict sanitizé.
  - Endpoint `POST /api/articles/[slug]/comments` avec **rate limiting IP**, champ **honeypot anti-bot**, sanitisation XSS stricte, hash IP `SHA-256` anti-abus, et statut `pending` / `approved` modérable depuis le Dashboard.

---

### S08 — Dashboard Admin Style Linear (Connexion Masquée)
- **Accès Masqué :**
  - Route secrète définie par variable d'environnement (ex. `/studio-kra-access`). Aucun lien public, `robots: noindex, nofollow`.
  - Écran de connexion épuré N&B + verrouillage temporaire après tentatives échouées.
- **Ergonomie Style Linear (`taste-skill/app-screens.md`) :**
  - **Sidebar responsive** (fixe 232px sur desktop, tiroir plein écran / topbar 48px sur mobile) + palette de commande rapide **`Cmd/Ctrl + K`**.
  - Surfaces plates, bordures `1px`, zéro ombre inutile, zéro gradient, zéro emoji.
  - **Onglets du Dashboard :**
    1. **Vue d'ensemble & Statistiques** : Vues totales, partages par projet, projets publiés vs à venir, articles lus, commentaires en attente de modération.
    2. **Projets** : Liste filtrable, création/édition complète (titre, slug, dossier, statut `Réalisé` / `À venir` / `Brouillon`, toggle `Publier sur l'accueil` avec compteur `X/3`, galerie **multi-photos**, ajout/gestion **vidéos**, localisation pour MVP 4, menu `...` Copier/Partager lien, Soft Delete).
    3. **Dossiers** : Création/édition/réorganisation de dossiers, affectation des projets aux dossiers, contrôle de visibilité sur le portfolio.
    4. **Articles** : Éditeur structuré (H1–H4, puces, tirets, liens, citations, signature), modération des commentaires visiteurs.
    5. **CMS Site** : Édition intégrale par sections (`Hero`, `Header`, `Compétences`, `Logos`, `À propos`, `Réseaux sociaux`, `Titres & descriptions de sections`, `Footer`) avec prévisualisation directe et revalidation instantanée du site public.
    6. **Corbeille & Radiographie d'Impact** *(MVP 2 → MVP 3)* : Vue des éléments soft-deleted, restauration en 1 clic, **Radiographie d'Impact** avant suppression définitive ou suppression d'un dossier/projet/logo (liste exacte des liens, projets, articles ou sections CMS impactés).
    7. **Mémoire des Sections** *(MVP 4)* : Historique horodaté et empreinte `SHA-256` de toutes les versions de sections CMS / projets / articles avec comparaison et restauration.
    8. **Paramètres Personnels** : Nom (`KRA`), Prénom (`Manu`), Email, Numéro de téléphone (chiffrés en `AES-256-GCM`), changement de mot de passe (`bcrypt`), export des données, **bouton Supprimer le compte** (double confirmation forte).

---

### S09 — Fonctionnalités MVP 3 & MVP 4 (Planification Isolée)
- **MVP 3 :** Filtres avancés, Sauvegarde de recherche, Soft Delete complet + **Radiographie d'Impact**, Documentation **Scalar** OpenAPI, SEO/GEO avancé (`llms.txt`, JSON-LD).
- **MVP 4 :** **Carte interactive** des projets (Côte d'Ivoire & International, chargée en lazy-loading uniquement au clic/visibilité pour ne pas pénaliser la 3G), **Mémoire globale qui enregistre toutes les sections** (`section_memory_snapshots`), cache résilient réseau faible.

---

## 4. Contenu Initial Généré pour Manu KRA (Modifiable 100 % via CMS)

| Élément | Exemple Initial Généré |
| :--- | :--- |
| **Wordmark** | `MANU KRA` |
| **Label Hero** | `[ COMMUNICATION & ÉCONOMIE ]` |
| **Titre Hero** | `STRATÉGIE DE COMMUNICATION & ANALYSE ÉCONOMIQUE POUR PROJETS À IMPACT.` |
| **Dossiers initiaux** | `01. Stratégie & Communication` · `02. Études & Économie` · `03. Projets à Venir` |
| **3 Projets initiaux (Accueil)** | 1. *Observatoire des Marchés Urbains — Abidjan* (`Réalisé`, Économie) · 2. *Identité & Campagne Institutionnelle Horizon CI* (`Réalisé`, Communication) · 3. *Indice Numérique des PME Ivoiriennes* (`À venir`, Économie & Com) |
| **Articles initiaux** | 1. *Lire l'économie informelle ouest-africaine par ses flux de communication* · 2. *Pourquoi la sobriété éditoriale augmente la confiance institutionnelle* |

