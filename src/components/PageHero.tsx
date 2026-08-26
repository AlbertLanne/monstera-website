import Image, { type StaticImageData } from 'next/image'

import { resolveBrandText, type Brand } from '@/brand/brands'
import { HeroPhotoWebGL } from '@/components/media/HeroPhotoWebGL'
import { TitreAnime } from '@/components/media/TitreAnime'
import { Container } from '@/components/ui/Container'

/**
 * Ouverture des pages intérieures : filet d'accent, surtitre, titre, chapeau.
 *
 * Avec `image`, le titre passe sur une photographie voilée en navy — les pages qui n'en ont pas
 * gardent un fond uni, ce qui est le cas de Discrétion & Confidentialité, où une photographie
 * de foule contredirait le propos.
 *
 * **Le shader de la page de démonstration est ici depuis le 26 août 2026.** Le client a tranché :
 * le régime `premium` est celui du site. La photographie d'ouverture est donc passée dans
 * `HeroPhotoWebGL` — déformation au pointeur, aberration chromatique, et surtout le balayage
 * d'entrée de gauche à droite qui pose le vocabulaire latéral de la page avant tout défilement.
 *
 * Trois garde-fous portés par le composant lui-même, rien à faire ici : il ne se charge pas hors
 * du régime `premium`, ni si le visiteur a demandé moins de mouvement, et `three` n'est alors
 * jamais téléchargé. Le `<Image>` reste dessous dans tous les cas — il porte le LCP et sert de
 * repli sans WebGL.
 *
 * `unoptimized` sur cette image n'est pas une négligence : c'est ce qui fait que le shader et la
 * balise demandent **le même fichier**. Par `/_next/image`, le navigateur téléchargerait deux
 * variantes de la même photographie sur le premier affichage.
 */
export function PageHero({
  eyebrow,
  title,
  lead,
  brand,
  image,
  imageAlt,
}: {
  eyebrow?: string
  title: string
  lead?: string[]
  brand: Brand
  image?: StaticImageData
  imageAlt?: string
}) {
  const onImage = Boolean(image)
  // Sans photographie ni chapeau, la hauteur d'un hero éditorial ne laisserait qu'un grand vide
  // sous le titre. C'est le cas de Discrétion & Confidentialité, dont le .odt place son premier
  // paragraphe sous un intertitre.
  const bare = !onImage && !lead?.length

  return (
    <section
      className={`relative isolate overflow-hidden ${
        onImage ? '' : 'border-b border-line bg-page-alt'
      }`}
    >
      {image ? (
        <>
          {/* La parallaxe porte sur l'image, pas sur le voile : le voile doit couvrir la
              section entière quelle que soit la position de la photographie. */}
          <Image
            src={image}
            alt={imageAlt ?? ''}
            priority
            unoptimized
            sizes="100vw"
            placeholder="blur"
            data-parallax="7"
            className="brand-media absolute inset-0 -z-30 h-full w-full object-cover"
          />
          <HeroPhotoWebGL src={image.src} />
          {/* Le voile passe **au-dessus** du canvas : sous lui, la déformation lessiverait le
              dégradé qui rend le titre lisible. */}
          <div className="absolute inset-0 -z-10 bg-(image:--overlay-video)" />
        </>
      ) : null}

      <Container
        className={
          bare
            ? 'pt-[calc(var(--header-h)+3rem)] pb-10 sm:pt-[calc(var(--header-h)+4rem)] sm:pb-14'
            : `pt-[calc(var(--header-h)+4rem)] pb-16 sm:pt-[calc(var(--header-h)+6rem)] sm:pb-24 ${
                onImage ? 'min-h-[26rem] sm:min-h-[32rem]' : ''
              }`
        }
      >
        <div className="flex flex-col gap-6">
          {/* Surtitre, titre et chapeau entrent séparément, par la gauche et en cascade. Groupés
              sous une seule révélation, ils arrivaient d'un bloc : c'est le décalage entre les
              trois qui fait lire une ouverture plutôt qu'un fondu. */}
          <div data-reveal data-reveal-from="gauche" className="flex items-center gap-4">
            <span
              aria-hidden="true"
              className={`h-px w-14 ${onImage ? 'bg-white/70' : 'bg-accent'}`}
            />
            {eyebrow ? (
              <span
                className={`text-[0.6875rem] uppercase tracking-[0.16em] ${
                  onImage ? 'text-white/80' : 'text-text-muted'
                }`}
              >
                {eyebrow}
              </span>
            ) : null}
          </div>

          <TitreAnime
            as="h1"
            texte={resolveBrandText(title, brand)}
            className={`max-w-[26ch] text-[2.25rem] leading-[1.1] sm:text-[3rem] lg:text-[3.5rem] ${
              onImage ? 'text-white' : 'text-text-strong'
            }`}
          />

          {lead?.length ? (
            <div
              data-reveal
              data-reveal-from="gauche"
              data-reveal-delay="2"
              className="max-w-(--container-prose) space-y-4"
            >
              {lead.map((paragraph, index) => (
                <p
                  key={index}
                  className={`text-[1.0625rem] leading-[1.75] sm:text-[1.125rem] ${
                    onImage ? 'text-white/85' : 'text-text-muted'
                  }`}
                >
                  {resolveBrandText(paragraph, brand)}
                </p>
              ))}
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  )
}
