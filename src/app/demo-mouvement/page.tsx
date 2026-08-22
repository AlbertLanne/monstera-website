import type { Metadata } from 'next'

import { getBrand } from '@/brand/resolve'
import { PageBody } from '@/components/PageBody'
import { ControleMouvement } from '@/components/media/ControleMouvement'
import { HeroWebGL } from '@/components/media/HeroWebGL'
import { TitreAnime } from '@/components/media/TitreAnime'
import { Container } from '@/components/ui/Container'
import { heroDePage, imagesDeCorps } from '@/config/images-pages'
import { getPage } from '@/content/fr'
import Image from 'next/image'

/**
 * Page de démonstration du mouvement — destinée au client, hors navigation.
 *
 * **Pourquoi une page plutôt qu'une note.** Le client a demandé « un maximum d'effets ». Décrire
 * quatre intensités par écrit ne permet pas d'en choisir une : il faut les sentir, sur du
 * contenu réel, sur son propre téléphone. La page reprend donc une vraie fiche — texte du .odt,
 * photographies livrées, gabarit de production — et n'ajoute qu'un sélecteur.
 *
 * **Elle n'est reliée à rien.** Aucune entrée de menu, aucun lien depuis le site, et un
 * `noindex` explicite en plus des trois niveaux déjà posés sur le site. On y arrive par l'URL,
 * elle disparaîtra une fois le choix arrêté.
 *
 * Le contenu affiché est celui de Financement immobilier : c'est la fiche la mieux dotée en
 * photographies, donc celle où l'alternance des rangées se lit le plus clairement.
 */

const FICHE = 'financement-immobilier' as const

export const metadata: Metadata = {
  title: 'Démonstration — mouvement',
  robots: { index: false, follow: false },
}

export default async function DemoMouvementPage() {
  const brand = await getBrand()
  const page = getPage(FICHE)
  const hero = heroDePage(FICHE)
  const corps = imagesDeCorps(FICHE)

  return (
    <>
      <section className="relative isolate overflow-hidden">
        {hero ? (
          <>
            <Image
              src={hero.src}
              alt=""
              priority
              sizes="100vw"
              placeholder="blur"
              data-parallax="7"
              className="brand-media absolute inset-0 -z-20 h-full w-full object-cover"
            />
            <div className="absolute inset-0 -z-20 bg-(image:--overlay-video)" />
          </>
        ) : null}

        {/* La caustique se pose entre le voile et le texte. Elle ne se charge qu'en régime
            « maximum » : sur les trois autres, ce nœud reste un div vide. */}
        <HeroWebGL />

        <Container className="min-h-[26rem] pt-[calc(var(--header-h)+4rem)] pb-16 sm:min-h-[32rem] sm:pt-[calc(var(--header-h)+6rem)] sm:pb-24">
          <div className="flex flex-col gap-6">
            <div data-reveal className="flex items-center gap-4">
              <span aria-hidden="true" className="h-px w-14 bg-white/70" />
              <span className="text-[0.6875rem] tracking-[0.16em] text-white/80 uppercase">
                Démonstration · mouvement
              </span>
            </div>

            <TitreAnime
              as="h1"
              texte={page.title ?? page.menu}
              className="max-w-[26ch] text-[2.25rem] leading-[1.1] text-white sm:text-[3rem] lg:text-[3.5rem]"
            />

            {page.lead.length ? (
              <div data-reveal data-reveal-delay="1" className="max-w-(--container-prose) space-y-4">
                {page.lead.map((paragraphe, index) => (
                  <p
                    key={index}
                    className="text-[1.0625rem] leading-[1.75] text-white/85 sm:text-[1.125rem]"
                  >
                    {paragraphe}
                  </p>
                ))}
              </div>
            ) : null}
          </div>
        </Container>
      </section>

      <PageBody page={page} brand={brand} images={corps} />

      <ControleMouvement />
    </>
  )
}
