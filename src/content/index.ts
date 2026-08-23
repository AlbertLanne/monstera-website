/**
 * Registre du contenu client, dans les trois langues.
 *
 * Les vingt fiches sont générées par `pnpm content:build` dans `fr/`, `en/` et `de/`. Les trois
 * répertoires portent exactement les mêmes slugs : `satisfies` ci-dessous le vérifie à la
 * compilation, une fiche manquante dans une langue ne passe pas.
 *
 * Les slugs restent français dans les trois langues — c'est l'arbitrage d'URL du projet, décrit
 * dans `src/i18n/locales.ts`. Seuls le libellé de menu et le texte sont traduits.
 */

import type { Locale } from '@/i18n/locales'

import { pages as de } from './de'
import { pages as en } from './en'
import { pages as fr } from './fr'
import type { PageContent } from './types'

export type PageSlug = keyof typeof fr

export const CONTENT = { fr, en, de } satisfies Record<Locale, Record<PageSlug, PageContent>>

export function getPage(locale: Locale, slug: PageSlug): PageContent {
  return CONTENT[locale][slug]
}

/** Les pages d'une langue, dans l'ordre de génération. */
export function getPages(locale: Locale): Record<PageSlug, PageContent> {
  return CONTENT[locale]
}
