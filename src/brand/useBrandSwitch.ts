'use client'

import { useEffect, useState, useSyncExternalStore, useTransition } from 'react'

import { switchBrand } from './actions'
import { BRANDS, strictBrandFromHost, type BrandKey } from './brands'

/** Le nom d'hôte ne change pas pendant la vie de la page : il n'y a rien à quoi s'abonner. */
function neJamaisChanger() {
  return () => {}
}

function surDomaineReel() {
  return strictBrandFromHost(window.location.hostname) !== null
}

/**
 * Bascule entre les deux entités, partagé par le sélecteur de l'en-tête et la section
 * « deux sociétés » de l'accueil.
 *
 * Deux comportements, décidés par le nom d'hôte :
 *
 * — Sur un vrai domaine Argentum, chaque société a le sien. Basculer, c'est aller chez l'autre :
 *   le clic redirige vers `argentum-advisors.ch` ou `argentum-investments.ch`, sur la même page.
 *   C'est la cible réelle, et c'est ce qui rend l'adresse affichée cohérente avec la raison
 *   sociale affichée.
 * — Partout ailleurs — localhost, préproduction — aucun des deux domaines ne sert le site :
 *   rediriger casserait la démonstration. Le thème est alors appliqué au `<html>` sans attendre
 *   le serveur, puis l'action serveur pose le cookie et rejoue le rendu pour mettre à jour la
 *   raison sociale dans le corps du texte et les mentions légales du pied de page.
 *
 * `redirects` ne peut être connu qu'après le montage : le rendu du serveur et celui du premier
 * passage client doivent être identiques, et `window` n'existe pas dans le premier. D'où
 * `useSyncExternalStore`, dont c'est le rôle — lire une valeur extérieure à React qui diffère
 * entre serveur et client, sans provoquer le rendu en cascade d'un `setState` dans un effet.
 *
 * `shown` est l'entité que l'interface doit refléter : le choix du visiteur dès qu'il a cliqué,
 * l'entité rendue par le serveur sinon. Le choix n'a pas besoin d'être relâché quand le serveur
 * rattrape — les deux valeurs coïncident alors.
 */
export function useBrandSwitch(active: BrandKey) {
  const [chosen, setChosen] = useState<BrandKey | null>(null)
  const [isPending, startTransition] = useTransition()

  const shown = chosen ?? active
  const redirects = useSyncExternalStore(neJamaisChanger, surDomaineReel, () => false)

  useEffect(() => {
    if (chosen === null) return
    document.documentElement.dataset.brand = chosen
  }, [chosen])

  function select(key: BrandKey) {
    // Comparaison sur `shown` : un second clic pendant que le serveur travaille ne doit pas
    // relancer l'action.
    if (key === shown) return

    if (redirects) {
      window.location.href = hrefFor(key)
      return
    }

    setChosen(key)
    startTransition(() => {
      void switchBrand(key)
    })
  }

  /**
   * Adresse de la même page chez l'autre entité. Vide hors des vrais domaines, où le bouton
   * n'est pas un lien : un `href` pointant vers un domaine qui ne sert pas le site tromperait
   * le visiteur qui survole, et le clic droit « ouvrir dans un nouvel onglet » y mènerait
   * vraiment.
   */
  function hrefFor(key: BrandKey): string {
    if (!redirects) return ''
    const { pathname, search, hash } = window.location
    return `https://${BRANDS[key].domain}${pathname}${search}${hash}`
  }

  return { select, isPending, shown, redirects, hrefFor }
}
