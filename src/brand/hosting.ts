/**
 * L'hébergeur du site, nommé dans les pages légales.
 *
 * Le droit suisse n'impose pas de nommer l'hébergeur — c'est une obligation française
 * (LCEN, art. 6-III). Elle est reprise ici parce que le site s'adresse aussi à un public
 * francophone hors de Suisse, et parce qu'un visiteur qui cherche à qui s'adresser en cas de
 * litige gagne à trouver les deux noms au même endroit.
 *
 * **Non renseigné tant que l'hébergement de production n'est pas arrêté.** Le bloc
 * « Hébergement » ne s'affiche pas quand cette valeur est `null` : mieux vaut une page légale
 * silencieuse qu'une page qui nomme un hébergeur faux. Le jour où l'hébergeur est choisi, il n'y
 * a que cet objet à remplir — les trois pages légales et les trois langues suivent.
 *
 * Les deux entités partagent le même déploiement : l'hébergeur ne dépend pas de la marque, il
 * n'a donc pas sa place dans `brands.ts`.
 */
export type Hebergeur = {
  /** Raison sociale de l'hébergeur, telle qu'il la publie lui-même. */
  legalName: string
  /** Adresse du siège, sur une ou plusieurs lignes. */
  address: readonly string[]
  /** Page de l'hébergeur où le visiteur peut vérifier ces informations. */
  url?: string
}

export const HEBERGEUR: Hebergeur | null = null
