# Monstera

Site vitrine double marque. **Un seul code, deux noms de domaine, deux entités juridiques
réellement distinctes**, avec un thème clair pour l'une et sombre pour l'autre.

Next.js 16 (App Router), React 19, Tailwind v4, pnpm. Français uniquement pour l'instant. Le site
est **entièrement en no-index** : balise meta, en-tête `X-Robots-Tag` et `robots.txt`.

Aucune donnée d'entité n'est écrite dans ce fichier : raison sociale, registre, adresse et
domaines vivent dans `src/brand/brands.ts`, et nulle part ailleurs.

## Démarrer

```bash
pnpm install
cp .env.example .env.local   # renseigner les identifiants SMTP
pnpm dev                     # http://localhost:3000
```

Pour voir la seconde entité sans changer de domaine, utiliser le sélecteur du pied de page : il
pose un cookie prioritaire sur le nom d'hôte.

## Commandes

| Commande | Effet |
|---|---|
| `pnpm dev` | Serveur de développement, port 3000 |
| `pnpm build` | Build de production |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` | ESLint |
| `pnpm test` | Vitest — résolution de marque, invariants de contenu |
| `pnpm check:brand` | Vérifie la bascule d'entité dans un vrai navigateur |
| `pnpm check:shots` | Captures de contrôle des 14 routes |
| `pnpm email:test` | Connexion SMTP, puis envoi réel avec une adresse en argument |
| `pnpm check:delivery` | Acheminement complet du formulaire via une boîte jetable |
| `pnpm content:extract` + `pnpm content:build` | Régénère le contenu depuis les sources `.odt` |

## La règle qui structure le projet

Rien de ce qui identifie une entité ne s'écrit en dur. Tout vient de `src/brand/brands.ts`.

L'entité active est résolue dans cet ordre : **cookie de bascule > nom de domaine > entité par
défaut** (`src/brand/resolve.ts`, `src/proxy.ts`). Dans le contenu, la raison sociale est le jeton
`%BRAND%`, résolu par `resolveBrandText()`.

Un champ à `null` est une donnée manquante : le rendu **omet la ligne** plutôt que de la déduire.
Une adresse supposée sur une mention légale suisse est une mention fausse.

Après toute modification du système de marque : `pnpm check:brand`.

## Le contenu vient du client

Les fiches livrées en `.odt` sont archivées dans `content-source/` et converties en modules
TypeScript. **`src/content/fr/*.ts` est généré : ne pas l'éditer à la main** — corriger le `.odt`
puis relancer le pipeline, ou ajouter une retouche dans `PATCHES` (`scripts/gen_content.py`).

Seule exception : `src/content/fr/mezzanine-capital.ts`, écrit à la main.

## Formulaire de contact

Server Action et nodemailer, vers IONOS (`smtp.ionos.com`, port 465 en SSL/TLS, 587 en STARTTLS ;
le port 25 est bloqué). Sans identifiants, le formulaire invite à écrire directement à l'adresse
de l'entité. Voir `.env.example`.

## Preview sur GitHub Pages

`.github/workflows/pages.yml` publie une preview à chaque poussée sur `main`. Pages ne sert que
des fichiers : le site est donc exporté deux fois, une par entité, et les deux exports sont posés
côte à côte. Le sélecteur devient un lien de l'un vers l'autre.

Trois choses n'existent pas dans cette preview et fonctionnent sur la cible réelle : la résolution
de l'entité par le nom de domaine, l'envoi SMTP du formulaire — il bascule sur un message
pré-rempli chez le visiteur — et l'en-tête `X-Robots-Tag`. La balise meta et le `robots.txt`, eux,
sont bien présents.

Le mode statique se déclenche par `NEXT_PUBLIC_MARQUE_STATIQUE` et les substitutions qu'il exige
sont faites dans le workflow, jamais dans le dépôt.

## Suivi et protection

- **Google Tag Manager** sur toutes les pages (`src/components/GoogleTagManager.tsx`). Un bandeau
  de consentement reste à mettre en place avant toute mise en ligne réelle (nLPD / RGPD).
- **`CopyGuard`** dissuade la copie pendant la validation : clic droit, glisser-déposer, sélection
  de texte, raccourcis d'inspection. Ce n'est **pas** une protection — le HTML est livré au
  navigateur, `curl` et les outils de développement y accèdent toujours. Désactiver avec
  `NEXT_PUBLIC_COPY_GUARD=off` à la mise en ligne.

## Données que le client doit encore fournir

- UID et adresse de la seconde entité
- Identité des partenaires
- Prestataire d'hébergement, pour la politique de confidentialité
- Validation d'une traduction
- Identifiants SMTP

Les arbitrages déjà tranchés — à ne pas rouvrir — sont dans `CLAUDE.md`.
