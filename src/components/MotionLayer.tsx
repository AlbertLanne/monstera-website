'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

/**
 * Délai au bout duquel on vérifie que l'observateur a bien donné signe de vie. S'il n'a rien
 * révélé du tout — API présente mais inopérante — on montre toute la page : un bloc resté
 * invisible est pire qu'un bloc sans effet.
 *
 * Le filet ne révèle que dans ce cas. Une version antérieure révélait tout inconditionnellement,
 * ce qui neutralisait l'apparition au défilement dès la seconde et demie.
 */
const FILET_DE_SECURITE_MS = 1500

/**
 * Sélecteur des éléments à révéler.
 *
 * `[data-mots]` rejoint `[data-reveal]` : un titre découpé mot à mot est observé comme un bloc,
 * mais c'est le CSS qui décide si ce sont ses mots ou lui-même qui entrent. L'observateur ne
 * connaît pas l'effet, seulement le moment.
 */
const A_REVELER = '[data-reveal]:not([data-revealed]), [data-mots]:not([data-revealed])'

/**
 * Événement qui redemande une entrée sur tout ce qui est à l'écran.
 *
 * Sans lui, changer de régime d'intensité ne montrerait rien : les blocs visibles sont déjà
 * révélés, et il faudrait faire défiler la page pour en croiser un neuf. Le contrôle de la page
 * de démonstration l'émet à chaque changement.
 */
export const EVENEMENT_REJEU = 'argentum:rejouer-mouvement'

/**
 * Apparition des blocs au défilement et parallaxe des images.
 *
 * Un seul observateur pour toute la page plutôt qu'un composant client par bloc : les pages sont
 * rendues sur le serveur et doivent le rester. Les composants marquent leurs éléments avec
 * `data-reveal` et `data-parallax`, ce fichier les anime, et le CSS de `globals.css` ne s'applique
 * que sous `html[data-motion='on']` — sans JavaScript, le site s'affiche entièrement, sans effet.
 *
 * Rien ne se déclenche si le visiteur a demandé à réduire les animations.
 */
export function MotionLayer() {
  const pathname = usePathname()
  const [rejeu, setRejeu] = useState(0)

  useEffect(() => {
    const redemander = () => setRejeu((n) => n + 1)
    window.addEventListener(EVENEMENT_REJEU, redemander)
    return () => window.removeEventListener(EVENEMENT_REJEU, redemander)
  }, [])

  // Posé une seule fois : le retirer entre deux pages ferait clignoter tout ce qui est déjà apparu.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    document.documentElement.dataset.motion = 'on'
  }, [])

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const reveal = (element: Element) => {
      ;(element as HTMLElement).dataset.revealed = ''
    }

    // Un rejeu remet tout à l'état non révélé avant d'observer : c'est ce qui rend un changement
    // de régime visible immédiatement, sans avoir à faire défiler la page.
    if (rejeu > 0) {
      document
        .querySelectorAll<HTMLElement>('[data-revealed]')
        .forEach((element) => delete element.dataset.revealed)
    }

    const cibles = document.querySelectorAll<HTMLElement>(A_REVELER)
    let aReveleQuelqueChose = false

    // `-10%` en bas : le bloc apparaît quand il est franchement entré, pas au premier pixel.
    const observateur = new IntersectionObserver(
      (entrees) => {
        for (const entree of entrees) {
          if (!entree.isIntersecting) continue
          aReveleQuelqueChose = true
          reveal(entree.target)
          observateur.unobserve(entree.target)
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.04 },
    )
    cibles.forEach((cible) => observateur.observe(cible))

    // Au chargement, ce qui est déjà à l'écran est révélé aussitôt : si rien ne l'a été au bout
    // du délai, c'est que l'observateur ne fonctionne pas et la page doit s'afficher entière.
    const secours = window.setTimeout(() => {
      if (aReveleQuelqueChose) return
      observateur.disconnect()
      cibles.forEach(reveal)
    }, FILET_DE_SECURITE_MS)

    // --- Parallaxe ---------------------------------------------------------
    // L'amplitude est un pourcentage de la hauteur de l'image, appliqué en `translate`. Le
    // conteneur découpe le débordement et l'image est agrandie dans `globals.css` : sans cette
    // marge, le déplacement laisserait apparaître un vide en haut ou en bas.
    const couches = Array.from(document.querySelectorAll<HTMLElement>('[data-parallax]'))
    let frame = 0

    function placer() {
      frame = 0
      const hauteurVue = window.innerHeight
      for (const couche of couches) {
        const hote = couche.parentElement ?? couche
        const boite = hote.getBoundingClientRect()
        if (boite.bottom < 0 || boite.top > hauteurVue) continue
        // −1 quand le bloc entre par le bas, +1 quand il sort par le haut.
        const centre = boite.top + boite.height / 2
        const progression = (centre - hauteurVue / 2) / ((hauteurVue + boite.height) / 2)
        const amplitude = Number(couche.dataset.parallax) || 8
        couche.style.setProperty('--parallax', `${(progression * amplitude).toFixed(2)}%`)
      }
    }

    function programmer() {
      if (!frame) frame = requestAnimationFrame(placer)
    }

    if (couches.length > 0) {
      placer()
      window.addEventListener('scroll', programmer, { passive: true })
      window.addEventListener('resize', programmer)
    }

    return () => {
      observateur.disconnect()
      window.clearTimeout(secours)
      window.removeEventListener('scroll', programmer)
      window.removeEventListener('resize', programmer)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [pathname, rejeu])

  return null
}
