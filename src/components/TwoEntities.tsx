'use client'

import { BRANDS, BRAND_KEYS, type BrandKey } from '@/brand/brands'
import { useBrandSwitch } from '@/brand/useBrandSwitch'
import { Container } from '@/components/ui/Container'
import type { Locale } from '@/i18n/locales'
import type { UIStrings } from '@/i18n/ui'

const ACTION_CLASS =
  'group inline-flex items-center gap-3 rounded-(--radius-md) border border-line-strong px-6 py-3.5 ' +
  'text-[0.75rem] font-medium uppercase tracking-[0.12em] transition-colors duration-200 ' +
  'hover:border-accent hover:text-accent-contrast disabled:opacity-55'

/**
 * Passer à l'autre société : un lien vers son domaine quand il en existe un qui sert le site,
 * un bouton de bascule sur place sinon. Voir `useBrandSwitch`.
 */
function SwitchAction({
  label,
  href,
  onSelect,
  disabled,
}: {
  label: string
  href: string | null
  onSelect: () => void
  disabled: boolean
}) {
  const inner = (
    <>
      <span>{label}</span>
      <span
        aria-hidden="true"
        className="transition-transform duration-200 ease-(--ease-out-quart) group-hover:translate-x-1"
      >
        →
      </span>
    </>
  )

  return href ? (
    <a href={href} className={ACTION_CLASS}>
      {inner}
    </a>
  ) : (
    <button type="button" onClick={onSelect} disabled={disabled} className={ACTION_CLASS}>
      {inner}
    </button>
  )
}

/**
 * Présentation du groupe : les deux sociétés qui partagent ce site.
 *
 * Argentum Investments SA et Argentum Advisors SA sont deux sociétés anonymes genevoises
 * distinctes, inscrites au registre du commerce sous des numéros différents et actives dans des
 * secteurs différents. Le même code est déployé sur leurs deux domaines ; passer à l'autre
 * société, c'est donc aller sur son domaine — la raison sociale, les mentions légales, l'adresse
 * de contact et le thème visuel y sont ceux de cette société.
 */
export function TwoEntities({
  active,
  locale,
  strings,
}: {
  active: BrandKey
  locale: Locale
  strings: UIStrings
}) {
  const { select, isPending, shown, redirects, hrefFor } = useBrandSwitch(active)
  const t = strings.marque

  return (
    <section className="border-y border-line bg-page py-16 sm:py-20 lg:py-(--spacing-section)">
      <Container>
        <div data-reveal className="mb-12 flex flex-col gap-5">
          <span aria-hidden="true" className="h-px w-14 bg-accent" />
          <h2 className="max-w-[34ch] text-[1.75rem] leading-[1.2] sm:text-[2.125rem]">
            {t.titre}
          </h2>
          <p className="max-w-(--container-prose) text-[1.0625rem] leading-[1.75] text-text-muted">
            {t.intro}
          </p>
        </div>

        {/* `data-names-both-entities` : cette section présente le groupe et nomme donc les
            deux sociétés. Le contrôle de bascule la soustrait de son balayage. */}
        <ul data-names-both-entities className="grid gap-px sm:grid-cols-2">
          {BRAND_KEYS.map((key) => {
            const brand = BRANDS[key]
            const isActive = key === shown
            return (
              <li key={key} data-reveal data-reveal-delay={key === 'investments' ? 1 : 2}>
                <article
                  aria-current={isActive ? 'true' : undefined}
                  className={`flex h-full flex-col gap-6 border-t p-7 transition-colors duration-200 sm:p-8 ${
                    isActive ? 'border-accent bg-page-alt' : 'border-line bg-transparent'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-(family-name:--font-display) text-[1.375rem] leading-snug">
                      {brand.legalName}
                    </h3>
                    {isActive ? (
                      <span className="shrink-0 rounded-(--radius-sm) bg-brand px-2.5 py-1 text-[0.625rem] font-medium uppercase tracking-[0.12em] text-on-brand">
                        {t.affichee}
                      </span>
                    ) : null}
                  </div>

                  <dl className="space-y-3 text-[0.875rem]">
                    <div>
                      <dt className="text-[0.6875rem] uppercase tracking-[0.12em] text-text-muted">
                        {t.secteur}
                      </dt>
                      <dd className="mt-1 leading-snug text-text">{brand.sector[locale]}</dd>
                    </div>
                    <div>
                      <dt className="text-[0.6875rem] uppercase tracking-[0.12em] text-text-muted">
                        {t.registre}
                      </dt>
                      <dd className="mt-1 text-text">{brand.registryNumber}</dd>
                    </div>
                    <div>
                      <dt className="text-[0.6875rem] uppercase tracking-[0.12em] text-text-muted">
                        {t.contact}
                      </dt>
                      <dd className="mt-1 text-text">{brand.email}</dd>
                    </div>
                  </dl>

                  <div className="mt-auto pt-2">
                    {isActive ? (
                      <p className="text-[0.8125rem] text-text-muted">
                        {t.vousConsultez}
                      </p>
                    ) : (
                      <SwitchAction
                        label={`${t.afficher} ${brand.legalName}`}
                        href={redirects ? hrefFor(key) : null}
                        onSelect={() => select(key)}
                        disabled={isPending}
                      />
                    )}
                  </div>
                </article>
              </li>
            )
          })}
        </ul>
      </Container>
    </section>
  )
}
