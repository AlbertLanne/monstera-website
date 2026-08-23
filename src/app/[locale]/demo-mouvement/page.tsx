import type { Metadata } from 'next'

import { getBrand } from '@/brand/resolve'
import { CurseurSurMesure } from '@/components/CurseurSurMesure'
import { PageBody } from '@/components/PageBody'
import { HeroPhotoWebGL } from '@/components/media/HeroPhotoWebGL'
import { RegimeMouvement } from '@/components/media/RegimeMouvement'
import { TitreAnime } from '@/components/media/TitreAnime'
import { Container } from '@/components/ui/Container'
import { heroDePage, imagesDeCorps } from '@/config/images-pages'
import { getPage } from '@/content'
import { getLocale } from '@/i18n/server'
import Image from 'next/image'

/**
 * Page de démonstration du mouvement — destinée au client, hors navigation.
 *
 * **Pourquoi une page plutôt qu'une note.** Le client a demandé « un maximum d'effets ». Le décrire
 * par écrit ne permet pas d'en juger : il faut le sentir, sur du contenu réel, sur son propre
 * écran. La page reprend donc une vraie fiche — texte du .odt, photographies livrées, gabarit de
 * production — et ne change que le mouvement.
 *
 * **Une seule proposition, plus un sélecteur.** La première version offrait quatre intensités.
 * Le client les a toutes trouvées trop discrètes, ce qui disait surtout que la question était mal
 * posée : on lui demandait d'arbitrer entre des nuances de retenue. Il ne reste que le régime
 * `premium`, franc, à accepter ou à refuser. Le reste du site n'est pas touché tant qu'il n'a pas
 * tranché — l'attribut ne vit que le temps de cette page.
 *
 * **Elle n'est reliée à rien.** Aucune entrée de menu, aucun lien depuis le site, et un
 * `noindex` explicite en plus des trois niveaux déjà posés. On y arrive par l'URL, elle
 * disparaîtra une fois le choix arrêté.
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
  const locale = await getLocale()
  const page = getPage(locale, FICHE)
  const hero = heroDePage(FICHE)
  const corps = imagesDeCorps(FICHE)

  return (
    <>
      <RegimeMouvement />

      <section className="relative isolate overflow-hidden">
        {hero ? (
          <>
            {/* `unoptimized` : c'est ce qui permet au shader et à cette balise de demander **le
                même fichier**. Par `/_next/image`, le navigateur téléchargerait deux variantes de
                la même photographie — 345 Ko en double sur le premier affichage. L'image source
                est déjà en WebP et dimensionnée : l'optimiseur n'avait rien à y gagner ici.

                Elle reste en place sous le canvas et n'est jamais retirée : elle porte le LCP,
                elle s'affiche pendant le téléchargement de `three`, et c'est elle qu'on voit sans
                WebGL ou en `prefers-reduced-motion`. */}
            <Image
              src={hero.src}
              alt=""
              priority
              unoptimized
              sizes="100vw"
              placeholder="blur"
              className="brand-media absolute inset-0 -z-30 h-full w-full object-cover"
            />
            <HeroPhotoWebGL src={hero.src.src} />
            {/* Le voile passe **au-dessus** du canvas : sous lui, la déformation lessiverait le
                dégradé qui rend le titre lisible. */}
            <div className="absolute inset-0 -z-10 bg-(image:--overlay-video)" />
          </>
        ) : null}

        <Container className="min-h-[30rem] pt-[calc(var(--header-h)+4rem)] pb-16 sm:min-h-[38rem] sm:pt-[calc(var(--header-h)+6rem)] sm:pb-24">
          <div className="flex flex-col gap-6">
            <div data-reveal data-reveal-from="gauche" className="flex items-center gap-4">
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
              <div
                data-reveal
                data-reveal-from="gauche"
                data-reveal-delay="2"
                className="max-w-(--container-prose) space-y-4"
              >
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

      <PageBody page={page} brand={brand} locale={locale} images={corps} />

      <CurseurSurMesure />
    </>
  )
}
