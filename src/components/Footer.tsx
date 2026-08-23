import Link from 'next/link'

import type { Brand } from '@/brand/brands'
import { Logo } from '@/components/Logo'
import { Container } from '@/components/ui/Container'
import { financeLinks, legalNav, mainNav } from '@/config/navigation'
import { pathnameForLocale, type Locale } from '@/i18n/locales'
import { UI } from '@/i18n/ui'

const CURRENT_YEAR = 2026

/** Entrées du menu principal qui relèvent de la société plutôt que de l'offre. */
const COMPANY_PATHS = ['/a-propos', '/discretion', '/notre-equipe', '/contact']

function Column({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h2 className="mb-4 font-(family-name:--font-sans) text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-text-muted">
        {title}
      </h2>
      <ul className="space-y-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-[0.875rem] leading-snug text-text transition-colors duration-150 hover:text-accent-contrast"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * Pied de page.
 *
 * L'identité légale affichée suit l'entité active. Les lignes dont la donnée manque sont
 * omises : Argentum Advisors SA n'a pas encore communiqué son adresse ni son UID, et aucune
 * des deux entités n'a de numéro de téléphone.
 */
export function Footer({ brand, locale }: { brand: Brand; locale: Locale }) {
  const t = UI[locale]
  const nav = mainNav(locale)
  const chemin = (p: string) => pathnameForLocale(p, locale)
  const services = nav.find((link) => link.href === chemin('/services'))
  const societe = COMPANY_PATHS.map((p) => chemin(p))
  const company = nav.filter((link) => societe.includes(link.href))

  return (
    <footer className="border-t border-line bg-page-alt">
      <Container className="py-16 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.15fr_2fr]">
          <div>
            {/* Le pied de page est sur `--page-bg-alt` : clair chez Investments, navy chez
                Advisors. La signature suit, sinon elle disparaît dans l'un des deux. */}
            <Logo brand={brand.key} fond={brand.theme === 'dark' ? 'sombre' : 'clair'} />
            <p className="mt-6 max-w-[32ch] text-[0.9375rem] leading-[1.7] text-text-muted">
              {brand.tagline[locale]}
            </p>

            <address className="mt-8 space-y-1 text-[0.875rem] leading-[1.8] text-text-muted not-italic">
              <span className="block font-medium text-text-strong">{brand.legalName}</span>
              {brand.address ? (
                <>
                  <span className="block">{brand.address.street}</span>
                  <span className="block">
                    {brand.address.postalCode} {brand.address.city}, {t.legal.pays}
                  </span>
                </>
              ) : null}
              <a
                href={`mailto:${brand.email}`}
                className="mt-2 inline-block text-accent-contrast underline decoration-line-strong decoration-1 underline-offset-4 transition-colors hover:decoration-accent"
              >
                {brand.email}
              </a>
            </address>
          </div>

          <div className="grid gap-10 sm:grid-cols-3">
            <Column
              title={nav.find((l) => l.content === 'services')?.label ?? ''}
              links={[
                { label: t.nav.vueDEnsemble, href: chemin('/services') },
                ...(services?.children ?? []),
              ]}
            />
            <Column
              title={nav.find((l) => l.content === 'finance')?.label ?? ''}
              links={[
                { label: t.nav.vueDEnsemble, href: chemin('/finance') },
                ...financeLinks(locale).slice(0, 6),
              ]}
            />
            <Column title={t.nav.societe} links={company} />
          </div>
        </div>

        <div className="mt-14 space-y-6 border-t border-line pt-8">
          <p className="max-w-[92ch] text-[0.8125rem] leading-[1.7] text-text-muted">
            {brand.legalName} {t.legal.avertissement}
          </p>

          <dl className="flex flex-wrap gap-x-8 gap-y-2 text-[0.8125rem] text-text-muted">
            <div className="flex gap-2">
              <dt>{t.legal.registreCourt}&nbsp;:</dt>
              <dd className="text-text">{brand.registryNumber}</dd>
            </div>
            {brand.uid ? (
              <div className="flex gap-2">
                <dt>UID&nbsp;:</dt>
                <dd className="text-text">{brand.uid}</dd>
              </div>
            ) : null}
          </dl>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[0.8125rem] text-text-muted">
              © {CURRENT_YEAR} {brand.legalName}. {t.legal.droitsReserves}
            </p>
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {legalNav(locale).map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[0.8125rem] text-text-muted transition-colors duration-150 hover:text-accent-contrast"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </footer>
  )
}
