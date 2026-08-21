import type { Cote } from '@/components/media/RangeeAlternee'
import type { ImageFiche } from '@/content/fr/fiche-images'

/**
 * Attribue une photographie aux sections qui peuvent en porter une.
 *
 * Le gabarit des pages Finance n'intercale plus de figures entre les sections : chaque section
 * illustrée est une rangée « texte d'un côté, image de l'autre ». Ce module décide donc d'une
 * seule chose — quelle section reçoit quelle image, et de quel côté.
 *
 * Trois règles :
 *
 * — **Une image par section illustrée, jamais deux.** Le rapport est de un pour un, c'est ce qui
 *   fait qu'une image commente un texte au lieu de meubler un intervalle.
 * — **Les côtés alternent**, en commençant par une image à droite. C'est l'alternance qui donne
 *   son rythme à la page ; deux rangées de suite du même côté le cassent.
 * — **L'éligibilité est décidée par l'appelant.** Une section qui porte une grille de critères ou
 *   un processus numéroté a besoin de toute la largeur : elle reste pleine page et sans image.
 *
 * La logique est séparée du rendu pour être vérifiable : c'est elle qui garantit qu'aucune
 * photographie ne sert deux fois sur une même page.
 */

export type RangeeImage = { image: ImageFiche; cote: Cote }

/** Côté de chaque rangée, à tour de rôle. La première image se pose à droite du paragraphe. */
const COTES: Cote[] = ['droite', 'gauche']

/**
 * @param eligibles pour chaque section, dans l'ordre, si elle peut porter une image
 * @param images    réserve de la page, hors image d'ouverture
 * @returns         l'image et son côté, indexés par le numéro de la section
 */
export function planifierImages(
  eligibles: boolean[],
  images: ImageFiche[],
): Map<number, RangeeImage> {
  const reserve = [...images]
  const plan = new Map<number, RangeeImage>()

  let rang = 0
  for (const [section, eligible] of eligibles.entries()) {
    if (!eligible) continue
    const image = reserve.shift()
    if (!image) break

    plan.set(section, { image, cote: COTES[rang % COTES.length] })
    rang += 1
  }

  return plan
}
