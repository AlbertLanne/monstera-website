import { cookies, headers } from 'next/headers'

import {
  BRAND_COOKIE,
  BRANDS,
  DEFAULT_BRAND,
  brandFromHost,
  isBrandKey,
  strictBrandFromHost,
  type Brand,
  type BrandKey,
} from './brands'

/** En-tête posé par `src/proxy.ts` : l'entité déduite du nom d'hôte de la requête. */
export const BRAND_HEADER = 'x-argentum-brand'

/**
 * Entité figée au moment de la construction, pour l'export statique.
 *
 * Un export ne connaît ni requête ni cookie : un site est généré par entité, et la bascule
 * devient un lien de l'un vers l'autre. Vide en rendu serveur, où la résolution ci-dessous
 * reprend la main.
 */
const MARQUE_FIGEE = process.env.NEXT_PUBLIC_MARQUE_STATIQUE

/**
 * Détermine l'entité active côté serveur.
 *
 * Priorité : domaine Argentum réel > bascule manuelle du visiteur (cookie) > nom d'hôte
 * approchant > Investments.
 *
 * Le domaine réel passe devant le cookie depuis que la bascule y est devenue une redirection :
 * une fois sur argentum-advisors.ch, le visiteur doit voir Advisors, même s'il avait cliqué
 * Investments plus tôt sur l'autre domaine. Hors de ces deux domaines — localhost, préproduction —
 * aucun hôte ne fait autorité et le cookie reprend son rôle, ce qui garde la bascule au clic
 * pour la démonstration.
 */
export async function getBrandKey(): Promise<BrandKey> {
  if (isBrandKey(MARQUE_FIGEE)) return MARQUE_FIGEE

  const headerStore = await headers()
  const host = headerStore.get('host')

  const authoritative = strictBrandFromHost(host)
  if (authoritative) return authoritative

  const cookieStore = await cookies()
  const chosen = cookieStore.get(BRAND_COOKIE)?.value
  if (isBrandKey(chosen)) return chosen

  const fromProxy = headerStore.get(BRAND_HEADER)
  if (isBrandKey(fromProxy)) return fromProxy

  return brandFromHost(host) ?? DEFAULT_BRAND
}

export async function getBrand(): Promise<Brand> {
  return BRANDS[await getBrandKey()]
}
