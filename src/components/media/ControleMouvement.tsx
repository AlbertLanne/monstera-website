'use client'

import { useEffect, useState } from 'react'

import { EVENEMENT_REJEU } from '@/components/MotionLayer'

/**
 * Le sélecteur de la page de démonstration.
 *
 * **Ce qu'il résout.** Un panneau de réglages d'animation échoue presque toujours de la même
 * façon : on change le réglage, la page ne bouge pas, parce que ce qui est à l'écran est déjà
 * apparu. Il faut alors deviner l'effet en faisant défiler au hasard. Ici, chaque changement
 * rejoue l'entrée de tout ce qui est visible — on voit la différence à l'endroit où on regarde,
 * immédiatement. C'est ce qui rend la comparaison possible pour quelqu'un qui n'est pas
 * développeur.
 *
 * **Le coût est affiché.** Un client à qui l'on montre quatre intensités sans en donner le prix
 * choisira la plus spectaculaire. La ligne sous chaque nom dit ce que le régime ajoute et ce
 * qu'il coûte — c'est une information de décision, pas un avertissement décoratif.
 *
 * Ce composant ne sert que la démonstration : il n'est monté sur aucune page du site.
 */

type Regime = 'sobre' | 'sobre-plus' | 'marque' | 'max'

const REGIMES: { cle: Regime; nom: string; effet: string; cout: string }[] = [
  {
    cle: 'sobre',
    nom: 'Actuel',
    effet: 'Fondu et 16 px de montée.',
    cout: 'En ligne aujourd’hui.',
  },
  {
    cle: 'sobre-plus',
    nom: 'Sobre +',
    effet: 'Le texte entre du bord qu’il occupe, la cascade s’allonge.',
    cout: 'Aucun octet ajouté.',
  },
  {
    cle: 'marque',
    nom: 'Marqué',
    effet: 'Les photographies se dévoilent, les titres se composent mot à mot.',
    cout: 'Aucun octet ajouté ; images recadrées de 38 %.',
  },
  {
    cle: 'max',
    nom: 'Maximum',
    effet: 'Une caustique WebGL derrière le hero, sensible au défilement et à l’inclinaison.',
    cout: '178 Ko de plus, et la batterie du téléphone.',
  },
]

export function ControleMouvement() {
  const [regime, setRegime] = useState<Regime>('sobre')
  // Replié par défaut : sur un téléphone, le panneau ouvert couvrait le tiers de l'écran et
  // masquait le texte qu'il sert justement à faire regarder.
  const [ouvert, setOuvert] = useState(false)

  // On ouvre sur l'état actuel du site : la démonstration ne vaut que si le point de départ est
  // vu avant les propositions.
  useEffect(() => {
    document.documentElement.dataset.motionIntensite = regime
    window.dispatchEvent(new CustomEvent(EVENEMENT_REJEU))
  }, [regime])

  useEffect(() => {
    return () => {
      delete document.documentElement.dataset.motionIntensite
    }
  }, [])

  const choisi = REGIMES.find((r) => r.cle === regime)

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center p-3 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:justify-end sm:p-0">
      {ouvert ? (
        <fieldset className="pointer-events-auto w-full max-w-md rounded-lg border border-white/15 bg-[#081228]/95 p-4 text-white shadow-2xl backdrop-blur-md sm:w-80">
          <div className="flex items-baseline justify-between gap-3">
            <legend className="sr-only">Intensité du mouvement</legend>
            <span
              aria-hidden="true"
              className="text-[0.6875rem] tracking-[0.18em] text-[#6fa8ff] uppercase"
            >
              Intensité du mouvement
            </span>
            <button
              type="button"
              onClick={() => setOuvert(false)}
              className="-mr-1 rounded px-2 py-1 text-[0.75rem] text-white/60 transition-colors duration-200 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6fa8ff]"
            >
              Replier
            </button>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-1.5">
            {REGIMES.map((r) => {
              const actif = r.cle === regime
              return (
                <label
                  key={r.cle}
                  className={`cursor-pointer rounded px-3 py-2 text-center text-[0.8125rem] transition-colors duration-200 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[#6fa8ff] ${
                    actif
                      ? 'bg-[#6fa8ff] font-semibold text-[#081228]'
                      : 'bg-white/8 hover:bg-white/15'
                  }`}
                >
                  <input
                    type="radio"
                    name="regime-mouvement"
                    value={r.cle}
                    checked={actif}
                    onChange={() => setRegime(r.cle)}
                    className="sr-only"
                  />
                  {r.nom}
                </label>
              )
            })}
          </div>

          <p className="mt-3 text-[0.8125rem] leading-snug text-white/85">{choisi?.effet}</p>
          <p className="mt-1 text-[0.75rem] leading-snug text-white/55">{choisi?.cout}</p>

          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent(EVENEMENT_REJEU))}
            className="mt-3 w-full rounded border border-white/20 px-3 py-2 text-[0.8125rem] text-white/85 transition-colors duration-200 hover:border-[#6fa8ff] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6fa8ff]"
          >
            Rejouer l’entrée
          </button>
        </fieldset>
      ) : (
        <button
          type="button"
          onClick={() => setOuvert(true)}
          className="pointer-events-auto flex items-center gap-3 rounded-full border border-white/15 bg-[#081228]/92 py-2.5 pr-3 pl-4 text-[0.8125rem] text-white shadow-2xl backdrop-blur-md transition-colors duration-200 hover:border-[#6fa8ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6fa8ff]"
        >
          <span className="text-white/55">Mouvement</span>
          <span className="font-semibold text-[#6fa8ff]">{choisi?.nom}</span>
          <span aria-hidden="true" className="text-white/40">
            ▲
          </span>
        </button>
      )}
    </div>
  )
}
