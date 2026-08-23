import Image from 'next/image'
import Link from 'next/link'
import type { ReactNode } from 'react'

import type { ImageFiche } from '@/content/fiche-images'

/**
 * Une rangée « texte d'un côté, photographie de l'autre » — le gabarit des pages Finance.
 *
 * Ce qu'elle remplace : des pavés de texte pleine largeur suivis de figures posées entre deux
 * sections, où les images se superposaient et s'empilaient sans rapport avec ce qui était écrit
 * juste au-dessus. Ici la photographie est **la moitié de la section**, pas un intervalle.
 *
 * Deux décisions portent la mise en page :
 *
 * — **La photographie court jusqu'au bord de la fenêtre.** La rangée est une grille en deux
 *   moitiés posée sur toute la largeur du document : la moitié image touche le bord de l'écran,
 *   sans coins arrondis ni ombre. Ce n'est pas une vignette collée sur la page, c'est une
 *   ouverture dans la page. C'est aussi ce qui interdit de retomber sur une carte.
 *
 * — **La colonne de texte reste alignée sur la grille du site.** Elle n'utilise pourtant pas
 *   `Container` : une boîte de `--container-page / 2` poussée contre le milieu de la rangée
 *   place son bord extérieur exactement où `Container` place le sien, sans recourir à `100vw`
 *   — qui compte la barre de défilement et décalerait le texte de quelques pixels.
 *
 * La hauteur de l'image est celle du texte : c'est le paragraphe qui commande le cadrage, pas
 * un rapport d'image fixé d'avance. Sous `lg`, la rangée redevient une colonne — texte puis
 * photographie pleine largeur.
 *
 * **Le mouvement d'entrée découle de cette mise en page**, il n'est pas plaqué dessus : le texte
 * arrive du bord qu'il occupe, et la photographie se dévoile depuis l'arête qui touche le texte,
 * donc vers l'intérieur de la page. Une rangée dont l'image est à gauche joue l'inverse. C'est
 * ce qui distingue une entrée latérale motivée d'un effet décoratif : le sens du mouvement dit
 * quelque chose de la grille. Les amplitudes, elles, viennent du régime d'intensité
 * (`globals.css`) — à `sobre`, l'entrée latérale vaut zéro et le balisage ne produit rien.
 */

export type Cote = 'gauche' | 'droite'

/**
 * Rapport de la fenêtre tant que la rangée est en colonne. Au-delà de `lg` il ne s'applique plus :
 * c'est la hauteur du paragraphe d'en face qui commande. En dessous, une verticale forcée en
 * 16/9 perdrait les trois quarts de son sujet.
 */
const RAPPORTS: Record<string, string> = {
  portrait: 'aspect-[4/5]',
  panoramique: 'aspect-[21/9]',
  carre: 'aspect-square sm:aspect-[4/3]',
  paysage: 'aspect-[4/3] sm:aspect-[16/9]',
}

/**
 * Deux respirations. `aeree` pour une section de fiche, qui porte plusieurs paragraphes ;
 * `compacte` pour le sommaire Finance, dont les dix rangées s'enchaînent — au même rythme que
 * les fiches, la page ferait le double de sa hauteur utile.
 */
export type Densite = 'aeree' | 'compacte'

const RESPIRATIONS: Record<Densite, { hauteur: string; padding: string }> = {
  aeree: { hauteur: 'lg:min-h-[30rem]', padding: 'py-14 sm:py-16 lg:py-20' },
  compacte: { hauteur: 'lg:min-h-[22rem]', padding: 'py-12 sm:py-14' },
}

/** Boîte de texte alignée sur la grille de `Container`, poussée contre le milieu de la rangée. */
function DemiTexte({
  imageADroite,
  padding,
  children,
}: {
  imageADroite: boolean
  padding: string
  children: ReactNode
}) {
  return (
    <div
      className={`flex lg:items-center ${
        imageADroite ? 'lg:justify-end' : 'lg:justify-start lg:order-2'
      }`}
    >
      <div
        data-reveal
        {...{ 'data-reveal-from': imageADroite ? 'gauche' : 'droite' }}
        className={`w-full max-w-[calc(var(--container-page)/2)] pr-(--page-gutter) pl-(--page-gutter) ${padding} ${
          imageADroite ? 'lg:pr-16' : 'lg:pl-16'
        }`}
      >
        {children}
      </div>
    </div>
  )
}

/**
 * La moitié photographique. Sa hauteur est celle de la rangée : `absolute inset-0` sur un
 * conteneur étiré par la grille, sinon une image de rapport fixe laisserait un blanc en face
 * d'un paragraphe plus long qu'elle.
 */
function DemiImage({
  image,
  alt,
  imageADroite,
  survolable,
}: {
  image: ImageFiche
  alt: string
  imageADroite: boolean
  survolable: boolean
}) {
  return (
    <div
      data-reveal
      data-reveal-delay="1"
      data-survol
      {...{ 'data-reveal-masque': imageADroite ? '' : 'droite' }}
      aria-hidden={alt === '' ? 'true' : undefined}
      className={`relative isolate overflow-hidden lg:aspect-auto lg:min-h-full ${
        RAPPORTS[image.orientation] ?? RAPPORTS.paysage
      } ${imageADroite ? '' : 'lg:order-1'}`}
    >
      {/* Enfant unique du cadre, et c'est voulu : c'est lui que le masque découpe et lui qui
          glisse en sens contraire de l'ouverture. Le laisser porter par le cadre lui-même
          rendrait la rangée invisible à `IntersectionObserver` — voir `globals.css`. En régime
          premium il déborde latéralement, ce qui fournit la marge dans laquelle il glisse. */}
      <div className="absolute inset-0">
        <Image
          src={image.src}
          alt={alt}
          sizes="(min-width: 1024px) 60vw, 120vw"
          placeholder="blur"
          data-parallax="6"
          className="brand-media absolute inset-0 h-full w-full object-cover"
        />
        {/* Voile de marque. Il s'efface au survol quand la rangée est un lien. */}
        <div
          aria-hidden="true"
          className={`absolute inset-0 bg-(image:--overlay-media) transition-opacity duration-500 ease-(--ease-out-quart) ${
            survolable ? 'group-hover:opacity-0 group-focus-visible:opacity-0' : ''
          }`}
        />
      </div>
    </div>
  )
}

/**
 * @param image  photographie de la moitié illustrée
 * @param cote   côté où se pose la photographie ; le texte occupe l'autre moitié
 * @param alt    vide pour une image d'accompagnement — le texte à côté la décrit déjà
 * @param href   rend la rangée entière cliquable, image comprise
 * @param densite respiration verticale ; voir `RESPIRATIONS`
 */
export function RangeeAlternee({
  image,
  cote = 'droite',
  alt = '',
  href,
  densite = 'aeree',
  children,
}: {
  image: ImageFiche
  cote?: Cote
  alt?: string
  href?: string
  densite?: Densite
  children: ReactNode
}) {
  const imageADroite = cote === 'droite'
  const respiration = RESPIRATIONS[densite]
  const grille = `group grid lg:grid-cols-2 ${respiration.hauteur}`

  const corps = (
    <>
      <DemiTexte imageADroite={imageADroite} padding={respiration.padding}>
        {children}
      </DemiTexte>
      <DemiImage image={image} alt={alt} imageADroite={imageADroite} survolable={Boolean(href)} />
    </>
  )

  if (!href) return <div className={grille}>{corps}</div>

  return (
    <Link href={href} className={grille}>
      {corps}
    </Link>
  )
}
