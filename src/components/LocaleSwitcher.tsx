'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { Deroulant } from '@/components/ui/Deroulant'
import {
  LOCALES,
  LOCALE_INFO,
  localeDisponible,
  localeFromPathname,
  pathnameForLocale,
} from '@/i18n/locales'
import type { UIStrings } from '@/i18n/ui'

/**
 * La langue du site — français, anglais, allemand.
 *
 * Chaque langue est un lien vers le même chemin traduit, jamais un bouton : une langue est une
 * adresse, elle doit s'ouvrir dans un nouvel onglet et se partager. Le déclencheur porte le code
 * de la langue lue ; le panneau nomme chaque langue **dans cette langue**, parce que c'est ainsi
 * qu'un lecteur reconnaît la sienne sans la traduire mentalement.
 *
 * `LOCALES_DISPONIBLES` reste l'interrupteur : une langue qui n'y figure pas s'affiche grisée,
 * visible mais inerte. Elle annonce qu'elle est prévue sans mener à une page à moitié traduite.
 */
export function LocaleSwitcher({ strings }: { strings: UIStrings }) {
  const pathname = usePathname()
  const active = localeFromPathname(pathname)

  return (
    <Deroulant
      aria={strings.langue.selecteurAria}
      cote="droite"
      largeur="w-[11rem]"
      valeur={
        <span className="uppercase tracking-[0.1em] text-white/90">{LOCALE_INFO[active].code}</span>
      }
    >
      {(fermer) => (
        <ul>
          {LOCALES.map((locale) => {
            const info = LOCALE_INFO[locale]
            const actif = locale === active
            const disponible = localeDisponible(locale)

            const classe = `block border-l-2 px-4 py-2.5 text-[0.8125rem] leading-snug transition-colors duration-150 ${
              actif
                ? 'border-accent bg-white/6 text-accent'
                : disponible
                  ? 'border-transparent text-white/75 hover:border-accent hover:bg-white/6 hover:text-white'
                  : 'border-transparent text-white/30'
            }`

            if (actif) {
              return (
                <li key={locale}>
                  <span aria-current="true" className={classe}>
                    {info.name}
                  </span>
                </li>
              )
            }

            if (!disponible) {
              return (
                <li key={locale}>
                  <span
                    aria-disabled="true"
                    title={`${info.name} — ${strings.langue.bientot}`}
                    className={`${classe} cursor-not-allowed`}
                  >
                    {info.name}
                  </span>
                </li>
              )
            }

            return (
              <li key={locale}>
                <Link
                  href={pathnameForLocale(pathname, locale)}
                  hrefLang={info.htmlLang}
                  onClick={fermer}
                  className={classe}
                >
                  {info.name}
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </Deroulant>
  )
}
