import type { Metadata } from 'next'

import image from '@/assets/images/contact.webp'
import { resolveBrandText } from '@/brand/brands'
import { getBrand } from '@/brand/resolve'
import { LegalIdentity } from '@/components/LegalIdentity'
import { PageHero } from '@/components/PageHero'
import { BandeauImage } from '@/components/media/ParallaxeMedia'
import { ProjectEnquiryForm } from '@/components/ProjectEnquiryForm'
import { Container } from '@/components/ui/Container'
import { IMAGES_FICHES } from '@/content/fiche-images'
import { capitalChoices, domainChoices } from '@/domain/project-enquiry'
import { getLocale } from '@/i18n/server'
import { UI } from '@/i18n/ui'

/** Vue aérienne d'une ville suisse, pour fermer la page sans rien ajouter au propos. */
const BANDEAU =
  IMAGES_FICHES['financement-immobilier']?.find(
    (i) => i.fichier === 'financement-immobilier-4.webp',
  ) ?? null

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getBrand()
  const locale = await getLocale()
  const t = UI[locale]
  return {
    title: t.contact.eyebrow,
    description: resolveBrandText(t.formulaire.metaDescription, brand),
  }
}

/**
 * Page Contact.
 *
 * Le client n'a livré aucune fiche pour cette page : son contenu reprend le vocabulaire des
 * autres fiches — évaluation individuelle, confidentialité, délais de trois à quatre semaines —
 * et l'identité légale vient de la configuration de marque.
 */
export default async function ContactPage() {
  const brand = await getBrand()
  const locale = await getLocale()
  const t = UI[locale]

  return (
    <>
      <PageHero
        eyebrow={t.contact.eyebrow}
        title={t.contact.titre}
        lead={[t.contact.lead]}
        brand={brand}
        image={image}
        imageAlt={t.alt.contact}
      />

      <section className="bg-page py-16 sm:py-20 lg:py-(--spacing-section)">
        <Container>
          <div className="grid gap-16 lg:grid-cols-[1.6fr_1fr] lg:gap-20">
            <div>
              <div className="mb-10 flex flex-col gap-5">
                <span aria-hidden="true" className="h-px w-14 bg-accent" />
                <h2 className="text-[1.75rem] leading-[1.2] sm:text-[2rem]">
                  {t.formulaire.titreSection}
                </h2>
                <p className="max-w-(--container-prose) text-[1rem] leading-[1.75] text-text-muted">
                  {t.formulaire.introSection}
                </p>
              </div>

              <ProjectEnquiryForm
                email={brand.email}
                locale={locale}
                strings={t}
                domaines={domainChoices(locale)}
                tranches={capitalChoices(locale)}
              />
            </div>

            <aside className="lg:border-l lg:border-line lg:pl-12">
              <h2 className="mb-8 text-[1.25rem] leading-snug">{t.formulaire.coordonnees}</h2>
              <LegalIdentity brand={brand} locale={locale} registryLink />

              <div className="mt-10 border-t border-line pt-8">
                <h3 className="mb-3 text-[1.0625rem]">{t.formulaire.deroulement}</h3>
                <ol className="space-y-3 text-[0.875rem] leading-[1.7] text-text-muted">
                  {t.formulaire.etapes.map((etape) => (
                    <li key={etape.titre}>
                      <span className="text-text">{etape.titre}</span> — {etape.texte}
                    </li>
                  ))}
                </ol>
              </div>
            </aside>
          </div>
        </Container>
      </section>

      {BANDEAU ? <BandeauImage image={BANDEAU} hauteur="basse" /> : null}
    </>
  )
}
