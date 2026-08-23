import Link from 'next/link'
import type { Metadata } from 'next'

import { getBrand } from '@/brand/resolve'
import { Container } from '@/components/ui/Container'
import { mainNav } from '@/config/navigation'
import { LOCALE_INFO } from '@/i18n/locales'
import { getLocale } from '@/i18n/server'
import { UI } from '@/i18n/ui'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

/**
 * Page introuvable, dans la langue du visiteur.
 *
 * Elle existait déjà, mais c'était celle de Next : « This page could not be found », en anglais,
 * sur les trois langues.
 *
 * **Elle se suffit à elle-même.** Pour une adresse qui ne correspond à aucune route, Next rend la
 * réponse serveur dans une enveloppe à lui (`<html id="__next_error__">`) et non dans la mise en
 * page racine — d'autant plus ici, où cette mise en page vit sous `[locale]`. L'en-tête n'arrive
 * qu'au rendu client. La page ne suppose donc rien de son décor : elle porte son message et les
 * trois renvois qui rendent la main, et pose `lang` sur son conteneur pour qu'un lecteur d'écran
 * prononce correctement le texte même quand `<html lang>` n'est pas le nôtre.
 */
export default async function NotFound() {
  const brand = await getBrand()
  const locale = await getLocale()
  const t = UI[locale].erreur404
  const nav = mainNav(locale)
  const retours = nav.filter((l) => ['accueil', 'services', 'finance'].includes(l.content ?? ''))

  return (
    <div
      lang={LOCALE_INFO[locale].htmlLang}
      data-brand={brand.key}
      className="flex min-h-dvh flex-col justify-center bg-page py-20"
    >
      <Container>
        <p className="text-[0.6875rem] uppercase tracking-[0.16em] text-text-muted">
          {t.eyebrow}
        </p>
        <h1 className="mt-5 max-w-[20ch] text-[2.125rem] leading-[1.1] text-text-strong sm:text-[3rem]">
          {t.titre}
        </h1>
        <p className="mt-6 max-w-(--container-prose) text-[1.0625rem] leading-[1.75] text-text-muted">
          {t.texte}
        </p>

        <ul className="mt-12 flex flex-wrap gap-x-10 gap-y-4 border-t border-line pt-8">
          {retours.map((lien) => (
            <li key={lien.href}>
              <Link
                href={lien.href}
                className="text-[0.9375rem] text-accent-contrast underline decoration-line-strong decoration-1 underline-offset-4 transition-colors hover:decoration-accent"
              >
                {lien.label}
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </div>
  )
}
