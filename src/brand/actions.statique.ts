'use client'

import { BRAND_KEYS, isBrandKey, type BrandKey } from './brands'

/**
 * Remplace `actions.ts` dans l'export statique — la substitution est faite par
 * `.github/workflows/pages.yml`, ce fichier n'est jamais utilisé en rendu serveur.
 *
 * Sans serveur, il n'y a pas de cookie à poser ni de rendu à rejouer : chaque entité est un site
 * voisin sous la même racine, et basculer revient à aller chez le voisin. La page courante est
 * conservée quand elle existe des deux côtés, ce qui est le cas de toutes : les deux exports
 * partent du même contenu.
 */
export async function switchBrand(key: BrandKey) {
  if (!isBrandKey(key)) return

  const racine = process.env.NEXT_PUBLIC_RACINE_STATIQUE ?? ''
  const actuelle = process.env.NEXT_PUBLIC_MARQUE_STATIQUE

  // Chemin courant sans la racine ni le segment d'entité : `/monstera-website/advisors/contact/`
  // devient `contact/`, qu'on rattache au site visé.
  const prefixes = BRAND_KEYS.map((k) => `${racine}/${k}`)
  const prefixe = prefixes.find((p) => window.location.pathname.startsWith(p))
  const reste = prefixe ? window.location.pathname.slice(prefixe.length) : '/'

  if (key === actuelle) return

  // Le routeur de Next ne peut pas franchir un `basePath` différent du sien, et c'est
  // précisément ce qu'on fait : l'autre entité est un export voisin, pas une route de celui-ci.
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination
  window.location.href = `${racine}/${key}${reste || '/'}`
}
