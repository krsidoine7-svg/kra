# `PRODUCT_FLOW.md` — Parcours Utilisateurs & Flux Métiers

> Description détaillée des parcours **Visiteur Public**, **Lecteur d'Article** et **Administrateur (Manu KRA)**, incluant les cas nominaux et les cas limites/réseau faible.

---

## 1. Vue d'Ensemble des Parcours (Flowchart Global)

```mermaid
flowchart TD
    V["Visiteur Public (Mobile 3G / Desktop)"] --> HOME["Page d'Accueil / (Hero Manu KRA + 3 Projets Scroll-Pinned)"]
    HOME -->|"Scrolle sur la même section"| S1["Projet 1 -> Projet 2 -> Projet 3"]
    HOME -->|"Clic 'Voir plus de projets'"| CAT["Page /projets (Catalogue complet, Dossiers, Tri, Filtres MVP3)"]
    S1 -->|"Clic 'Voir'"| DET["Page /projets/[slug] (Multi-photos, Vidéo à la demande)"]
    CAT -->|"Clic projet"| DET
    DET -->|"Menu '...'"| SHARE["Copier le lien / Partager (WhatsApp, LinkedIn, X)"]
    HOME -->|"Menu Articles"| BLOG["Page /articles"]
    BLOG -->|"Clic article"| ART["Page /articles/[slug] (H1-H4, Listes, Citations, Signature)"]
    ART -->|"Sans créer de compte"| COM["Publier un commentaire (Rate-limit + Anti-XSS -> Modération)"]

    ADM["Manu KRA (Admin)"] -->|"URL secrète masquée"| LOGIN["Connexion Masquée (bcrypt + Session HttpOnly)"]
    LOGIN -->|"Succès"| DASH["Dashboard Linear (Sidebar Responsive + Cmd+K)"]
    DASH --> P_MOD["Projets & Dossiers (Toggle Accueil max 3, Multi-photos, Vidéos)"]
    DASH --> A_MOD["Articles & Modération Commentaires"]
    DASH --> C_MOD["CMS Intégral (Hero, Textes, Logos, Réseaux, Images)"]
    DASH --> S_MOD["Statistiques & Paramètres Perso (AES-256-GCM)"]
    P_MOD -->|"Suppression MVP3"| RADIO["Radiographie d'Impact -> Soft Delete / Corbeille"]
    C_MOD -->|"Sauvegarde MVP4"| MEM["Mémoire Globale des Sections (Snapshots SHA-256)"]
```

---

## 2. Parcours 1 — Visiteur Public : Découverte Rapide & Partage (`...`)

### Séquence nominale
1. Le visiteur ouvre `/` sur smartphone en connexion 3G en Côte d'Ivoire.
2. **Rendu immédiat (SSR) :** Le Header (`MANU KRA`), le Hero ALTENNIS (titre géant, `[ COMMUNICATION & ÉCONOMIE ]`, 2 paragraphes, portrait LQIP puis WebP) s'affichent sans écran de chargement bloquant.
3. Le visiteur scrolle vers la section Projets : la section s'épingle (`sticky`) et les **3 projets phares** (max 3) défilent progressivement au rythme du scroll sans rallonger la page.
4. Sur un projet qui l'intéresse, il clique sur le bouton **`...` (trois petits points)** :
   - **Action A — Copier le lien :** Copie `https://domaine/projets/<slug>` via `navigator.clipboard.writeText` (avec fallback si navigateur ancien) et affiche « Lien copié ».
   - **Action B — Partager le lien :** Appelle `navigator.share({ title, text, url })` sur mobile ; sur desktop non compatible, ouvre une liste sobre (WhatsApp, LinkedIn, X, Email).
5. S'il veut explorer davantage, il clique sur **« Voir plus de projets »** → arrive sur `/projets`, filtre par **Dossier** ou statut (**Réalisés** / **À venir**), puis ouvre `/projets/[slug]`.
6. Sur la page projet, les **photos** chargent en lazy WebP avec blur initial, et la **vidéo** reste à l'état de poster léger tant qu'il ne clique pas sur Lecture.

### Cas d'échec & dégradation
- **Connexion coupée / très lente :** Le texte complet du projet reste lisible instantanément ; les images affichent le placeholder monochrome LQIP ; bouton « Réessayer » sur la vidéo si timeout.
- **Lien partagé vers un projet archivé ou inexistant :** Page 404 minimaliste avec retour direct vers `/projets`.

---

## 3. Parcours 2 — Lecteur : Articles & Commentaires Sans Compte

```mermaid
sequenceDiagram
    participant L as Lecteur (Sans Compte)
    participant N as Next.js Server / API
    participant DB as Neon Postgres
    participant A as Manu KRA (Dashboard)

    L->>N: GET /articles/[slug]
    N->>DB: Récupère article publié + commentaires approuvés
    DB-->>N: Données structurées (blocs JSON + signature)
    N-->>L: Page article N&B rendue en SSR
    L->>N: POST /api/articles/[slug]/comments (Nom, Email opt., Texte + Honeypot)
    N->>N: Validation Zod + Rate Limit (IP SHA-256) + Sanitisation XSS
    N->>DB: INSERT article_comments (status = 'pending')
    N-->>L: 201 Created ("Commentaire envoyé, en attente de validation")
    A->>N: Dashboard -> Articles -> Modération
    A->>DB: PATCH status = 'approved' + revalidation page
```

---

## 4. Parcours 3 — Admin Masqué (Manu KRA) : Dashboard Linear & Publication Accueil

1. **Accès secret :** Manu KRA saisit directement l'URL cachée (ex. `/acces-studio-kra` configurée dans `.env`). Aucun bouton sur le site ne mène à cette URL. Une mauvaise route renvoie `404`.
2. **Authentification :** Saisie email/identifiant + mot de passe. Vérification `bcryptjs` + rate limit anti-bruteforce (5 tentatives / 15 min). Création session en DB (`SHA-256` du token) + cookie `HttpOnly`.
3. **Gestion Projets & Plafond Accueil (Max 3) :**
   - Manu crée un dossier *« Études Économiques »* dans l'onglet **Dossiers**.
   - Il crée un projet *« Indice des Prix Abidjan 2026 »* (statut `À venir` ou `Réalisé`), importe 4 photos (compressées automatiquement en WebP + LQIP) et 1 vidéo (avec poster).
   - Il active le switch **« Publier sur l'accueil »**. Si 3 projets sont déjà épinglés sur l'accueil, une modale Linear lui demande lequel remplacer (garantissant toujours `≤ 3` projets sur l'accueil).
4. **Édition CMS Intégrale :**
   - Dans l'onglet **CMS Site**, il modifie le titre du Hero, un logo partenaire ou un lien LinkedIn.
   - Sauvegarde en base → snapshot automatique dans la **Mémoire des Sections** *(MVP 4)* → `revalidatePath('/')` rend le changement instantané en public.

---

## 5. Parcours 4 — Soft Delete & Radiographie d'Impact *(MVP 3)*

```mermaid
flowchart LR
    ACT["Clic 'Supprimer' sur un Dossier / Projet / Logo"] --> SCAN["API Radiographie d'Impact (Analyse SQL des dépendances)"]
    SCAN --> MODAL["Affichage Radiographie : N projets impactés, N liens actifs, N blocs CMS, N articles"]
    MODAL -->|"Annuler"| STOP["Aucune modification"]
    MODAL -->|"Mettre à la corbeille"| SOFT["UPDATE deleted_at = NOW() (Réversible)"]
    SOFT -->|"Restaurer depuis Corbeille"| REST["UPDATE deleted_at = NULL"]
    SOFT -->|"Purge définitive"| HARD["DELETE + Suppression objets Neon Object Storage"]
```

