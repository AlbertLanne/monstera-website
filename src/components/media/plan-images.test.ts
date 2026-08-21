import { describe, expect, it } from 'vitest'

import { planifierImages } from './plan-images'
import type { ImageFiche, OrientationImage } from '@/content/fr/fiche-images'

/**
 * La répartition décide de ce que le visiteur voit en face de chaque paragraphe. Une erreur ici
 * ne casse rien — elle produit une page qui a l'air bâclée : la même photographie deux fois, deux
 * rangées penchées du même côté, une image en face d'une grille de critères qui n'a pas la place.
 */

const faux = { src: 1, width: 1, height: 1 } as unknown as ImageFiche['src']

function image(nom: string, orientation: OrientationImage = 'paysage'): ImageFiche {
  return { fichier: `${nom}.webp`, src: faux, orientation }
}

function lot(nombre: number): ImageFiche[] {
  return Array.from({ length: nombre }, (_, i) => image(`p${i}`))
}

/** n sections toutes illustrables. */
function toutes(nombre: number): boolean[] {
  return Array.from({ length: nombre }, () => true)
}

describe('planifierImages', () => {
  it('ne place rien sans image', () => {
    expect(planifierImages(toutes(8), []).size).toBe(0)
  })

  it('ne place rien sans section illustrable', () => {
    expect(planifierImages([false, false, false], lot(6)).size).toBe(0)
  })

  it('donne une image à chaque section illustrable', () => {
    const plan = planifierImages(toutes(6), lot(8))
    expect(plan.size).toBe(6)
  })

  it('n’utilise jamais deux fois la même image', () => {
    const fichiers = [...planifierImages(toutes(9), lot(9)).values()].map((r) => r.image.fichier)
    expect(new Set(fichiers).size).toBe(fichiers.length)
  })

  it('saute les sections qui ne peuvent pas porter d’image', () => {
    // Une grille de critères ou un processus numéroté prend toute la largeur : pas de rangée.
    const plan = planifierImages([true, false, true, false, true], lot(5))
    expect([...plan.keys()]).toEqual([0, 2, 4])
  })

  it('pose la première image à droite du paragraphe', () => {
    const plan = planifierImages(toutes(3), lot(3))
    expect(plan.get(0)?.cote).toBe('droite')
  })

  it('alterne les côtés d’une rangée à l’autre', () => {
    // L'alternance se compte sur les rangées, pas sur les sections : deux rangées séparées par
    // une section pleine largeur doivent quand même changer de bord.
    const plan = planifierImages([true, false, true, true], lot(4))
    expect([...plan.values()].map((r) => r.cote)).toEqual(['droite', 'gauche', 'droite'])
  })

  it('s’arrête quand la réserve est épuisée', () => {
    const plan = planifierImages(toutes(10), lot(3))
    expect(plan.size).toBe(3)
    expect([...plan.keys()]).toEqual([0, 1, 2])
  })
})
