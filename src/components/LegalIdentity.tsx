import type { Brand } from '@/brand/brands'
import type { Locale } from '@/i18n/locales'
import { UI } from '@/i18n/ui'

type Row = {
  label: string
  value: string
  /** Fiche publique correspondante, quand la donnée est vérifiable en ligne. */
  href?: string
}

const LINK_CLASS =
  'text-accent-contrast underline decoration-line-strong decoration-1 underline-offset-4 ' +
  'transition-colors hover:decoration-accent'

/**
 * La fiche de l'entité affichée au registre du commerce.
 *
 * Le visiteur d'un site financier doit pouvoir vérifier à qui il écrit sans quitter la page pour
 * aller chercher. Seule la société affichée est nommée : sur le domaine d'Advisors, renvoyer
 * aussi vers Investments mélangerait deux personnes morales que tout le reste du site sépare.
 */
function RegistryLink({ brand, locale }: { brand: Brand; locale: Locale }) {
  const t = UI[locale].legal
  return (
    <div data-registry-link className="mt-4">
      <p className="text-[0.6875rem] uppercase tracking-[0.1em] text-text-muted">
        {t.verifierRegistre}
      </p>
      <a
        href={brand.registryUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`mt-1.5 inline-block text-[0.8125rem] leading-snug ${LINK_CLASS}`}
      >
        {brand.legalName} {t.surMoneyhouse}
      </a>
    </div>
  )
}

/**
 * Identité légale de l'entité active.
 *
 * Les lignes dont la donnée est absente sont omises, jamais remplies par supposition :
 * Argentum Advisors SA n'a pas encore communiqué son adresse ni son UID, et aucune des deux
 * entités n'a de numéro de téléphone.
 */
export function LegalIdentity({
  brand,
  locale,
  /** Ajoute sous le numéro de registre le lien vers la fiche Moneyhouse de la société affichée. */
  registryLink = false,
}: {
  brand: Brand
  locale: Locale
  registryLink?: boolean
}) {
  const t = UI[locale].legal
  const rows: Row[] = []

  if (brand.uid) rows.push({ label: t.uid, value: brand.uid })
  rows.push({ label: t.registre, value: brand.registryNumber })
  rows.push({ label: t.formeJuridique, value: t.societeAnonyme })
  rows.push({ label: t.secteur, value: brand.sector[locale] })
  if (brand.representative) rows.push({ label: t.representant, value: brand.representative })

  return (
    // Le bloc sert à la fois dans la colonne étroite de la page Contact et sur toute la largeur
    // de l'Impressum : la mise en deux colonnes dépend de la place réelle, pas de la fenêtre.
    <div data-legal-identity className="@container space-y-8">
      <address className="not-italic">
        <p className="font-(family-name:--font-display) text-[1.25rem] text-text-strong">
          {brand.legalName}
        </p>
        {brand.address ? (
          <p className="mt-2 text-[0.9375rem] leading-[1.8] text-text-muted">
            {brand.address.street}
            <br />
            {brand.address.postalCode} {brand.address.city}
            <br />
            {t.pays}
          </p>
        ) : null}
        <p className="mt-3 text-[0.9375rem]">
          <a href={`mailto:${brand.email}`} className={LINK_CLASS}>
            {brand.email}
          </a>
        </p>
      </address>

      <dl className="grid gap-x-10 gap-y-4 border-t border-line pt-6 @xl:grid-cols-[minmax(0,20rem)_1fr]">
        {rows.map((row) => {
          const isRegistry = row.value === brand.registryNumber
          return (
            <div key={row.label} className="@xl:contents">
              <dt className="text-[0.75rem] uppercase tracking-[0.1em] text-text-muted">
                {row.label}
              </dt>
              <dd className="mt-1 text-[0.9375rem] text-text @xl:mt-0">
                {row.href ? (
                  <a
                    href={row.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={LINK_CLASS}
                  >
                    {row.value}
                  </a>
                ) : (
                  row.value
                )}
                {registryLink && isRegistry ? <RegistryLink brand={brand} locale={locale} /> : null}
              </dd>
            </div>
          )
        })}
      </dl>
    </div>
  )
}
