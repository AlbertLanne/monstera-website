'use client'

import { useEffect, useId, useRef, useState } from 'react'

/**
 * Menu déroulant de la bande utilitaire — entité du groupe, langue du site.
 *
 * C'est une **divulgation**, pas un menu de commandes : le panneau ne contient que des liens et,
 * hors des vrais domaines, un bouton de bascule. `role="menu"` promettrait une navigation aux
 * flèches que ces listes de trois lignes n'ont aucune raison d'implémenter ; `aria-expanded` sur
 * le déclencheur dit exactement ce qui se passe.
 *
 * Aucune animation d'ouverture. Le panneau déroulant de la navigation principale n'en a pas non
 * plus, et un fondu sur un menu utilitaire ajoute de l'attente sans rien dire.
 */
export function Deroulant({
  /** Ce que porte le déclencheur : l'état courant, pas une invitation. */
  valeur,
  /**
   * Ce que la bande ne dit pas à voix haute : « FR » seul ne se comprend pas hors contexte.
   * Le libellé précède la valeur dans le nom accessible, et reste hors écran.
   */
  aria,
  /** Le panneau déborde à gauche ou à droite de son déclencheur, selon le bord le plus proche. */
  cote = 'gauche',
  largeur = 'w-[19rem]',
  children,
}: {
  valeur: React.ReactNode
  aria: string
  cote?: 'gauche' | 'droite'
  largeur?: string
  children: (fermer: () => void) => React.ReactNode
}) {
  const [ouvert, setOuvert] = useState(false)
  const racine = useRef<HTMLDivElement>(null)
  const panneauId = useId()

  useEffect(() => {
    if (!ouvert) return

    function surTouche(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOuvert(false)
        racine.current?.querySelector('button')?.focus()
      }
    }
    function surClic(e: MouseEvent) {
      if (!racine.current?.contains(e.target as Node)) setOuvert(false)
    }

    document.addEventListener('keydown', surTouche)
    document.addEventListener('pointerdown', surClic)
    return () => {
      document.removeEventListener('keydown', surTouche)
      document.removeEventListener('pointerdown', surClic)
    }
  }, [ouvert])

  return (
    <div ref={racine} className="relative">
      <button
        type="button"
        aria-expanded={ouvert}
        aria-controls={panneauId}
        onClick={() => setOuvert((o) => !o)}
        className="flex items-center gap-2 py-1 text-[0.6875rem] tracking-[0.06em] text-white/70 transition-colors duration-150 hover:text-white aria-expanded:text-white"
      >
        {/* Le nom accessible contient le texte visible, il ne le remplace pas : un `aria-label`
            seul ferait annoncer autre chose que ce qui est écrit. */}
        <span className="sr-only">{aria} : </span>
        {valeur}
        <span
          aria-hidden="true"
          className={`text-[0.625rem] leading-none text-white/60 transition-transform duration-200 ${
            ouvert ? 'rotate-180' : ''
          }`}
        >
          ▾
        </span>
      </button>

      <div
        id={panneauId}
        hidden={!ouvert}
        className={`absolute top-full z-50 pt-2 ${cote === 'droite' ? 'right-0' : 'left-0'}`}
      >
        <div
          className={`overflow-hidden rounded-(--radius-md) border border-menu-line bg-menu py-1.5 shadow-(--shadow-card) ${largeur}`}
        >
          {children(() => setOuvert(false))}
        </div>
      </div>
    </div>
  )
}
