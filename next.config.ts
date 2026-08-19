import type { NextConfig } from 'next'

/**
 * Deux modes de construction.
 *
 * Par défaut, le site est rendu par un serveur : l'entité vient du nom de domaine, le formulaire
 * est une action serveur, `src/proxy.ts` pose l'en-tête de non-indexation. C'est la cible réelle.
 *
 * Quand `NEXT_PUBLIC_MARQUE_STATIQUE` est défini, le site est exporté en fichiers pour une
 * preview sur GitHub Pages, qui ne sait servir que du statique. Une entité par export, donc deux
 * sites voisins sous une même racine, et le sélecteur devient un lien de l'un vers l'autre.
 * Les substitutions que ce mode exige sont faites dans le workflow, pas ici : voir
 * `.github/workflows/pages.yml`.
 */
const MARQUE = process.env.NEXT_PUBLIC_MARQUE_STATIQUE
const RACINE = process.env.NEXT_PUBLIC_RACINE_STATIQUE ?? ''

const nextConfig: NextConfig = MARQUE
  ? {
      output: 'export',
      basePath: `${RACINE}/${MARQUE}`,
      // Sans cela, Pages répond 404 sur /services : il cherche un dossier, pas un fichier .html.
      trailingSlash: true,
      // L'optimiseur d'images est un service serveur, absent d'un hébergement de fichiers.
      images: { unoptimized: true },
    }
  : {}

export default nextConfig
