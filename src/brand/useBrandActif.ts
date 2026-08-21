'use client'

import { useEffect, useState } from 'react'

import { BRAND_KEYS, type BrandKey } from '@/brand/brands'

/**
 * L'entité affichée, lue sur `<html data-brand>`.
 *
 * `useBrandSwitch` pose cet attribut dès le clic, sans attendre le serveur : c'est lui qui fait
 * basculer le thème sans transition visible. Tout ce qui doit changer aussi vite — la signature
 * de l'en-tête, la couleur du halo du pointeur — le lit ici plutôt que d'attendre le nouveau
 * rendu serveur, qui met une centaine de millisecondes à arriver.
 *
 * L'attribut, et non un contexte React : le sélecteur de l'en-tête et la section « deux
 * sociétés » de l'accueil sont deux contrôles indépendants, chacun avec son propre état. Le
 * `<html>` est le seul endroit où les deux se rejoignent immédiatement.
 *
 * @param defaut l'entité rendue par le serveur, pour que le premier rendu client soit identique
 */
export function useBrandActif(defaut: BrandKey): BrandKey {
  const [brand, setBrand] = useState(defaut)

  useEffect(() => {
    function lire() {
      const valeur = document.documentElement.dataset.brand
      if (BRAND_KEYS.includes(valeur as BrandKey)) setBrand(valeur as BrandKey)
    }

    lire()
    const observateur = new MutationObserver(lire)
    observateur.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-brand'],
    })
    return () => observateur.disconnect()
  }, [])

  return brand
}
