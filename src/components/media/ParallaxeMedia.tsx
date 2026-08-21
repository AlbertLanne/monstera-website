import Image from 'next/image'

import { Container } from '@/components/ui/Container'
import type { ImageFiche } from '@/content/fr/fiche-images'

/**
 * Le bandeau pleine largeur — la seule figure d'image qui ne soit pas une rangée.
 *
 * Les figures superposées (une vignette flottant sur une grande image) et empilées (trois
 * images côte à côte) ont été retirées : elles produisaient des paquets d'images sans rapport
 * avec le texte qui les précédait. Une photographie accompagne désormais un paragraphe, dans
 * `RangeeAlternee`. Le bandeau subsiste pour les respirations de fin de page, où il n'y a plus
 * de texte à accompagner.
 *
 * Il n'est pas un composant client : le mouvement est piloté par `MotionLayer`, qui lit
 * l'attribut `data-parallax` posé ici. La couche est découpée par son conteneur, donc agrandie
 * par `--parallax-zoom` dans `globals.css` — sans cette marge, le déplacement laisserait un vide
 * en haut ou en bas.
 */
export function BandeauImage({
  image,
  alt = '',
  legende,
  hauteur = 'moyenne',
}: {
  image: ImageFiche
  alt?: string
  legende?: string
  hauteur?: 'basse' | 'moyenne' | 'haute'
}) {
  const hauteurs = {
    basse: 'h-[16rem] sm:h-[20rem]',
    moyenne: 'h-[22rem] sm:h-[28rem] lg:h-[34rem]',
    haute: 'h-[28rem] sm:h-[36rem] lg:h-[44rem]',
  }

  return (
    <section aria-hidden={alt === '' ? 'true' : undefined} className="relative">
      <div className={`relative isolate overflow-hidden ${hauteurs[hauteur]}`}>
        <Image
          src={image.src}
          alt={alt}
          sizes="100vw"
          placeholder="blur"
          data-parallax="9"
          className="brand-media absolute inset-0 h-full w-full object-cover"
        />
        {/* Voile de marque. Dense quand une légende blanche est posée dessus et doit rester
            lisible, léger sinon — il teinte l'image sans l'éteindre. */}
        <div
          aria-hidden="true"
          className={`absolute inset-0 ${
            legende ? 'bg-(image:--overlay-video)' : 'bg-(image:--overlay-media)'
          }`}
        />
        {legende ? (
          <Container className="relative flex h-full items-end pb-10">
            <p
              data-reveal
              className="max-w-[38ch] font-(family-name:--font-display) text-[1.375rem] leading-snug text-white sm:text-[1.75rem]"
            >
              {legende}
            </p>
          </Container>
        ) : null}
      </div>
    </section>
  )
}
