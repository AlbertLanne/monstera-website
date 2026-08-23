'use client'

import { useEffect, useRef } from 'react'

/** Éléments sur lesquels l'anneau se resserre et se remplit : ce qui répond au clic. */
const INTERACTIFS = 'a, button, input, textarea, select, summary, [role="button"], [tabindex]'

/** Éléments sur lesquels l'anneau s'élargit : les photographies, qui répondent au survol. */
const MEDIAS = '[data-survol]'

/**
 * Le curseur sur mesure — un point et un anneau, en DOM.
 *
 * **Pourquoi pas en WebGL.** `CursorGlow` occupe déjà un canvas plein écran pour son halo, et un
 * second contexte pour dessiner deux disques serait absurde. Deux `div` transformés dans la même
 * boucle coûtent une poignée de microsecondes et restent nets à tout rapport d'écran, là où un
 * anneau de deux pixels rendu en shader demande un anticrénelage manuel.
 *
 * **Ce qui fait l'effet, et c'est une seule chose : l'écart.** Le point colle exactement au
 * pointeur, l'anneau le suit avec retard. Le regard lit la distance entre les deux comme une
 * vitesse — le curseur a une inertie, donc une masse. Un anneau qui suivrait sans retard ne
 * serait qu'un pointeur redessiné, et personne ne le remarquerait.
 *
 * **Trois états.** Au repos, un anneau fin de 34 px. Sur un lien ou un bouton, il se resserre à
 * 18 px et se remplit : la cible est petite, le curseur se fait précis. Sur une photographie, il
 * s'ouvre à 76 px et se vide : la cible est grande, le curseur se fait cadre.
 *
 * **Trois raisons de ne rien afficher.** Pas de pointeur fin (tactile), une préférence de
 * mouvement réduit, ou l'absence du régime `premium` — le composant n'est monté que par la page
 * de démonstration, mais il vérifie tout de même, parce qu'un curseur système masqué par une
 * feuille de style dont le JavaScript n'a pas suivi laisserait un visiteur sans pointeur.
 */
export function CurseurSurMesure() {
  const point = useRef<HTMLDivElement>(null)
  const anneau = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const finPointeur = window.matchMedia('(hover: hover) and (pointer: fine)')
    const mouvementReduit = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (!finPointeur.matches || mouvementReduit.matches) return

    const dot = point.current
    const ring = anneau.current
    if (!dot || !ring) return

    const racine = document.documentElement
    // C'est ce drapeau, et lui seul, qui masque le curseur système dans `globals.css`. Il n'est
    // posé qu'ici : si ce code ne s'exécute pas, le pointeur natif reste.
    racine.dataset.curseur = 'sur-mesure'

    const cible = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    const suivi = { x: cible.x, y: cible.y }
    let taille = 34
    let tailleCible = 34
    let remplissage = 0
    let remplissageCible = 0
    let opacite = 0
    let opaciteCible = 0
    let frame = 0

    function boucle() {
      frame = 0
      // 0.16 : assez lent pour que l'écart se voie sur un geste rapide, assez rapide pour que
      // l'anneau ne flotte pas derrière le point quand on s'arrête.
      suivi.x += (cible.x - suivi.x) * 0.16
      suivi.y += (cible.y - suivi.y) * 0.16
      taille += (tailleCible - taille) * 0.18
      remplissage += (remplissageCible - remplissage) * 0.18
      opacite += (opaciteCible - opacite) * 0.15

      dot!.style.transform = `translate3d(${cible.x}px, ${cible.y}px, 0) translate(-50%, -50%)`
      dot!.style.opacity = String(opacite)

      ring!.style.transform =
        `translate3d(${suivi.x}px, ${suivi.y}px, 0) translate(-50%, -50%) scale(${taille / 34})`
      ring!.style.opacity = String(opacite)
      ring!.style.backgroundColor = `color-mix(in srgb, var(--accent-contrast) ${(
        remplissage * 16
      ).toFixed(1)}%, transparent)`

      const immobile =
        Math.abs(cible.x - suivi.x) < 0.3 &&
        Math.abs(cible.y - suivi.y) < 0.3 &&
        Math.abs(tailleCible - taille) < 0.3 &&
        Math.abs(remplissageCible - remplissage) < 0.01 &&
        Math.abs(opaciteCible - opacite) < 0.01
      // La boucle s'arrête quand tout a convergé : un onglet ouvert et immobile ne doit pas
      // consommer une image toutes les 16 ms pour redessiner deux cercles identiques.
      if (!immobile) relancer()
    }

    function relancer() {
      if (!frame) frame = requestAnimationFrame(boucle)
    }

    function surMouvement(event: PointerEvent) {
      if (event.pointerType !== 'mouse') return
      cible.x = event.clientX
      cible.y = event.clientY
      opaciteCible = 1

      const sous = event.target as Element | null
      if (sous?.closest?.(INTERACTIFS)) {
        tailleCible = 18
        remplissageCible = 1
      } else if (sous?.closest?.(MEDIAS)) {
        tailleCible = 76
        remplissageCible = 0
      } else {
        tailleCible = 34
        remplissageCible = 0
      }
      relancer()
    }

    function surSortie() {
      opaciteCible = 0
      relancer()
    }

    // Le clic écrase brièvement l'anneau : un retour tactile qui ne coûte rien.
    function surAppui() {
      tailleCible *= 0.72
      relancer()
    }

    window.addEventListener('pointermove', surMouvement, { passive: true })
    window.addEventListener('pointerdown', surAppui, { passive: true })
    window.addEventListener('pointerup', surMouvement, { passive: true })
    document.addEventListener('pointerleave', surSortie)
    window.addEventListener('blur', surSortie)

    return () => {
      delete racine.dataset.curseur
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', surMouvement)
      window.removeEventListener('pointerdown', surAppui)
      window.removeEventListener('pointerup', surMouvement)
      document.removeEventListener('pointerleave', surSortie)
      window.removeEventListener('blur', surSortie)
    }
  }, [])

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-101 hidden lg:block">
      <div
        ref={anneau}
        style={{ opacity: 0 }}
        className="absolute top-0 left-0 h-[34px] w-[34px] rounded-full border border-(--accent-contrast) mix-blend-difference"
      />
      <div
        ref={point}
        style={{ opacity: 0 }}
        className="absolute top-0 left-0 h-[5px] w-[5px] rounded-full bg-(--accent-contrast) mix-blend-difference"
      />
    </div>
  )
}
