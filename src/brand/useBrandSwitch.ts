'use client'

import { usePathname } from 'next/navigation'
import { useTransition } from 'react'

import { switchBrand } from './actions'
import { BRANDS, type BrandKey } from './brands'

/**
 * Vrai uniquement dans l'export statique GitHub Pages, où la variable est posée par
 * `.github/workflows/pages.yml`. Cet export n'est pas servi sur un domaine Argentum : les deux
 * entités y sont deux sites voisins sous la même racine, et `actions.statique.ts` remplace
 * l'action serveur pour aller de l'un à l'autre.
 */
const EXPORT_STATIQUE = process.env.NEXT_PUBLIC_EXPORT_STATIQUE === '1'

/**
 * Bascule entre les deux entités, partagé par le sélecteur de l'en-tête et la section
 * « deux sociétés » de l'accueil.
 *
 * **Chaque société a son propre nom de domaine, et basculer, c'est aller chez l'autre.** Le
 * client déploie le site sur deux serveurs et deux domaines : le bouton de l'entité inactive est
 * donc un `<a>` vers `argentuminvestments.ch` ou `argentumadvisors.ch`, sur le même chemin. C'est
 * la seule cible juste — l'adresse affichée dans la barre du navigateur doit correspondre à la
 * raison sociale affichée dans le pied de page.
 *
 * La redirection est inconditionnelle : elle vaut aussi en local et en préproduction, pour que le
 * comportement observé pendant la recette soit celui de la production. Pour travailler l'autre
 * entité en local sans quitter le serveur de développement, figer la marque au démarrage —
 * `NEXT_PUBLIC_MARQUE_STATIQUE=advisors pnpm dev` — plutôt que de cliquer.
 *
 * Seule exception, l'export statique : aucun des deux domaines ne le sert, et y rediriger
 * casserait la préproduction envoyée au client. Le clic y reste une navigation vers l'export
 * voisin, gérée par `actions.statique.ts`.
 *
 * Le chemin vient de `usePathname()` et non de `window.location` : `hrefFor()` est appelé pendant
 * le rendu, y compris côté serveur où `window` n'existe pas.
 */
export function useBrandSwitch(active: BrandKey) {
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  const redirects = !EXPORT_STATIQUE

  /**
   * Adresse de la même page chez l'autre entité. Vide dans l'export statique, où le bouton n'est
   * pas un lien : un `href` vers un domaine qui ne sert pas cette préproduction tromperait le
   * visiteur qui survole, et le clic droit « ouvrir dans un nouvel onglet » y mènerait vraiment.
   */
  function hrefFor(key: BrandKey): string {
    if (!redirects) return ''
    return `https://${BRANDS[key].domain}${pathname}`
  }

  function select(key: BrandKey) {
    if (key === active) return

    if (redirects) {
      window.location.href = hrefFor(key)
      return
    }

    startTransition(() => {
      void switchBrand(key)
    })
  }

  // `shown` reste exposé pour les appelants : l'entité que l'interface doit refléter. Sans
  // bascule sur place, c'est toujours celle qu'a rendue le serveur.
  return { select, isPending, shown: active, redirects, hrefFor }
}
