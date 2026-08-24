'use client'

import { BRANDS, BRAND_KEYS, type BrandKey } from '@/brand/brands'
import type { useBrandSwitch } from '@/brand/useBrandSwitch'
import { Deroulant } from '@/components/ui/Deroulant'
import type { Locale } from '@/i18n/locales'
import type { UIStrings } from '@/i18n/ui'

/**
 * L'entité du groupe : ce qu'on consulte, et comment aller chez l'autre société.
 *
 * **Ce n'est plus une bascule.** Deux pastilles côte à côte, dont une allumée, disent « onglet » —
 * et c'était devenu faux le jour où le clic a cessé de changer l'affichage pour partir sur un
 * autre nom de domaine. Le déclencheur énonce donc la société qu'on lit, et le panneau montre
 * **l'adresse où mène chaque ligne**. Un visiteur qui s'apprête à quitter argentuminvestments.ch
 * pour argentumadvisors.ch doit le voir avant de cliquer, pas le découvrir dans sa barre
 * d'adresse.
 *
 * Le secteur d'activité sous chaque raison sociale n'est pas décoratif : c'est ce qui distingue
 * réellement les deux sociétés au registre du commerce, et donc ce qui aide à choisir.
 *
 * Les deux lignes portent la **raison sociale complète** : « Investments » seul ne désigne aucune
 * société. Hors des vrais domaines — export statique — la ligne inactive reste un bouton, faute
 * d'adresse qui serve le site.
 */

export type Commandes = ReturnType<typeof useBrandSwitch>

export function BrandSwitcher({
  commandes,
  locale,
  strings,
}: {
  commandes: Commandes
  locale: Locale
  strings: UIStrings
}) {
  const { select, isPending, shown, redirects, hrefFor } = commandes
  const t = strings.marque

  return (
    <div data-brand-switcher data-pending={isPending ? '' : undefined}>
      <Deroulant
        aria={t.selecteurAria}
        cote="gauche"
        valeur={<span className="text-white/90">{BRANDS[shown].legalName}</span>}
      >
        {(fermer) => (
          <ul>
            {BRAND_KEYS.map((key) => {
              const brand = BRANDS[key]
              const actif = key === shown
              const contenu = <Ligne brand={brand} actif={actif} locale={locale} />

              return (
                <li key={key}>
                  {redirects && !actif ? (
                    <a href={hrefFor(key)} className={CLASSE(actif)} onClick={fermer}>
                      {contenu}
                    </a>
                  ) : (
                    <button
                      type="button"
                      aria-current={actif ? 'true' : undefined}
                      onClick={() => {
                        select(key)
                        fermer()
                      }}
                      className={`w-full text-left ${CLASSE(actif)}`}
                    >
                      {contenu}
                    </button>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </Deroulant>
    </div>
  )
}

/**
 * Le filet vertical au ciel marque la société affichée.
 *
 * C'est l'idiome déjà employé par le sous-menu Finance pour la page courante : le reprendre ici
 * évite d'inventer un second vocabulaire de sélection dans le même en-tête.
 */
const CLASSE = (actif: boolean) =>
  `block border-l-2 px-4 py-3 transition-colors duration-150 ${
    actif ? 'border-accent bg-white/6' : 'border-transparent hover:border-accent hover:bg-white/6'
  }`

function Ligne({
  brand,
  actif,
  locale,
}: {
  brand: (typeof BRANDS)[BrandKey]
  actif: boolean
  locale: Locale
}) {
  return (
    <>
      <span
        className={`block text-[0.8125rem] leading-snug ${actif ? 'text-accent' : 'text-white'}`}
      >
        {brand.legalName}
      </span>
      <span className="mt-1 block text-[0.6875rem] leading-snug text-white/50">
        {brand.sector[locale]}
      </span>
      <span className="mt-1.5 block text-[0.6875rem] tracking-[0.02em] text-white/35">
        {brand.domain}
      </span>
    </>
  )
}
