/**
 * Les trois langues du site.
 *
 * Le contenu n'est traduit dans aucune autre que le français pour l'instant. Ce module existe
 * pour que la traduction, quand elle arrivera, n'ait rien à décider : le schéma d'URL, les
 * libellés du sélecteur et la liste des langues réellement servies sont déjà fixés ici.
 *
 * **Schéma d'URL retenu : français à la racine, préfixe de langue pour les autres.**
 *
 *     /contact        français
 *     /en/contact     anglais
 *     /de/contact     allemand
 *
 * Le français reste à la racine parce que c'est la langue livrée : aucune des URL déjà validées
 * par le client ne bouge, et il n'y a aucune redirection à écrire le jour de la mise en ligne.
 *
 * Les segments de chemin (`contact`, `a-propos`, `finance/capital-risque`) restent identiques
 * dans les trois langues. Traduire les slugs imposerait une table de correspondance par page et
 * une redirection par slug abandonné, pour un gain nul tant que le site est en no-index.
 */

export const LOCALES = ['fr', 'en', 'de'] as const

export type Locale = (typeof LOCALES)[number]

/** Langue servie à la racine, et repli partout où une traduction manque. */
export const DEFAULT_LOCALE: Locale = 'fr'

/**
 * Langues dont le contenu existe réellement.
 *
 * Le sélecteur affiche les trois langues mais ne rend actives que celles listées ici. Les trois
 * y sont depuis le 23 août 2026 : le client a livré ses vingt fiches en anglais et en allemand,
 * et les libellés d'interface ont été traduits. Retirer une langue d'ici la grise sans rien
 * casser — c'est l'interrupteur, à utiliser si une traduction doit être retirée en urgence.
 */
export const LOCALES_DISPONIBLES: readonly Locale[] = ['fr', 'en', 'de']

export type LocaleInfo = {
  /** Libellé court du sélecteur. */
  code: string
  /** Nom de la langue dans cette langue, pour l'infobulle et l'accessibilité. */
  name: string
  /** Valeur de l'attribut `lang` du document. */
  htmlLang: string
  /** Valeur `og:locale`, marché suisse. */
  ogLocale: string
}

export const LOCALE_INFO: Record<Locale, LocaleInfo> = {
  fr: { code: 'FR', name: 'Français', htmlLang: 'fr', ogLocale: 'fr_CH' },
  en: { code: 'EN', name: 'English', htmlLang: 'en', ogLocale: 'en_CH' },
  de: { code: 'DE', name: 'Deutsch', htmlLang: 'de', ogLocale: 'de_CH' },
}

/**
 * Dans l'export statique GitHub Pages, les trois langues portent leur préfixe.
 *
 * Le français est servi à la racine grâce à une réécriture de `src/proxy.ts`, que l'export
 * supprime — il n'y a pas de serveur pour la faire. Le français y vit donc réellement sous `/fr`,
 * et le sélecteur de langue doit viser `/fr/contact/` et non `/contact/`, qui n'existe pas.
 */
const PREFIXE_TOUJOURS = process.env.NEXT_PUBLIC_EXPORT_STATIQUE === '1'

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value)
}

export function localeDisponible(locale: Locale): boolean {
  return LOCALES_DISPONIBLES.includes(locale)
}

/** La langue d'un chemin : son premier segment s'il nomme une langue, le français sinon. */
export function localeFromPathname(pathname: string): Locale {
  const premier = pathname.split('/')[1]
  return isLocale(premier) ? premier : DEFAULT_LOCALE
}

/**
 * Le chemin sans son préfixe de langue : `/en/contact` devient `/contact`.
 *
 * `/fr/contact` est dépouillé comme les autres. Le préfixe français n'est pas une adresse du site
 * servi — `src/proxy.ts` l'y redirige vers `/contact` — mais il existe dans l'export statique, et
 * empiler `/en` par-dessus produirait `/en/fr/contact`.
 */
export function pathnameSansLocale(pathname: string): string {
  const premier = pathname.split('/')[1]
  if (!isLocale(premier)) return pathname
  const reste = pathname.slice(`/${premier}`.length)
  return reste || '/'
}

/** Le même chemin dans une autre langue. C'est la cible des boutons du sélecteur. */
export function pathnameForLocale(pathname: string, locale: Locale): string {
  const nu = pathnameSansLocale(pathname)
  if (locale === DEFAULT_LOCALE && !PREFIXE_TOUJOURS) return nu
  return nu === '/' ? `/${locale}` : `/${locale}${nu}`
}
