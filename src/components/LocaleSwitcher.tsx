'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import {
  LOCALES,
  LOCALE_INFO,
  localeDisponible,
  localeFromPathname,
  pathnameForLocale,
  type Locale,
} from '@/i18n/locales'
import type { UIStrings } from '@/i18n/ui'

/**
 * Sélecteur de langue — français, anglais, allemand.
 *
 * Les trois langues sont affichées dès maintenant, mais seules celles listées dans
 * `LOCALES_DISPONIBLES` sont cliquables. Le contenu n'existe qu'en français : rendre `/en/`
 * accessible aujourd'hui mènerait à une page anglaise entièrement rédigée en français, ce qui est
 * pire qu'un bouton visiblement à venir. Le jour de la traduction, ajouter la langue à
 * `LOCALES_DISPONIBLES` suffit — rien ici ne change.
 *
 * La langue indisponible reste **visible** plutôt que masquée : elle annonce au visiteur, et au
 * client pendant la recette, que les trois langues sont prévues.
 *
 * Chaque langue disponible est un vrai lien vers le même chemin traduit, jamais un bouton : la
 * langue est une adresse, elle doit s'ouvrir dans un nouvel onglet et se partager.
 */

const SHARED =
  'rounded-[calc(var(--radius-md)-1px)] px-2 py-1.5 text-center text-[0.6875rem] font-medium ' +
  'uppercase tracking-[0.08em] transition-colors duration-200'

export function LocaleSwitcher({
  strings,
  className = '',
  onDark = false,
}: {
  strings: UIStrings
  className?: string
  /** Au-dessus d'un fond sombre, les jetons de thème ne sont pas lisibles. */
  onDark?: boolean
}) {
  const pathname = usePathname()
  const active = localeFromPathname(pathname)

  function tone(locale: Locale, isActive: boolean, disponible: boolean) {
    if (!disponible) return onDark ? 'text-white/35' : 'text-text-muted/45'
    if (isActive) return onDark ? 'bg-accent text-navy-950' : 'bg-brand text-on-brand'
    return onDark ? 'text-white/70 hover:text-white' : 'text-text-muted hover:text-accent-contrast'
  }

  return (
    <div
      role="group"
      aria-label={strings.langue.selecteurAria}
      className={`inline-flex items-stretch rounded-(--radius-md) border p-0.5 ${
        onDark ? 'border-white/30' : 'border-line'
      } ${className}`}
    >
      {LOCALES.map((locale) => {
        const info = LOCALE_INFO[locale]
        const disponible = localeDisponible(locale)
        const isActive = locale === active
        const classes = `${SHARED} ${tone(locale, isActive, disponible)}`

        if (!disponible) {
          return (
            <span
              key={locale}
              aria-disabled="true"
              title={`${info.name} — ${strings.langue.bientot}`}
              className={`${classes} cursor-not-allowed`}
            >
              {info.code}
            </span>
          )
        }

        if (isActive) {
          return (
            <span key={locale} aria-current="true" title={info.name} className={classes}>
              {info.code}
            </span>
          )
        }

        return (
          <Link
            key={locale}
            href={pathnameForLocale(pathname, locale)}
            hrefLang={info.htmlLang}
            title={info.name}
            className={classes}
          >
            {info.code}
          </Link>
        )
      })}
    </div>
  )
}
