/**
 * Les sept personnes de l'équipe, livrées par le client dans `content-source/TEAM NAME.odt`.
 *
 * Écrit à la main et non généré : le document est une liste plate séparée par des tirets, sans la
 * structure de titres que `odt2blocks.py` sait lire. Il est archivé avec les autres sources.
 *
 * **L'adresse e-mail ne porte que sa partie locale.** Le client a livré deux adresses par
 * personne, une par entité — `andrew.silver@argentuminvestments.ch` et
 * `andrew.silver@argentumadvisors.ch`. Les écrire toutes les deux violerait la règle du projet :
 * le domaine vient de la marque affichée, comme partout ailleurs.
 *
 * Le client n'a pas fourni de photographies : l'avatar est l'initiale du prénom et celle du nom.
 */

export type Membre = {
  nom: string
  fonction: string
  /** Partie locale de l'adresse ; le domaine vient de `brand.domain`. */
  email: string
}

export type GroupeEquipe = {
  /** Clé du libellé du groupe dans `src/i18n/ui.ts` — le titre est traduit, pas les personnes. */
  cle: 'direction' | 'experts'
  membres: Membre[]
}

/**
 * La casse des noms est normalisée pour l'affichage.
 *
 * Le document livré alterne « ANDREW SILVER », « Matthias BERGMAN » et « Simon Adelstein ». Les
 * afficher tels quels ferait cohabiter trois casses dans une même grille. Seule la présentation
 * est touchée : ni l'orthographe, ni l'ordre, ni les fonctions.
 */
export const EQUIPE: GroupeEquipe[] = [
  {
    cle: 'direction',
    membres: [
      { nom: 'Andrew Silver', fonction: 'Chief Executive Officer', email: 'andrew.silver' },
      { nom: 'Gabriel Silver', fonction: 'Chief Financial Officer', email: 'gabriel.silver' },
      // Le document donne « Chief Financial Officer » à deux personnes, et écrit la partie locale
      // de l'adresse Advisors « mathhias.bergman » là où celle d'Investments dit
      // « matthias.bergman ». Les deux points sont signalés au client ; en attendant, la fonction
      // est reprise telle quelle et l'adresse suit l'orthographe du nom.
      { nom: 'Matthias Bergman', fonction: 'Chief Financial Officer', email: 'matthias.bergman' },
    ],
  },
  {
    cle: 'experts',
    membres: [
      { nom: 'Simon Adelstein', fonction: 'Project Manager', email: 'simon.adelstein' },
      { nom: 'Vincent Meunier', fonction: 'Financial Analyst', email: 'vincent.meunier' },
      { nom: 'Nathalie Berger', fonction: 'Risk Manager', email: 'nathalie.berger' },
      { nom: 'Sebastian Bühler', fonction: 'Investor Relations Specialist', email: 'sebastian.buehler' },
    ],
  },
]

/**
 * Les deux initiales qui tiennent lieu de portrait.
 *
 * Premier et dernier mot du nom : « Sebastian Bühler » donne « SB ». Un nom d'un seul mot donne
 * sa seule initiale plutôt qu'une lettre inventée.
 */
export function initiales(nom: string): string {
  const mots = nom.trim().split(/\s+/).filter(Boolean)
  if (mots.length === 0) return ''
  const premier = mots[0][0]
  const dernier = mots.length > 1 ? mots[mots.length - 1][0] : ''
  return (premier + dernier).toUpperCase()
}

/** L'adresse complète de la personne sur le domaine de l'entité affichée. */
export function adresseEmail(membre: Membre, domain: string): string {
  return `${membre.email}@${domain}`
}
