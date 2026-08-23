'use client'

import { useEffect } from 'react'

import { EVENEMENT_REJEU } from '@/components/MotionLayer'

/**
 * Pose le régime de mouvement sur `<html>`, et le retire en partant.
 *
 * Ce composant est tout ce qui reste du panneau à quatre intensités. Le panneau demandait au
 * client de comparer des nuances de discrétion ; il a répondu que l'ensemble restait timide, ce
 * qui était la bonne réponse à une mauvaise question. Il ne reste donc que le site tel qu'il est
 * livré, et cette page — une seule proposition, franche, qu'on accepte ou qu'on refuse.
 *
 * L'attribut vit sur `<html>` plutôt que dans un contexte React parce que ses lecteurs sont
 * `globals.css` d'un côté et deux couches WebGL de l'autre, dispersées dans l'arbre : un
 * observateur d'attribut coûte moins qu'un contexte traversant toute la page pour un booléen.
 *
 * Le rejeu au montage est nécessaire : les blocs déjà à l'écran ont été révélés sous le régime
 * précédent, et sans lui la première chose que verrait le visiteur serait une page figée.
 */
export function RegimeMouvement({ regime = 'premium' }: { regime?: string }) {
  useEffect(() => {
    document.documentElement.dataset.motionIntensite = regime
    window.dispatchEvent(new CustomEvent(EVENEMENT_REJEU))
    return () => {
      delete document.documentElement.dataset.motionIntensite
    }
  }, [regime])

  return null
}
