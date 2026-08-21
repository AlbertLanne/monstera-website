import type { Metadata } from 'next'

import image from '@/assets/images/finance.webp'
import { resolveBrandText, type Brand } from '@/brand/brands'
import { getBrand } from '@/brand/resolve'
import { PageHero } from '@/components/PageHero'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { RangeeAlternee } from '@/components/media/RangeeAlternee'
import { vignetteFinance } from '@/config/images-pages'
import { FINANCE_LINKS } from '@/config/navigation'
import { getPage } from '@/content/fr'
import type { PageContent } from '@/content/fr/types'

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getBrand()
  return {
    title: 'Finance',
    description: resolveBrandText(
      'Domaines d’investissement de %BRAND% : financement immobilier, capital-investissement, ' +
        'capital-risque, mezzanine, énergies renouvelables, médecine et technologies.',
      brand,
    ),
  }
}

/**
 * La première phrase de la fiche.
 *
 * Le chapeau (`lead`) est vide sur la plupart des dix fiches — le client y ouvre directement par
 * un intertitre. On reprend alors le premier paragraphe de la première section, qui suit
 * immédiatement l'accroche : c'est le même texte, dans le même ordre, sans rien ajouter.
 */
function premierParagraphe(page: PageContent): string | null {
  if (page.lead[0]) return page.lead[0]
  const bloc = page.sections[0]?.blocks.find((b) => b.type === 'prose')
  return bloc?.paragraphs[0] ?? null
}

/**
 * Sommaire des dix domaines d'investissement.
 *
 * Le client n'a pas livré de fiche pour cette page : chaque domaine reprend le sous-titre et la
 * première phrase de la fiche correspondante, sans texte ajouté. L'ordre est celui du sous-menu,
 * classé par priorité commerciale décroissante — c'est ce que la numérotation donne à lire.
 *
 * La mise en page est celle des fiches : une rangée par domaine, texte d'un côté, photographie
 * de l'autre, les côtés alternant. Chaque domaine montre donc une image de son propre dossier,
 * au lieu du paquet d'images qui fermait la page auparavant.
 */
export default async function FinancePage() {
  const brand = await getBrand()

  const domains = FINANCE_LINKS.map((link) => {
    const page = getPage(link.content!)
    return {
      href: link.href,
      label: link.label,
      /** Le premier intertitre de la fiche fait office d'accroche. */
      claim: page.sections[0]?.title ?? null,
      summary: premierParagraphe(page),
      vignette: vignetteFinance(link.content!),
    }
  })

  return (
    <>
      <PageHero
        eyebrow="Finance"
        title="Dix domaines d’investissement, une même exigence de substance économique"
        lead={[
          'Chaque domaine fait l’objet d’une évaluation individuelle. %BRAND% engage ses propres ' +
            'capitaux et, lorsque cela est approprié, ceux de partenaires privés sélectionnés au ' +
            'sein de son réseau.',
        ]}
        brand={brand}
        image={image}
        imageAlt="Le massif du Salève au-dessus du bassin genevois"
      />

      <ol className="bg-page">
        {domains.map((domain, index) =>
          domain.vignette ? (
            <li key={domain.href} className="border-t border-line">
              <RangeeAlternee
                image={domain.vignette}
                cote={index % 2 === 0 ? 'droite' : 'gauche'}
                href={domain.href}
                densite="compacte"
              >
                <DomaineTexte domain={domain} numero={index + 1} brand={brand} />
              </RangeeAlternee>
            </li>
          ) : null,
        )}
      </ol>

      <section className="bg-band py-16 text-band-text sm:py-20">
        <Container>
          <div className="flex flex-col gap-6">
            <span aria-hidden="true" className="h-px w-14 bg-band-accent" />
            <h2 className="max-w-[32ch] text-[1.75rem] leading-[1.2] text-band-text sm:text-[2.125rem]">
              Votre projet n’entre dans aucune de ces catégories&nbsp;?
            </h2>
            <p className="max-w-(--container-prose) text-[1.0625rem] leading-[1.75] text-band-muted">
              {resolveBrandText(
                'Chaque opportunité est examinée selon ses caractéristiques propres. Présentez ' +
                  'votre projet à %BRAND% : une première évaluation déterminera s’il correspond ' +
                  'au profil d’investissement recherché.',
                brand,
              )}
            </p>
            <div className="pt-2">
              <Button href="/contact" variant="onBand">
                Présentez votre projet
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  )
}

type Domaine = {
  label: string
  claim: string | null
  summary: string | null
}

/** Le contenu d'une rangée du sommaire. Le titre est un `h2` : la page est une liste de domaines. */
function DomaineTexte({
  domain,
  numero,
  brand,
}: {
  domain: Domaine
  numero: number
  brand: Brand
}) {
  return (
    <div className="flex flex-col gap-4">
      <span className="font-(family-name:--font-display) text-[0.875rem] tabular-nums text-accent-contrast">
        {String(numero).padStart(2, '0')}
      </span>
      <h2 className="font-(family-name:--font-display) text-[1.625rem] leading-[1.2] text-text-strong sm:text-[1.875rem]">
        {domain.label}
      </h2>
      {domain.claim ? (
        <p className="max-w-[42ch] text-[1.0625rem] leading-snug text-text">
          {resolveBrandText(domain.claim, brand)}
        </p>
      ) : null}
      {domain.summary ? (
        <p className="line-clamp-3 text-[0.9375rem] leading-[1.7] text-text-muted">
          {resolveBrandText(domain.summary, brand)}
        </p>
      ) : null}
      <span
        aria-hidden="true"
        className="mt-2 inline-flex items-center gap-3 text-[0.8125rem] text-text-muted transition-colors duration-200 group-hover:text-accent-contrast"
      >
        Découvrir
        <span className="h-px w-8 bg-current transition-all duration-300 ease-(--ease-out-quart) group-hover:w-14" />
      </span>
    </div>
  )
}
