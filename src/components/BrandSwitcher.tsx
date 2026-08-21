'use client'

import { BRANDS, BRAND_KEYS, splitLegalName } from '@/brand/brands'
import type { useBrandSwitch } from '@/brand/useBrandSwitch'

/**
 * Bascule entre Argentum Investments SA et Argentum Advisors SA.
 *
 * Les deux boutons portent la raison sociale complète : « Investments » et « Advisors » seuls ne
 * désignent aucune société, et ce sélecteur est le seul endroit du site où les deux entités
 * apparaissent côte à côte. Elles tiennent dans l'en-tête grâce au découpage sur deux lignes.
 *
 * Sur un vrai domaine Argentum, l'entité inactive est un lien vers son propre domaine : le
 * visiteur voit l'adresse au survol et peut l'ouvrir dans un nouvel onglet. Ailleurs, c'est un
 * bouton qui bascule sur place — voir `useBrandSwitch`.
 *
 * Le composant ne tient pas son propre état : l'en-tête affiche **deux** sélecteurs — la barre et
 * le tiroir mobile — qui doivent réagir ensemble à un même clic. C'est donc l'appelant qui tient
 * `useBrandSwitch` et le passe ici.
 */

export type Commandes = ReturnType<typeof useBrandSwitch>

type Apparence = {
  className?: string
  /** Au-dessus d'un fond sombre, les jetons de thème ne sont pas lisibles. */
  onDark?: boolean
}

export function BrandSwitcher({
  commandes,
  className = '',
  onDark = false,
}: Apparence & { commandes: Commandes }) {
  const { select, isPending, shown, redirects, hrefFor } = commandes

  return (
    <div
      role="group"
      aria-label="Entité du groupe Argentum"
      data-pending={isPending ? '' : undefined}
      className={`inline-flex items-stretch rounded-(--radius-md) border p-0.5 ${
        onDark ? 'border-white/30' : 'border-line'
      } ${className}`}
    >
      {BRAND_KEYS.map((key) => {
        const brand = BRANDS[key]
        const [prefix, rest] = splitLegalName(brand)
        const isActive = key === shown
        // Sur fond sombre, l'entité active est marquée au ciel et non au blanc : c'est la
        // couleur d'accent des deux thèmes, et le blanc plein rendait la barre monocouleur.
        const tone = onDark
          ? isActive
            ? 'bg-accent text-navy-950'
            : 'text-white/70 hover:text-white'
          : isActive
            ? 'bg-brand text-on-brand'
            : 'text-text-muted hover:text-accent-contrast'

        const label = (
          <>
            <span
              className={`block text-[0.5625rem] leading-none font-normal ${
                isActive ? 'opacity-70' : 'opacity-55'
              }`}
            >
              {prefix}
            </span>
            <span className="mt-0.5 block leading-none">{rest}</span>
          </>
        )

        const shared =
          'rounded-[calc(var(--radius-md)-1px)] px-3 py-1.5 text-center text-[0.6875rem] font-medium ' +
          `uppercase tracking-[0.08em] transition-colors duration-200 ${tone}`

        // Le domaine réel : un lien, avec tout ce qu'un lien apporte — survol qui montre
        // l'adresse, ouverture dans un nouvel onglet, clic du milieu.
        return redirects && !isActive ? (
          <a
            key={key}
            href={hrefFor(key)}
            title={`${brand.legalName} — ${brand.tagline}`}
            className={shared}
          >
            {label}
          </a>
        ) : (
          <button
            key={key}
            type="button"
            onClick={() => select(key)}
            aria-pressed={isActive}
            title={`${brand.legalName} — ${brand.tagline}`}
            className={shared}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
