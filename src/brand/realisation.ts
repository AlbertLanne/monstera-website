/**
 * L'agence qui a conçu et réalisé le site, nommée dans les pages légales.
 *
 * À ne pas confondre avec l'éditeur : l'éditeur est la société qui **publie** le contenu et en
 * répond — c'est Argentum, et le bloc `EditeurDuSite` la nomme en premier. Le réalisateur est le
 * prestataire technique. Les deux mentions coexistent sur un Impressum suisse sans se
 * contredire ; les fondre en une seule attribuerait à l'agence la responsabilité éditoriale du
 * contenu financier, ce qui serait faux.
 *
 * Comme pour `HEBERGEUR`, une valeur à `null` fait disparaître le bloc entier : mieux vaut une
 * page légale silencieuse qu'une page qui nomme un prestataire faux. Les lignes facultatives
 * absentes sont omises, jamais devinées.
 *
 * Le réalisateur ne dépend pas de la marque affichée — les deux entités partagent le même site,
 * donc le même prestataire. Il n'a pas sa place dans `brands.ts`.
 */
export type Realisateur = {
  /** Raison sociale, telle que le prestataire la publie sur son propre Impressum. */
  legalName: string
  /** Adresse du siège, une entrée par ligne affichée. */
  address: readonly string[]
  /** Site du prestataire, sur lequel la raison sociale est liée. */
  url?: string
  /** Adresse de contact publique. */
  email?: string
  /** Numéro public, au format international. */
  phone?: string
  /** Numéro d'identification suisse des entreprises (IDE/UID). */
  uid?: string
}

/**
 * Source des données : l'Impressum publié par Liip lui-même (liip.ch, consulté le 26 août 2026).
 * L'adresse retenue est celle de l'Impressum — `CH-1701 Fribourg`, la case postale du siège — et
 * non le `CH-1700` de la page « Nos bureaux », qui désigne l'adresse de rue.
 */
export const REALISATEUR: Realisateur | null = {
  legalName: 'Liip AG',
  address: ['Rue de la Banque 1', 'CH-1701 Fribourg'],
  url: 'https://www.liip.ch',
  email: 'contact@liip.ch',
  phone: '+41 26 588 03 36',
  uid: 'CHE-113.471.088',
}
