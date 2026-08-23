/**
 * Les deux entités juridiques du groupe Argentum.
 *
 * Un seul code est déployé sur deux noms de domaine. Les deux SA sont réellement distinctes :
 * numéros de registre différents, secteurs d'activité différents, adresses e-mail différentes.
 * Toute donnée propre à une entité vit ici et nulle part ailleurs — écrire une raison sociale
 * en dur dans une page produirait une mention légale fausse sur l'autre domaine.
 *
 * Champs à `null` = donnée que le client n'a pas encore fournie. Le rendu omet la ligne
 * plutôt que d'afficher une valeur supposée.
 */

import type { Locale } from '@/i18n/locales'

export const BRAND_KEYS = ['investments', 'advisors'] as const

export type BrandKey = (typeof BRAND_KEYS)[number]

export type PostalAddress = {
  street: string
  postalCode: string
  city: string
  country: string
}

export type Brand = {
  key: BrandKey
  /** Raison sociale complète, substituée au jeton %BRAND% du contenu. */
  legalName: string
  /** Mot qui distingue les deux entités, pour le bouton de bascule. */
  distinctive: string
  /** Numéro au registre du commerce genevois. */
  registryNumber: string
  /** Fiche publique de l'entité au registre, pour que le visiteur puisse vérifier lui-même. */
  registryUrl: string
  /** Numéro d'identification des entreprises. */
  uid: string | null
  address: PostalAddress | null
  /**
   * Secteur tel qu'inscrit au registre du commerce.
   *
   * Le registre genevois l'inscrit en français ; l'anglais et l'allemand sont des traductions,
   * à faire confirmer par le client avant la mise en ligne — c'est une mention légale.
   */
  sector: Record<Locale, string>
  /** Dernière publication au registre du commerce. */
  lastPublication: string
  representative: string | null
  email: string
  /** Aucune des deux entités n'a communiqué de numéro : ne jamais afficher de téléphone. */
  phone: null
  domain: string
  /** Différencie visuellement les deux entités sans sortir de la palette de marque. */
  theme: 'light' | 'dark'
  /** Résumé d'une ligne, utilisé en balise description et sur le sélecteur. */
  tagline: Record<Locale, string>
}

const GENEVA_ADDRESS: PostalAddress = {
  street: 'Avenue Marc-Doret 14A',
  postalCode: '1224',
  city: 'Chêne-Bougeries',
  country: 'Suisse',
}

export const BRANDS: Record<BrandKey, Brand> = {
  investments: {
    key: 'investments',
    legalName: 'Argentum Investments SA',
    distinctive: 'Investments',
    registryNumber: 'CH-660.0.244.019-9',
    registryUrl: 'https://www.moneyhouse.ch/en/company/argentum-investments-sa-4141745391',
    uid: 'CHE-134.341.014',
    address: GENEVA_ADDRESS,
    sector: {
      fr: 'Exploitation de sociétés d’investissement',
      en: 'Operation of investment companies',
      de: 'Betrieb von Investmentgesellschaften',
    },
    lastPublication: '14.03.2019',
    representative: 'Andrew Silver',
    email: 'contact@argentuminvestments.ch',
    phone: null,
    domain: 'argentuminvestments.ch',
    theme: 'light',
    tagline: {
      fr: 'Capital privé pour entreprises, projets et opportunités sélectionnés.',
      en: 'Private capital for selected companies, projects and opportunities.',
      de: 'Privates Kapital für ausgewählte Unternehmen, Projekte und Gelegenheiten.',
    },
  },
  advisors: {
    key: 'advisors',
    legalName: 'Argentum Advisors SA',
    distinctive: 'Advisors',
    registryNumber: 'CH-660.0.242.019-2',
    registryUrl: 'https://www.moneyhouse.ch/de/company/argentum-advisors-sa-20144934951',
    // Non communiqués par le client — voir la liste des données manquantes dans CLAUDE.md.
    uid: null,
    address: null,
    sector: {
      fr: 'Prestations de services pour banques et établissements de crédit',
      en: 'Services for banks and credit institutions',
      de: 'Dienstleistungen für Banken und Kreditinstitute',
    },
    lastPublication: '07.02.2019',
    representative: null,
    email: 'contact@argentumadvisors.ch',
    phone: null,
    domain: 'argentumadvisors.ch',
    theme: 'dark',
    tagline: {
      fr: 'Prestations de services pour banques et établissements de crédit.',
      en: 'Services for banks and credit institutions.',
      de: 'Dienstleistungen für Banken und Kreditinstitute.',
    },
  },
}

export const DEFAULT_BRAND: BrandKey = 'investments'

/** Nom du cookie qui mémorise la bascule manuelle du visiteur. */
export const BRAND_COOKIE = 'argentum-brand'

export function isBrandKey(value: unknown): value is BrandKey {
  return typeof value === 'string' && (BRAND_KEYS as readonly string[]).includes(value)
}

/** Déduit l'entité du nom d'hôte : argentumadvisors.ch ouvre sur Advisors. */
export function brandFromHost(host: string | null | undefined): BrandKey | null {
  if (!host) return null
  const normalized = host.toLowerCase()
  for (const key of BRAND_KEYS) {
    if (normalized.includes(BRANDS[key].domain)) return key
  }
  // Couvre les sous-domaines de préproduction du type `advisors.vercel.app`.
  for (const key of BRAND_KEYS) {
    if (normalized.includes(key)) return key
  }
  return null
}

/**
 * L'entité d'un vrai domaine Argentum, et rien d'autre.
 *
 * `brandFromHost` reconnaît large — il accepte une préproduction nommée `advisors.vercel.app`.
 * C'est ce qu'on veut pour choisir l'entité d'ouverture, mais pas pour décider qui fait autorité :
 * sur un vrai domaine le nom d'hôte prime sur le cookie et la bascule devient une redirection,
 * alors qu'en démonstration locale elle reste instantanée. Les deux comportements se distinguent
 * ici, sur une correspondance exacte de domaine enregistré, `www.` compris.
 */
export function strictBrandFromHost(host: string | null | undefined): BrandKey | null {
  if (!host) return null
  // Le port n'appartient pas au domaine : `argentumadvisors.ch:3000` reste le domaine réel.
  const hostname = host.toLowerCase().split(':')[0].replace(/\.$/, '')
  for (const key of BRAND_KEYS) {
    const domain = BRANDS[key].domain
    if (hostname === domain || hostname.endsWith(`.${domain}`)) return key
  }
  return null
}

export function otherBrand(key: BrandKey): BrandKey {
  return key === 'investments' ? 'advisors' : 'investments'
}

/**
 * Découpe la raison sociale en deux lignes pour le sélecteur d'entité.
 *
 * Le sélecteur affiche la raison sociale complète, pas le seul mot distinctif : « Investments »
 * ne désigne aucune société. Sur deux lignes, les deux boutons tiennent dans l'en-tête sans
 * écraser la navigation. Le découpage part de `legalName` et jamais d'un « Argentum » écrit en
 * dur — une raison sociale ne se recompose pas à la main.
 */
export function splitLegalName(brand: Brand): [string, string] {
  const [first, ...rest] = brand.legalName.split(' ')
  return rest.length > 0 ? [first, rest.join(' ')] : [brand.legalName, '']
}

/** Remplace le jeton %BRAND% du contenu client par la raison sociale de l'entité active. */
export function resolveBrandText(text: string, brand: Brand): string {
  return text.replaceAll('%BRAND%', brand.legalName)
}
