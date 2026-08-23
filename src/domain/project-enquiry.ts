import { z } from 'zod'

import { FINANCE_SLUGS } from '@/config/navigation'
import { getPages } from '@/content'
import type { Locale } from '@/i18n/locales'
import { UI } from '@/i18n/ui'

/**
 * Soumission de projet — le seul formulaire du site.
 *
 * Le contenu client répète le même appel à l'action sur chaque page : présenter une entreprise
 * ou un projet en vue d'une évaluation. Les champs reprennent ce que les fiches annoncent
 * analyser : besoin en capitaux, utilisation prévue des fonds, domaine concerné.
 *
 * **La valeur envoyée ne dépend pas de la langue.** Le `<select>` porte un identifiant stable —
 * `energies-renouvelables`, `2-5` — et n'affiche que le libellé traduit. Sans cela, le schéma de
 * validation aurait dû énumérer trente libellés, et la demande reçue par le client aurait changé
 * de vocabulaire selon la langue du visiteur.
 */

/** Domaines proposés au visiteur, dans l'ordre du sous-menu Finance. */
export const ENQUIRY_DOMAINS = [...FINANCE_SLUGS, 'immobilier-direct', 'autre'] as const

/**
 * Tranches de besoin en capitaux. Le seuil bas correspond au minimum annoncé par le client
 * (1,5 M€ sur l'accueil, 2 M€ sur les fiches sectorielles).
 */
export const CAPITAL_RANGES = ['1.5-2', '2-5', '5-10', '10-25', '25+'] as const

export type EnquiryDomain = (typeof ENQUIRY_DOMAINS)[number]
export type CapitalRange = (typeof CAPITAL_RANGES)[number]

export type Choix = { value: string; label: string }

/** Les dix domaines Finance portent le libellé traduit par le client ; les deux autres, le nôtre. */
export function domainChoices(locale: Locale): Choix[] {
  const pages = getPages(locale)
  const t = UI[locale].formulaire
  return [
    ...FINANCE_SLUGS.map((slug) => ({ value: slug, label: pages[slug].menu })),
    { value: 'immobilier-direct', label: t.immobilierDirect },
    { value: 'autre', label: t.autreDomaine },
  ]
}

export function capitalChoices(locale: Locale): Choix[] {
  const t = UI[locale].formulaire
  return CAPITAL_RANGES.map((value, index) => ({ value, label: t.tranches[index] }))
}

/** Le libellé lisible d'une valeur, pour composer le message envoyé. */
export function labelOf(choices: Choix[], value: string): string {
  return choices.find((c) => c.value === value)?.label ?? value
}

/** Le schéma porte les messages de la langue du visiteur : c'est lui qui les lira. */
export function projectEnquirySchema(locale: Locale) {
  const e = UI[locale].formulaire.erreurs

  return z.object({
    firstName: z.string().trim().min(1, e.prenom).max(100),
    lastName: z.string().trim().min(1, e.nom).max(100),
    email: z.string().trim().toLowerCase().email(e.email).max(200),
    phone: z.string().trim().max(40).optional().or(z.literal('')),
    company: z.string().trim().min(1, e.societe).max(160),
    country: z.string().trim().max(100).optional().or(z.literal('')),
    domain: z.enum(ENQUIRY_DOMAINS, { message: e.domaine }),
    capital: z.enum(CAPITAL_RANGES, { message: e.capitaux }),
    useOfFunds: z.string().trim().min(20, e.utilisation).max(3000),
    message: z.string().trim().min(40, e.presentation).max(6000),
    consent: z.literal('on', { message: e.consentement }),
    /** Piège à robots : rempli automatiquement, jamais par un humain. */
    website: z.string().max(0).optional().or(z.literal('')),
  })
}

export type ProjectEnquiry = z.infer<ReturnType<typeof projectEnquirySchema>>

export type EnquiryState =
  | { status: 'idle' }
  | { status: 'success' }
  | { status: 'error'; message: string; fieldErrors?: Record<string, string[]> }
