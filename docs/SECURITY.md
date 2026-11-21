# `SECURITY.md` — Sécurité, OWASP Top 10 & Cryptographie

> **Objectif :** Protéger le portfolio public (notamment les commentaires sans compte) et sanctuariser l'espace d'administration masqué de **Manu KRA**.

---

## 1. Architecture Cryptographique

| Primitive | Algorithme / Lib | Usage Exact |
| :--- | :--- | :--- |
| **Mots de passe** | `bcryptjs` (facteur de coût **12**) | Hachage irréversible avec sel unique du mot de passe administrateur. Vérification en temps constant. |
| **Chiffrement symétrique** | `AES-256-GCM` (`node:crypto`) | Chiffrement au repos des données personnelles sensibles (`phone_encrypted`, `recovery_email_encrypted`, `author_email_encrypted`). IV aléatoire 96 bits unique par enregistrement + Tag d'authentification 128 bits (`iv:authTag:ciphertext`). |
| **Hachage & Intégrité** | `SHA-256` & `HMAC-SHA256` (`node:crypto`) | Hachage des jetons de session avant stockage en base, anonymisation des adresses IP (avec sel secret rotatif), empreinte des fichiers médias, checksum des snapshots Mémoire, signature des `audit_logs`. |

---

## 2. Authentification Masquée (Anti-Découverte & Anti-Bruteforce)

1. **Zéro trace publique :** Aucun lien `/login`, `/admin`, « Connexion » ou icône cadenas n'apparaît dans le DOM public, les fichiers `sitemap.xml` ou `robots.txt`.
2. **Route secrète paramétrable :** L'interface de connexion vit sur une route définie par `ADMIN_SECRET_PATH` (ex. `/acces-kra-studio`), vérifiée dans le `middleware.ts`. Toute requête vers `/admin` ou `/login` générique retourne `404`.
3. **Verrouillage anti-bruteforce :** Après 5 tentatives échouées (par IP ou compte), verrouillage progressif (15 min) + journalisation dans `audit_logs`.
4. **Cookies durcis :**
   - `HttpOnly` (inaccessible au JavaScript côté client → protection contre vol XSS),
   - `Secure` (HTTPS obligatoire en production),
   - `SameSite=Strict` (protection CSRF native),
   - Rotation du jeton de session après changement de mot de passe.

---

## 3. Matrice OWASP Top 10 (2021/2025)

| Risque OWASP | Mesure Implémentée |
| :--- | :--- |
| **A01 — Broken Access Control** | Vérification systématique `requireAdminSession()` dans chaque Route Handler `/api/admin/*` et Server Action (pas uniquement dans le middleware). Protection contre la suppression accidentelle via Radiographie d'Impact. |
| **A02 — Cryptographic Failures** | Clé `ENCRYPTION_MASTER_KEY` (32 octets hex/base64) stockée uniquement dans les secrets Vercel/Neon (jamais commitée). `AES-256-GCM` pour PII au repos, `bcryptjs` cost 12, HTTPS forcé (`HSTS`). |
| **A03 — Injection (SQLi & XSS)** | Requêtes paramétrées exclusives via Drizzle ORM. Zéro `dangerouslySetInnerHTML`. Blocs d'articles rendus en composants React typés (Zod). Sanitisation stricte de chaque commentaire visiteur + validation des protocoles URL (`https://` / `http://` uniquement, blocage `javascript:`). |
| **A04 — Insecure Design** | Règles métier vérifiées côté serveur (plafond 3 projets accueil, modération commentaires avant affichage public, honeypot anti-bot). |
| **A05 — Security Misconfiguration** | En-têtes HTTP stricts : `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY`, `Permissions-Policy`. |
| **A06 — Vulnerable Components** | `pnpm audit` + Dependabot GitHub + mise à jour régulière Next.js stable. |
| **A07 — Identification & Auth Failures** | Route masquée, lockout 5 tentatives, expiration session 7 jours glissants, révocation complète au logout ou changement de mot de passe. |
| **A08 — Software & Data Integrity** | Empreinte `SHA-256` vérifiée sur les uploads vers Neon Object Storage et validation des *magic bytes* réels des images/vidéos/SVG (sanitisation stricte des logos SVG contre `<script>` et `onload=`). |
| **A09 — Logging & Monitoring** | Table `audit_logs` signée HMAC-SHA256 pour toutes les actions sensibles (connexion, échec auth, modification CMS, suppression/restauration, export). Jamais de mots de passe ni jetons dans les logs. |
| **A10 — SSRF** | Aucune récupération d'URL arbitraire côté serveur depuis des saisies utilisateur non vérifiées. |

---

## 4. Politique de Suppression de Compte (Paramètres Dashboard)
- Le bouton **« Supprimer le compte »** exige :
  1. La saisie du **mot de passe actuel** (`bcrypt.compare`),
  2. La saisie manuelle d'une phrase de confirmation,
  3. Un choix explicite entre **Archiver / Désactiver** (`deleted_at = now()`) et **Purge complète**.

