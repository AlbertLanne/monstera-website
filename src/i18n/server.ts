import 'server-only'

import { locale as segmentDeLangue } from 'next/root-params'

import { DEFAULT_LOCALE, isLocale, type Locale } from './locales'

/**
 * La langue de la page en cours, pour tout composant serveur.
 *
 * `next/root-params` expose les segments dynamiques placés **avant** la mise en page racine —
 * ici `src/app/[locale]`. N'importe quel composant serveur peut donc lire la langue sans qu'elle
 * lui soit passée en props, exactement comme `getBrand()` lit l'entité. Les composants clients
 * n'y ont pas accès : eux la reçoivent en props.
 *
 * Le repli sur le français couvre le cas d'un segment absent ou inconnu ; en pratique le
 * `generateStaticParams` de la mise en page racine borne les valeurs possibles aux trois langues.
 */
export async function getLocale(): Promise<Locale> {
  const valeur = await segmentDeLangue()
  return isLocale(valeur) ? valeur : DEFAULT_LOCALE
}
