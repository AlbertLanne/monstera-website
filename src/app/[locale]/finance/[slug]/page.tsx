import type { StaticImageData } from 'next/image'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import capitalInvestissement from '@/assets/images/finance/capital-investissement.webp'
import capitalRisque from '@/assets/images/finance/capital-risque.webp'
import crowdfunding from '@/assets/images/finance/crowdfunding.webp'
import developpementDeProjets from '@/assets/images/finance/developpement-de-projets.webp'
import energiesRenouvelables from '@/assets/images/finance/energies-renouvelables.webp'
import financementImmobilier from '@/assets/images/finance/financement-immobilier.webp'
import investissementsStartUp from '@/assets/images/finance/investissements-start-up.webp'
import medecinePharma from '@/assets/images/finance/medecine-pharma.webp'
import mezzanineCapital from '@/assets/images/finance/mezzanine-capital.webp'
import solutionsTechnologiquesEMobilite from '@/assets/images/finance/solutions-technologiques-e-mobilite.webp'
import { ContentPage, contentMetadata } from '@/components/ContentPage'
import { FINANCE_SLUGS, FINANCE_SLUG_SET } from '@/config/navigation'
import { getPage, type PageSlug } from '@/content'
import { getLocale } from '@/i18n/server'
import { UI, type UIStrings } from '@/i18n/ui'

type Params = { slug: string }

/**
 * Image de couverture par domaine, choisie pour correspondre au texte de la fiche.
 * Aucune personne visible sur ces photographies, à la demande du client.
 */
const IMAGE_BY_SLUG: Record<string, StaticImageData> = {
  'financement-immobilier': financementImmobilier,
  'capital-investissement': capitalInvestissement,
  'capital-risque': capitalRisque,
  'investissements-start-up': investissementsStartUp,
  'mezzanine-capital': mezzanineCapital,
  'developpement-de-projets': developpementDeProjets,
  'energies-renouvelables': energiesRenouvelables,
  'medecine-pharma': medecinePharma,
  'solutions-technologiques-e-mobilite': solutionsTechnologiquesEMobilite,
  crowdfunding: crowdfunding,
}

/** Texte alternatif de chaque couverture, traduit dans les trois langues. */
const ALT_BY_SLUG: Record<string, keyof UIStrings['alt']> = {
  'financement-immobilier': 'financementImmobilier',
  'capital-investissement': 'capitalInvestissement',
  'capital-risque': 'capitalRisque',
  'investissements-start-up': 'startUp',
  'mezzanine-capital': 'mezzanine',
  'developpement-de-projets': 'projets',
  'energies-renouvelables': 'energies',
  'medecine-pharma': 'medecine',
  'solutions-technologiques-e-mobilite': 'technologies',
  crowdfunding: 'genevaSkyline',
}

export function generateStaticParams(): Params[] {
  return FINANCE_SLUGS.map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { slug } = await params
  if (!FINANCE_SLUG_SET.has(slug)) return {}
  return contentMetadata(slug as PageSlug)
}

export default async function FinanceDomainPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  if (!FINANCE_SLUG_SET.has(slug)) notFound()

  const content = slug as PageSlug
  const locale = await getLocale()
  const t = UI[locale]
  // Le fil d'Ariane porte le libellé de la fiche, traduit par le client.
  const label = getPage(locale, content).menu
  const alt = ALT_BY_SLUG[slug]

  return (
    <ContentPage
      slug={content}
      eyebrow={`${t.finance.eyebrow} · ${label}`}
      image={IMAGE_BY_SLUG[slug]}
      imageAlt={alt ? t.alt[alt] : undefined}
    />
  )
}
