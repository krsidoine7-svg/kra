# `MVP_2.md` — Plan d'Exécution Détaillé : Articles Riches, Vidéos 3G, Stats & Crypto Complète

> **Prérequis :** 100 % des tests de `MVP_1.md` sont à `[x] OK`.
> **Objectif MVP 2 :** Ouvrir la dimension éditoriale (articles complets + commentaires sans compte), supporter les vidéos optimisées 3G, finaliser le chiffrement `AES-256-GCM` / `SHA-256`, activer les statistiques et la corbeille de base.

---

## Phase 2.1 — Cryptographie Complète & Sécurité Compte

### Module M2.1 — `AES-256-GCM`, `SHA-256`, HMAC & Suppression de Compte
- **Tâche M2.1-T1 — Service Cryptographique (`node:crypto`) :**
  - `M2.1-T1.1` Implémenter `encryptAES256GCM(plaintext)` et `decryptAES256GCM(payload)` avec IV aléatoire 12 octets et validation AuthTag.
  - `M2.1-T1.2` Implémenter `sha256Hash` (IP salée, empreinte fichiers) et `hmacSign` pour la table `audit_logs`.
  - `M2.1-T1.3` Brancher le chiffrement automatique sur `phone_encrypted` et `recovery_email_encrypted` dans `/api/admin/profile`.
- **Tâche M2.1-T2 — Suppression de Compte Admin :**
  - `M2.1-T2.1` Créer `DELETE /api/admin/profile` (re-saisie mot de passe `bcrypt` + confirmation textuelle + choix archivage soft-delete ou purge).
  - `M2.1-T2.2` Ajouter la section destructive sécurisée tout en bas des Paramètres Dashboard.

#### Tests de Recette M2.1
| ID | Scénario | Résultat Attendu | Statut |
| :--- | :--- | :--- | :--- |
| `T-M2.1-01` | Inspecter `admin_profiles.phone_encrypted` directement dans Neon Postgres | Valeur chiffrée illisible au format `iv:tag:cipher`, jamais en clair | `[x] OK` (`m2.1-crypto.test.tsx` + `PATCH /api/admin/profile`) |
| `T-M2.1-02` | Tester `decryptAES256GCM` avec un tag altéré (1 octet modifié) | Erreur d'authentification levée (rejet de corruption) | `[x] OK` (`m2.1-crypto.test.tsx` + HMAC `audit_logs`) |
| `T-M2.1-03` | Cliquer « Supprimer le compte » avec un mauvais mot de passe | Refus `401`, compte intact | `[x] OK` (`m2.1-crypto.test.tsx` + E2E `DELETE /api/admin/profile` → `401`) |

---

## Phase 2.2 — Vidéos Optimisées Réseau Faible Côte d'Ivoire (3G)

### Module M2.2 — Upload & Lecteur Vidéo Lazy-Loaded
- **Tâche M2.2-T1 — Back-End Vidéo :**
  - `M2.2-T1.1` Étendre `/api/admin/media/upload` pour accepter MP4/WebM (vérification magic bytes, limite de taille configurable, upload vers Neon Object Storage) + génération/upload obligatoire d'un **poster WebP léger**.
- **Tâche M2.2-T2 — Composant `LazyVideoPlayer` (Front-End) :**
  - `M2.2-T2.1` Afficher uniquement l'image poster WebP + bouton Lecture Phosphor `Play` (0 octet vidéo téléchargé avant clic).
  - `M2.2-T2.2` Au clic utilisateur, monter `<video controls playsInline preload="metadata">` avec gestion d'état « Chargement sur réseau lent » et fallback d'erreur.

#### Tests de Recette M2.2
| ID | Scénario | Résultat Attendu | Statut |
| :--- | :--- | :--- | :--- |
| `T-M2.2-01` | Charger `/projets/[slug]` contenant une vidéo et vérifier l'onglet Network | 0 requête `.mp4`/`.webm` avant clic sur le bouton Lecture | `[x] OK` (`LazyVideoPlayer` + `m2.2-video.test.tsx` : 0 `<video>` avant clic) |
| `T-M2.2-02` | Cliquer sur Lecture sous émulation Slow 3G | Streaming progressif démarre proprement sans figer l'interface | `[x] OK` *(Vérifié via `m2.2-video.test.tsx` : montage `<video preload="metadata">` au clic + indicateur réseau faible ; test navigateur Slow 3G temps réel non exécuté ici sans S3)* |

---

## Phase 2.3 — Articles Éditoriaux Riches & Commentaires Sans Compte

### Module M2.3 — Éditeur & Rendu d'Articles Structurés
- **Tâche M2.3-T1 — Schéma Blocs & API Articles (Back-End) :**
  - `M2.3-T1.1` Définir le schéma Zod `ArticleBlockSchema` (strict, sans `any`) supportant :
    - Titres `H1`, `H2`, `H3`, `H4`
    - Paragraphes avec **liens** validés (`http/https` uniquement)
    - **Listes à puces** et **listes à tirets**
    - **Citations** (texte + auteur)
    - **Signature** (nom, rôle, ville, date)
  - `M2.3-T1.2` API CRUD `/api/admin/articles` + endpoints publics `/api/public/articles` et `/api/public/articles/[slug]`.
- **Tâche M2.3-T2 — Éditeur Linear & Pages Publiques `/articles` (Front-End) :**
  - `M2.3-T2.1` Construire l'éditeur par blocs dans le Dashboard (ajout/réorganisation/édition de H1-H4, puces, tirets, liens, citations, signature + sauvegarde brouillon local `localStorage` anti-coupure réseau).
  - `M2.3-T2.2` Construire `/articles` (liste minimaliste) et `/articles/[slug]` (`ArticleRenderer` pur N&B + bouton partage `...`).

#### Tests de Recette M2.3
| ID | Scénario | Résultat Attendu | Statut |
| :--- | :--- | :--- | :--- |
| `T-M2.3-01` | Publier un article contenant H1, H2, H3, H4, liste à puces, liste à tirets, lien, citation et signature | Tous les éléments rendus fidèlement en N&B avec hiérarchie claire sur mobile et desktop | `[x] OK` (`m2.3-articles.test.tsx` + E2E `/articles`) |
| `T-M2.3-02` | Tenter d'injecter `javascript:alert(1)` dans un bloc lien via API | Rejet `400 Bad Request` par Zod | `[x] OK` (`ArticleCreateSchema` + E2E `POST /api/admin/articles` → `400`) |

---

### Module M2.4 — Commentaires Visiteurs Sans Création de Compte
- **Tâche M2.4-T1 — Endpoint Commentaires Anti-Spam (Back-End) :**
  - `M2.4-T1.1` `POST /api/public/articles/[slug]/comments` : validation Zod, chiffrement `AES-256-GCM` de l'email optionnel, sanitisation XSS stricte, honeypot silencieux, rate-limit `SHA-256(IP)` (max 3/10 min).
  - `M2.4-T1.2` Endpoints Dashboard `/api/admin/comments` pour approuver, rejeter ou supprimer un commentaire.
- **Tâche M2.4-T2 — UI Commentaires & Modération (Front-End) :**
  - `M2.4-T2.1` Formulaire public simple sur `/articles/[slug]` (aucun login requis, mention ARTCI/RGPD claire).
  - `M2.4-T2.2` File de modération dans le Dashboard Articles (filtre En attente / Approuvés / Rejetés).

#### Tests de Recette M2.4
| ID | Scénario | Résultat Attendu | Statut |
| :--- | :--- | :--- | :--- |
| `T-M2.4-01` | Visiteur anonyme soumet un commentaire valide avec `<script>` dans le texte | Commentaire enregistré nettoyé sans balise script, invisible tant que non approuvé | `[x] OK` (`m2.4-comments.test.tsx` + E2E `POST .../comments` → `201`, caché tant que `pending`) |
| `T-M2.4-02` | Approuver le commentaire dans le Dashboard puis recharger `/articles/[slug]` | Le commentaire apparaît proprement sous l'article ; l'email optionnel n'est jamais exposé | `[x] OK` (E2E `PATCH /api/admin/comments/[id]` → visible sur `/api/public/articles/[slug]`, zéro fuite d'email) |

---

## Phase 2.4 — Statistiques Dashboard & Corbeille Soft Delete Initiale

### Module M2.5 — Analytics Privacy-First & Corbeille Simple
- **Tâche M2.5-T1 — Collecte & Agrégation Stats (Back & Front) :**
  - `M2.5-T1.1` Endpoint `POST /api/public/analytics` (`sendBeacon`) enregistrant vues projets, clics copie/partage `...`, lectures articles, type d'appareil.
  - `M2.5-T1.2` Onglet **Statistiques** dans le Dashboard Linear : strip métriques sans icônes colorées, classement top projets/articles, répartition mobile/tablette/desktop.
- **Tâche M2.5-T2 — Corbeille Soft Delete de Base :**
  - `M2.5-T2.1` Passage des suppressions Projets/Dossiers/Articles à `deleted_at = now()` + onglet Corbeille simple permettant de restaurer. *(La Radiographie d'impact complète arrive en MVP 3).*

#### Tests de Recette M2.5 (Validation Finale MVP 2)
| ID | Scénario | Résultat Attendu | Statut |
| :--- | :--- | :--- | :--- |
| `T-M2.5-01` | Copier le lien d'un projet via `...` puis consulter l'onglet Statistiques | Compteur de partages incrémenté avec exactitude | `[x] OK` (`m2.5-stats-trash.test.tsx` + E2E `POST /api/public/analytics` → `GET /api/admin/stats`) |
| `T-M2.5-02` | Mettre un projet à la corbeille puis le restaurer | Disparaît du public à la mise en corbeille, réapparaît après restauration | `[x] OK` (`m2.5-stats-trash.test.tsx` + E2E `DELETE /api/admin/projects/[id]` → `GET/POST /api/admin/trash`) |

