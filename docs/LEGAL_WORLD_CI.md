# `LEGAL_WORLD_CI.md` — Conformité Juridique (Côte d'Ivoire & International)

> **Cadre applicable :** Portfolio professionnel et éditorial de **Manu KRA** (Communication & Économie), accessible en Côte d'Ivoire et à l'international.
> *(Information documentaire technique — à valider avec un conseil juridique avant exploitation commerciale formelle).*

---

## 1. Cadre Juridique Côte d'Ivoire & International

| Juridiction | Texte de Référence | Impact Concret sur la Plateforme |
| :--- | :--- | :--- |
| **Côte d'Ivoire** | **Loi n° 2013-450** du 19 juin 2013 relative à la protection des données à caractère personnel (**ARTCI**) | Encadre la collecte de l'email optionnel dans les commentaires d'articles, la journalisation IP et la sécurité des données personnelles du propriétaire. |
| **Côte d'Ivoire** | **Loi n° 2013-546** du 30 juillet 2013 relative aux transactions électroniques | Impose des **Mentions Légales** claires identifiant l'éditeur du site et son hébergeur, même sur un portfolio personnel. |
| **International / UE** | **RGPD** (Règlement UE 2016/679) | Minimisation des données, transparence sur la finalité, droit à l'effacement, absence de traceurs publicitaires sans consentement. |

---

## 2. Traduction Technique Obligatoire dans l'Application

1. **Zéro Cookie Publicitaire ou Traceur Invasif :**
   - Aucun Google Analytics / Meta Pixel par défaut → dispense de bandeau cookie intrusif tout en garantissant la conformité ARTCI/RGPD.
   - Les statistiques internes (`analytics_events`) utilisent uniquement un hash éphémère anonymisé (`SHA-256` avec sel rotatif) : aucune donnée nominative n'est traçable.
2. **Commentaires d'Articles Sans Compte :**
   - Seul le **Nom / Pseudo** et le **Texte** sont obligatoires. L'e-mail reste optionnel, **chiffré en `AES-256-GCM`** en base et **jamais affiché publiquement**.
   - Mention courte sous le formulaire : *« Votre commentaire est soumis à modération. L'adresse e-mail, si fournie, reste strictement confidentielle. »*
   - L'IP utilisée pour l'anti-spam est immédiatement transformée en empreinte `SHA-256` salée (non réversible).
3. **Mentions Légales & Politique de Confidentialité (`/mentions-legales`) :**
   - Page statique légère (éditable via CMS `cms_sections`) accessible depuis le footer : Identité de l'éditeur (*Manu KRA*), domaine d'activité, hébergeur (Vercel / Neon), propriété intellectuelle des projets & articles, et contact pour demande de retrait/rectification d'un commentaire.
4. **Droit à l'Effacement & Suppression de Compte :**
   - Dans le Dashboard Paramètres, Manu KRA dispose du bouton **« Supprimer le compte »** avec purge complète des données personnelles chiffrées et des sessions.
   - Depuis le Dashboard Articles, un commentaire peut être purgé définitivement à la demande de son auteur.

