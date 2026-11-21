# `GITHUB.md` — Bonnes Pratiques Git, GitHub & CI/CD

> **Référence officielle :** [GitHub Docs](https://docs.github.com/en)
> **Principe :** Historique lisible, zéro secret dans Git, tests et vérification `no-explicit-any` automatisés avant toute fusion sur `main`.

---

## 1. Stratégie de Branches

```text
main        ──▶ Production stable (déployée sur Vercel + branche Neon `main`)
  └── dev   ──▶ Branche d'intégration continue (liée à la branche Neon `dev`)
       ├── feat/mvp1-m01-init
       ├── feat/mvp1-m02-hero-altennis
       ├── feat/mvp1-m03-scroll-projects
       ├── fix/...
       └── docs/...
```

- **`main` est protégée :** Aucun push direct. Fusion uniquement par **Pull Request** depuis `dev` (ou hotfix) après passage de la CI complète.
- **1 Feature / Micro-tâche = 1 Branche courte = Tests validés avant merge.**

---

## 2. Convention de Commits (Conventional Commits)

Format : `<type>(<scope>): <description concise en français ou anglais>`

| Type | Usage | Exemple |
| :--- | :--- | :--- |
| `feat` | Nouvelle fonctionnalité ou module | `feat(hero): implement ALTENNIS staggered hero with CMS data` |
| `fix` | Correction de bug | `fix(scroll): prevent horizontal overflow on 390px viewport` |
| `sec` | Amélioration sécurité / crypto | `sec(auth): add bcrypt cost 12 and IP rate limiting` |
| `perf` | Optimisation 3G / médias | `perf(media): add LQIP blur and lazy video poster` |
| `test` | Ajout / correction de tests | `test(impact): add unit tests for folder impact x-ray` |
| `docs` | Documentation (`projet.md`, `docs/`, `MEMORY/`) | `docs(mvp3): detail micro-tasks for impact xray` |
| `chore` | Config, Drizzle, deps | `chore(db): add initial drizzle schema for projects` |

---

## 3. Sécurité du Dépôt & Gestion des Secrets

1. **`.gitignore` strict :**
   - `.env`, `.env.local`, `.env*.local`, `.neon`, `.taste-skill/`, `coverage/`, `playwright-report/`.
2. **Fichier `.env.example` maintenu à jour** (sans vraies valeurs) :
   - `DATABASE_URL`
   - `DATABASE_URL_UNPOOLED`
   - `ADMIN_SECRET_PATH`
   - `ENCRYPTION_MASTER_KEY`
   - `SESSION_HMAC_SECRET`
   - `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_ENDPOINT_URL_S3`, `AWS_REGION`
3. **Secret Scanning & Dependabot :** Activés sur GitHub pour bloquer tout push accidentel d'une clé Neon ou secret AES.

---

## 4. Pipeline CI GitHub Actions (`.github/workflows/ci.yml`)

Exécuté automatiquement sur chaque Push et Pull Request :
1. `pnpm install --frozen-lockfile`
2. **Check strict TypeScript (`tsc --noEmit`)** — échoue immédiatement s'il y a une erreur de type.
3. **ESLint strict (`pnpm lint`)** — vérifie `@typescript-eslint/no-explicit-any: error` et **interdit tout import de `lucide-react`**.
4. **Tests Unitaires & Intégration (`pnpm test`)** — Vitest (crypto, Zod, services, Radiographie d'impact).
5. **Build Production (`pnpm build`)** — valide le bundling Next.js et les Server Components.
6. **Tests E2E (`pnpm test:e2e`)** — Playwright sur les parcours critiques (en environnement staging/preview).

