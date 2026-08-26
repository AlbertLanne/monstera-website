import type { Brand } from '@/brand/brands'
import { HEBERGEUR } from '@/brand/hosting'
import { LegalIdentity } from '@/components/LegalIdentity'
import type { Locale } from '@/i18n/locales'
import { UI } from '@/i18n/ui'

const LINK_CLASS =
  'text-accent-contrast underline decoration-line-strong decoration-1 underline-offset-4 ' +
  'transition-colors hover:decoration-accent'

/**
 * Qui édite le site, et où il est hébergé.
 *
 * Les pages légales portaient déjà l'identité de la société au registre du commerce, mais sans
 * jamais dire que cette société est celle qui édite le site — un visiteur pouvait la lire comme
 * une simple présentation. L'intitulé le nomme explicitement.
 *
 * L'entité affichée est l'éditeur : sur argentumadvisors.ch, c'est Argentum Advisors SA qui
 * édite, pas le groupe. Le bloc suit donc la marque active comme le reste du site.
 *
 * Le bloc « Hébergement » n'apparaît que si `HEBERGEUR` est renseigné — voir `brand/hosting.ts`.
 */
export function EditeurDuSite({ brand, locale }: { brand: Brand; locale: Locale }) {
  const t = UI[locale].legal

  return (
    <div data-site-editor className="space-y-8">
      <div>
        <h2 className="font-(family-name:--font-display) text-[1.375rem] text-text-strong">
          {t.editeurDuSite}
        </h2>
        <p className="mt-2 text-[0.9375rem] leading-[1.8] text-text-muted">{t.editeurMention}</p>
      </div>

      <LegalIdentity brand={brand} locale={locale} registryLink />

      {HEBERGEUR ? (
        <div className="border-t border-line pt-6">
          <p className="text-[0.75rem] uppercase tracking-[0.1em] text-text-muted">
            {t.hebergement}
          </p>
          <address className="mt-2 not-italic text-[0.9375rem] leading-[1.8] text-text">
            {HEBERGEUR.url ? (
              <a
                href={HEBERGEUR.url}
                target="_blank"
                rel="noopener noreferrer"
                className={LINK_CLASS}
              >
                {HEBERGEUR.legalName}
              </a>
            ) : (
              HEBERGEUR.legalName
            )}
            {HEBERGEUR.address.map((ligne) => (
              <span key={ligne} className="block text-text-muted">
                {ligne}
              </span>
            ))}
          </address>
        </div>
      ) : null}
    </div>
  )
}
