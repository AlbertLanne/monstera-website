import { getPages, type PageSlug } from '@/content'
import { pathnameForLocale, type Locale } from '@/i18n/locales'
import { UI } from '@/i18n/ui'

export type NavLink = {
  label: string
  href: string
  /** Fiche de contenu associée, quand la page en a une. */
  content?: PageSlug
  children?: NavLink[]
}

/**
 * La navigation dépend de la langue.
 *
 * **Les libellés viennent du contenu client**, jamais d'une liste écrite ici : chaque fiche porte
 * son `menu`, traduit par le client dans les trois langues. Une seule entrée fait exception,
 * Contact, qui n'a pas de fiche — son libellé vit dans `src/i18n/ui.ts`.
 *
 * Les chemins, eux, sont communs aux trois langues : les slugs restent français, seul le préfixe
 * de langue change. C'est l'arbitrage d'URL décrit dans `src/i18n/locales.ts`.
 */

/** Chemin d'une page dans la langue voulue : `/services` ou `/en/services`. */
function lien(locale: Locale, chemin: string): string {
  return pathnameForLocale(chemin, locale)
}

/**
 * Sous-menu Finance, classé par priorité commerciale décroissante.
 *
 * Le financement immobilier et le capital-investissement portent le plus de demande et les
 * tickets les plus élevés. Le crowdfunding ferme la liste parce que la fiche du client dit
 * elle-même que la levée de fonds auprès du public n'est pas au cœur de l'approche : c'est une
 * page défensive, pas un produit d'appel.
 */
const FINANCE_SLUGS = [
  'financement-immobilier',
  'capital-investissement',
  'capital-risque',
  'investissements-start-up',
  'mezzanine-capital',
  'developpement-de-projets',
  'energies-renouvelables',
  'medecine-pharma',
  'solutions-technologiques-e-mobilite',
  'crowdfunding',
] as const satisfies readonly PageSlug[]

export type FinanceSlug = (typeof FINANCE_SLUGS)[number]

export function financeLinks(locale: Locale): NavLink[] {
  const pages = getPages(locale)
  return FINANCE_SLUGS.map((slug) => ({
    label: pages[slug].menu,
    href: lien(locale, `/finance/${slug}`),
    content: slug,
  }))
}

export function mainNav(locale: Locale): NavLink[] {
  const pages = getPages(locale)
  return [
    { label: pages.accueil.menu, href: lien(locale, '/'), content: 'accueil' },
    {
      label: pages.services.menu,
      href: lien(locale, '/services'),
      content: 'services',
      children: [
        {
          label: pages['services-immobilier'].menu,
          href: lien(locale, '/services/immobilier'),
          content: 'services-immobilier',
        },
      ],
    },
    {
      label: pages.finance.menu,
      href: lien(locale, '/finance'),
      content: 'finance',
      children: financeLinks(locale),
    },
    { label: pages['a-propos'].menu, href: lien(locale, '/a-propos'), content: 'a-propos' },
    { label: pages.discretion.menu, href: lien(locale, '/discretion'), content: 'discretion' },
    { label: pages['notre-equipe'].menu, href: lien(locale, '/notre-equipe'), content: 'notre-equipe' },
    { label: UI[locale].nav.contact, href: lien(locale, '/contact') },
  ]
}

export function legalNav(locale: Locale): NavLink[] {
  const pages = getPages(locale)
  return (['mentions-legales', 'impressum', 'politique-de-confidentialite'] as const).map((slug) => ({
    label: pages[slug].menu,
    href: lien(locale, `/${slug}`),
    content: slug,
  }))
}

/** Slug de fiche Finance -> URL, pour les liens croisés entre pages sectorielles. */
export function financeHrefByContent(locale: Locale): Map<PageSlug, string> {
  return new Map(financeLinks(locale).map((link) => [link.content as PageSlug, link.href]))
}

/** Le slug de fiche derrière un segment d'URL Finance, pour la route `[slug]`. */
export const FINANCE_SLUG_SET: ReadonlySet<string> = new Set(FINANCE_SLUGS)

export { FINANCE_SLUGS }
