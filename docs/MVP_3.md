# `MVP_3.md` — Plan d'Exécution Détaillé : Filtres Avancés, Sauvegarde Recherche, Radiographie d'Impact & GEO/Scalar

> **Prérequis :** 100 % des tests de `MVP_2.md` sont à `[x] OK`.
> **Rappel Scope :** Les fonctionnalités **Filtres avancés**, **Sauvegarde de recherche** et **Soft Delete complet + Radiographie d'impact** sont volontairement isolées dans ce **MVP 3**.

---

## Phase 3.1 — Filtres Avancés & Sauvegarde de Recherche

### Module M3.1 — Filtres Avancés Multi-Critères (`/projets` & `/articles`)
- **Tâche M3.1-T1 — Moteur de Requête Filtrée (Back-End) :**
  - `M3.1-T1.1` Étendre `/api/public/projects` avec combinaison multi-critères indexée : `q` (texte), `folder` (multi-dossiers), `status` (`published` / `upcoming`), `yearFrom`/`yearTo`, `mediaType` (`hasVideo` / `multiPhoto`), `tags[]`, `sort` (`recent` / `oldest` / `az` / `popular`).
  - `M3.1-T1.2` Étendre `/api/public/articles` avec filtres par `tags[]`, `readingTimeMax`, `year`, `q`.
- **Tâche M3.1-T2 — Barre de Filtres Minimaliste Responsive (Front-End) :**
  - `M3.1-T2.1` Construire `AdvancedFilterBar` (mobile : tiroir `Sheet` propre ne poussant pas la liste hors de l'écran ; desktop : barre compacte 1 ligne avec badges de filtres actifs réinitialisables et synchronisation URL `searchParams`).

#### Tests de Recette M3.1
| ID | Scénario | Résultat Attendu | Statut |
| :--- | :--- | :--- | :--- |
| `T-M3.1-01` | Combiner Dossier « Économie » + Statut « À venir » + Année `2026` sur `/projets` | Résultats exacts filtrés et URL reflétant tous les critères | `[ ] OK [ ] KO [ ] NA` |
| `T-M3.1-02` | Partager l'URL filtrée à un autre navigateur | La vue s'ouvre exactement avec les mêmes filtres appliqués | `[ ] OK [ ] KO [ ] NA` |

---

### Module M3.2 — Sauvegarde de Recherche
- **Tâche M3.2-T1 — Sauvegarde Admin en BDD & Favoris Visiteur (Back & Front) :**
  - `M3.2-T1.1` API CRUD `/api/admin/saved-searches` (nommer et enregistrer des vues filtrées dans le Dashboard Linear Projets/Articles).
  - `M3.2-T1.2` Côté visiteur sur `/projets` : bouton « Enregistrer cette recherche » sauvegardant la combinaison nommée en `localStorage` (sans créer de compte) + liens directs vers les recherches sauvegardées.

#### Tests de Recette M3.2
| ID | Scénario | Résultat Attendu | Statut |
| :--- | :--- | :--- | :--- |
| `T-M3.2-01` | Sauvegarder une recherche « Projets Économie Vidéo », rafraîchir puis cliquer dessus | Tous les filtres associés sont restaurés en 1 clic | `[ ] OK [ ] KO [ ] NA` |

---

## Phase 3.2 — Soft Delete Complet & Radiographie d'Impact

### Module M3.3 — Analyseur de Dépendances (`ImpactXRayService`)
- **Tâche M3.3-T1 — Moteur de Radiographie d'Impact (Back-End) :**
  - `M3.3-T1.1` Implémenter `ImpactAnalyzerService.analyze(entityType, entityId)` interrogeant en transaction toutes les relations actives :
    - **Dossier :** nombre de projets liés, projets actuellement épinglés sur la Home (`/3`), liens publics concernés.
    - **Projet :** appartient à un dossier, épinglé sur la Home (`is_featured_home`), nombre de médias (photos/vidéos) qui deviendraient inaccessibles, nombre de partages enregistrés, présence éventuelle sur la carte (MVP 4).
    - **Logo / Compétence / Article :** commentaires liés, références CMS.
  - `M3.3-T1.2` Exposer `GET /api/admin/impact-xray` + purge atomique sécurisée (`DELETE ?hard=true`) nettoyant également les objets orphelins dans **Neon Object Storage**.
- **Tâche M3.3-T2 — Modale Radiographie d'Impact dans Dashboard Linear (Front-End) :**
  - `M3.3-T2.1` Remplacer toute suppression directe par `ImpactXRayDialog` affichant le graphe clair des conséquences (icônes Phosphor `Warning`, `Link`, `Folder`, `House`) avant de choisir **Mettre à la corbeille (Soft Delete)** ou **Supprimer définitivement**.

#### Tests de Recette M3.3
| ID | Scénario | Résultat Attendu | Statut |
| :--- | :--- | :--- | :--- |
| `T-M3.3-01` | Demander la suppression d'un dossier contenant 2 projets dont 1 affiché sur l'accueil | La Radiographie d'Impact liste précisément les 2 projets et avertit que la Home perdra 1 projet épinglé | `[ ] OK [ ] KO [ ] NA` |
| `T-M3.3-02` | Confirmer le Soft Delete puis vérifier le site public | Dossier masqué immédiatement sans erreur 500 sur le public ; restaurable depuis la Corbeille | `[ ] OK [ ] KO [ ] NA` |
| `T-M3.3-03` | Purger définitivement un projet depuis la Corbeille | Lignes DB supprimées et objets médias supprimés de Neon Object Storage | `[ ] OK [ ] KO [ ] NA` |

---

## Phase 3.3 — Documentation API Scalar & SEO / GEO Avancé

### Module M3.4 — Scalar OpenAPI & Visibilité Moteurs IA (GEO)
- **Tâche M3.4-T1 — OpenAPI 3.1 & Scalar (`https://scalar.com/`) :**
  - `M3.4-T1.1` Générer `/api/openapi.json` à partir des schémas Zod et monter `@scalar/api-reference-nextjs` sur `/api/docs` (protégé par session admin).
- **Tâche M3.4-T2 — SEO & GEO (`llms.txt` + JSON-LD) :**
  - `M3.4-T2.1` Générer dynamiquement `/sitemap.xml` et `/robots.txt` (excluant la route secrète admin).
  - `M3.4-T2.2` Injecter les données structurées JSON-LD (`Person` Manu KRA, `CreativeWork` sur chaque projet, `Article` sur chaque article).
  - `M3.4-T2.3` Créer la route `/llms.txt` exposant proprement le profil Communication & Économie de Manu KRA, ses dossiers, ses projets et articles pour les moteurs IA.

#### Tests de Recette M3.4 (Validation Finale MVP 3)
| ID | Scénario | Résultat Attendu | Statut |
| :--- | :--- | :--- | :--- |
| `T-M3.4-01` | Ouvrir `/api/docs` connecté vs non connecté | Non connecté : 401/404 ; Connecté : explorateur Scalar complet fonctionnel | `[ ] OK [ ] KO [ ] NA` |
| `T-M3.4-02` | Inspecter `/sitemap.xml`, `/robots.txt` et `/llms.txt` | Aucune trace de l'URL admin masquée ; projets et articles publiés présents | `[ ] OK [ ] KO [ ] NA` |

