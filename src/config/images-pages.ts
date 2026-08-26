import { IMAGES_FICHES, type ImageFiche } from '@/content/fiche-images'
import type { Locale } from '@/i18n/locales'

/**
 * Quelles images vont sur quelle page.
 *
 * Le client a livré ses photographies rangées par domaine d'investissement : dix dossiers, dix
 * fiches Finance. Les autres pages — accueil, services, à propos, discrétion, pages juridiques —
 * n'ont reçu aucune image et puisent donc dans ces mêmes dossiers. Le choix est fait ici, à la
 * main : c'est un travail de sens, pas de tri automatique. Une photographie de barrage n'illustre
 * pas la page Discrétion, même si le script saurait la redimensionner.
 *
 * Trois règles ont guidé les emprunts :
 *
 * — **Aucune marque tierce sur les pages composées.** Les photographies où une enseigne est
 *   lisible restent sur la fiche pour laquelle le client les a fournies. Voir la liste dans le
 *   `CLAUDE.md` : les afficher sur l'accueil ou la page Services suggérerait une relation
 *   d'affaires qui n'existe pas.
 * — **Aucune image d'une fiche ne sert deux fois en ouverture.** Une image de tête vue ailleurs
 *   perd sa fonction de repère.
 * — **La page Discrétion ne reçoit ni visage ni lieu identifiable**, seulement de l'architecture
 *   abstraite. Le propos de la fiche est le retrait de la communication publique.
 *
 * Les textes alternatifs décrivent ce que les photographies montrent réellement, image par
 * image. Les images de corps n'en portent pas : elles accompagnent un texte qui dit déjà ce
 * qu'elles illustrent, et une description redondante gênerait un lecteur d'écran.
 *
 * **Ils sont traduits dans les trois langues.** Un lecteur d'écran anglais ou allemand ne doit
 * pas recevoir une description française. Ces textes ne viennent d'aucun document client : c'est
 * nous qui les avons écrits, leurs traductions sont produites par IA comme celles de
 * `src/i18n/ui.ts`.
 */

export type Hero = { fichier: string; alt: Record<Locale, string> }

/** Une image empruntée à une fiche : dossier d'origine et numéro. */
type Pioche = [dossier: string, numero: number]

/**
 * Photographies écartées du site, et pourquoi.
 *
 * Le client a livré 96 photographies. Un audit visuel du 23 août 2026, dossier par dossier, en a
 * trouvé quatre qui montrent des personnes **identifiables de face** : les publier engagerait le
 * droit à l'image de gens qui n'ont rien signé, sur le site d'une société d'investissement qui
 * n'est pas leur employeur.
 *
 * Ce filtre s'applique partout — ouverture, vignette de sommaire, corps de page — pour qu'un
 * retrait ne puisse pas être contourné par un emprunt. Retirer une entrée d'ici la remet en
 * circulation ; c'est le seul geste à faire si le client obtient les autorisations.
 */
export const IMAGES_RETIREES: Record<string, string> = {
  'investissements-start-up-4.webp': 'Femme de face, nette et identifiable — droit à l’image',
  'capital-investissement-2.webp': 'Femme de profil, identifiable — droit à l’image',
  'capital-investissement-3.webp': 'Homme de face, net et identifiable — droit à l’image',
  'crowdfunding-9.webp': 'Sept personnes identifiables en réunion — droit à l’image',
}

function estRetiree(fichier: string): boolean {
  return fichier in IMAGES_RETIREES
}

/** Image d'ouverture des pages qui n'en avaient pas. */
export const HEROS_PAGES: Record<string, Hero & { dossier: string }> = {
  'capital-investissement': {
    dossier: 'capital-investissement',
    fichier: 'capital-investissement-8.webp',
    alt: {
      fr: 'Immeuble de bureaux contemporain au bord d’une rivière',
      en: 'Contemporary office building on a riverbank',
      de: 'Modernes Bürogebäude am Flussufer',
    },
  },
  'capital-risque': {
    dossier: 'capital-risque',
    fichier: 'capital-risque-6.webp',
    alt: {
      fr: 'Bâtiment universitaire contemporain aux courbes de béton, éclairé au crépuscule',
      en: 'Contemporary university building with curved concrete, lit at dusk',
      de: 'Modernes Universitätsgebäude mit geschwungenem Beton, in der Dämmerung beleuchtet',
    },
  },
  crowdfunding: {
    dossier: 'crowdfunding',
    fichier: 'crowdfunding-10.webp',
    alt: {
      fr: 'Quartier d’affaires suisse à la tombée du jour',
      en: 'Swiss business district at nightfall',
      de: 'Schweizer Geschäftsviertel bei Einbruch der Nacht',
    },
  },
  'developpement-de-projets': {
    dossier: 'developpement-de-projets',
    fichier: 'developpement-de-projets-8.webp',
    alt: {
      fr: 'Tours de logements et de bureaux récemment livrées, en périphérie urbaine',
      en: 'Recently completed residential and office towers on the urban fringe',
      de: 'Kürzlich fertiggestellte Wohn- und Bürotürme am Stadtrand',
    },
  },
  'energies-renouvelables': {
    dossier: 'energies-renouvelables',
    fichier: 'energies-renouvelables-2.webp',
    alt: {
      fr: 'Barrage hydroélectrique retenant un lac d’altitude dans les Alpes suisses',
      en: 'Hydroelectric dam holding back a high-altitude lake in the Swiss Alps',
      de: 'Wasserkraftwerk-Staumauer mit Bergsee in den Schweizer Alpen',
    },
  },
  'financement-immobilier': {
    dossier: 'financement-immobilier',
    fichier: 'financement-immobilier-6.webp',
    alt: {
      fr: 'Vue aérienne d’une vieille ville suisse traversée par une rivière',
      en: 'Aerial view of a Swiss old town crossed by a river',
      de: 'Luftaufnahme einer Schweizer Altstadt, von einem Fluss durchquert',
    },
  },
  'investissements-start-up': {
    dossier: 'investissements-start-up',
    fichier: 'investissements-start-up-1.webp',
    alt: {
      fr: 'Campus universitaire et parc technologique au bord du Léman',
      en: 'University campus and technology park on the shore of Lake Geneva',
      de: 'Universitätscampus und Technologiepark am Genfersee',
    },
  },
  'medecine-pharma': {
    dossier: 'medecine-pharma',
    fichier: 'medecine-pharma-3.webp',
    alt: {
      fr: 'Bâle au crépuscule, les tours du quartier pharmaceutique se reflétant dans le Rhin',
      en: 'Basel at dusk, the towers of the pharmaceutical district reflected in the Rhine',
      de: 'Basel in der Dämmerung, die Türme des Pharmaquartiers spiegeln sich im Rhein',
    },
  },
  'mezzanine-capital': {
    dossier: 'mezzanine-capital',
    fichier: 'mezzanine-capital-10.webp',
    alt: {
      fr: 'Centre historique d’une ville suisse au crépuscule, le long de la rivière',
      en: 'Historic centre of a Swiss city at dusk, along the river',
      de: 'Historisches Zentrum einer Schweizer Stadt in der Dämmerung, entlang des Flusses',
    },
  },
  'solutions-technologiques-e-mobilite': {
    dossier: 'solutions-technologiques-e-mobilite',
    fichier: 'solutions-technologiques-e-mobilite-3.webp',
    alt: {
      fr: 'Train régional longeant un vignoble en terrasses au bord du Léman',
      en: 'Regional train running along terraced vineyards by Lake Geneva',
      de: 'Regionalzug entlang von Terrassenweinbergen am Genfersee',
    },
  },

  // Pages qui n'avaient aucune photographie d'ouverture.
  discretion: {
    dossier: 'mezzanine-capital',
    fichier: 'mezzanine-capital-9.webp',
    alt: {
      fr: 'Volume de béton courbe abritant une esplanade déserte',
      en: 'Curved concrete volume sheltering a deserted esplanade',
      de: 'Geschwungener Betonbau über einer menschenleeren Esplanade',
    },
  },
  impressum: {
    dossier: 'mezzanine-capital',
    fichier: 'mezzanine-capital-1.webp',
    alt: {
      fr: 'Immeuble de bureaux suisse des années soixante, façade sur rue',
      en: 'Swiss office building from the sixties, street-facing facade',
      de: 'Schweizer Bürogebäude aus den sechziger Jahren, Strassenfassade',
    },
  },
  'mentions-legales': {
    dossier: 'mezzanine-capital',
    fichier: 'mezzanine-capital-7.webp',
    alt: {
      fr: 'Tour de bureaux vitrée se détachant sur un ciel dégagé',
      en: 'Glazed office tower against a clear sky',
      de: 'Verglaster Büroturm vor klarem Himmel',
    },
  },
  'politique-de-confidentialite': {
    dossier: 'capital-risque',
    fichier: 'capital-risque-10.webp',
    alt: {
      fr: 'Intérieur clair et vide d’un bâtiment contemporain',
      en: 'Bright, empty interior of a contemporary building',
      de: 'Heller, leerer Innenraum eines modernen Gebäudes',
    },
  },
}

/**
 * Vignette de chaque domaine sur le sommaire Finance.
 *
 * Le sommaire est une suite de rangées « texte à gauche, photographie à droite » : chaque
 * domaine y montre une image de son propre dossier. Deux contraintes ont fixé le choix :
 * jamais l'image d'ouverture de la fiche — vue deux fois, elle perdrait sa fonction de repère —
 * et jamais une photographie portant une marque tierce lisible, la liste étant dans le
 * `CLAUDE.md`. Toutes sont en format paysage : le sommaire tient sur un rythme régulier.
 */
const VIGNETTES_FINANCE: Record<string, Pioche> = {
  'financement-immobilier': ['financement-immobilier', 9],
  'capital-investissement': ['capital-investissement', 1],
  'capital-risque': ['capital-risque', 2],
  'investissements-start-up': ['investissements-start-up', 2],
  'mezzanine-capital': ['mezzanine-capital', 5],
  'developpement-de-projets': ['developpement-de-projets', 3],
  'energies-renouvelables': ['energies-renouvelables', 3],
  'medecine-pharma': ['medecine-pharma', 4],
  'solutions-technologiques-e-mobilite': ['solutions-technologiques-e-mobilite', 2],
  crowdfunding: ['crowdfunding', 2],
}

/**
 * Images de corps des pages composées, dans l'ordre où elles seront consommées par
 * `planifierImages`. Les fiches Finance ne figurent pas ici : elles utilisent tout leur dossier.
 */
const CORPS_PAGES: Record<string, Pioche[]> = {
  // Villes et architecture suisses : le registre de l'accueil est celui du pays, pas d'un métier.
  accueil: [
    ['financement-immobilier', 8],
    ['financement-immobilier', 1],
    ['mezzanine-capital', 3],
    ['financement-immobilier', 5],
    ['mezzanine-capital', 6],
    ['financement-immobilier', 10],
  ],
  // Services : le travail d'évaluation, donc des bureaux. `capital-investissement 3` a été
  // remplacé le 23 août 2026 — l'homme y était identifiable de face.
  services: [
    ['mezzanine-capital', 3],
    ['capital-investissement', 1],
    ['mezzanine-capital', 7],
    ['mezzanine-capital', 8],
    ['capital-investissement', 10],
    ['mezzanine-capital', 4],
  ],
  // Services immobilier : le dossier du client sur le financement immobilier, moins son ouverture.
  'services-immobilier': [
    ['financement-immobilier', 8],
    ['financement-immobilier', 2],
    ['financement-immobilier', 9],
    ['financement-immobilier', 1],
    ['financement-immobilier', 10],
    ['financement-immobilier', 5],
  ],
  'a-propos': [
    ['capital-risque', 4],
    ['mezzanine-capital', 9],
    ['mezzanine-capital', 6],
    ['capital-risque', 3],
    ['mezzanine-capital', 3],
    ['capital-risque', 8],
  ],
  // Notre équipe : lieux de travail, sans visage — le client n'a livré aucun portrait et la
  // grille des partenaires a été retirée faute de données. Voir le CLAUDE.md.
  'notre-equipe': [
    // `capital-investissement 8` a été remplacé le 23 août 2026 : l'enseigne LGT Bank y est
    // lisible, et la règle du projet interdit toute marque tierce sur une page composée.
    ['capital-risque', 2],
    ['mezzanine-capital', 3],
    ['capital-risque', 7],
    ['mezzanine-capital', 4],
    ['capital-risque', 10],
    ['mezzanine-capital', 6],
  ],
  // Digital Assets : le client n'a livré aucune photographie pour cette fiche. Le lot
  // « Solutions technologiques & E-Mobilité » aurait semblé le voisin naturel, mais il est fait
  // de trains, de tunnels et de bornes de recharge : un convoi CFF sous un paragraphe sur la
  // tokenisation dessert le propos. Ce sont donc des façades — grille vitrée, géométrie de verre,
  // ligne d'horizon — le registre abstrait déjà employé sur À propos et Discrétion, et le plus
  // proche de ce dont parle la fiche : infrastructure, réseau, structure durable.
  'actifs-numeriques': [
    ['capital-risque', 5],
    ['capital-investissement', 6],
    ['capital-investissement', 9],
  ],
  // Discrétion : architecture abstraite, aucun visage, aucun lieu reconnaissable.
  discretion: [
    ['capital-risque', 1],
    ['mezzanine-capital', 2],
    ['capital-risque', 10],
    ['mezzanine-capital', 4],
    ['capital-risque', 7],
    ['mezzanine-capital', 3],
  ],
}

function trouver([dossier, numero]: Pioche): ImageFiche | null {
  return IMAGES_FICHES[dossier]?.find((i) => i.fichier === `${dossier}-${numero}.webp`) ?? null
}

/** L'image d'ouverture d'une page, quand la configuration en prévoit une. */
export function heroDePage(slug: string): (ImageFiche & { alt: Record<Locale, string> }) | null {
  const hero = HEROS_PAGES[slug]
  if (!hero) return null
  const image = IMAGES_FICHES[hero.dossier]?.find((i) => i.fichier === hero.fichier)
  return image ? { ...image, alt: hero.alt } : null
}

/** La vignette d'un domaine sur le sommaire Finance. */
export function vignetteFinance(slug: string): ImageFiche | null {
  const pioche = VIGNETTES_FINANCE[slug]
  return pioche ? trouver(pioche) : null
}

/**
 * Les images à répartir dans le corps d'une page.
 *
 * Pour une fiche Finance, tout son dossier moins son ouverture et moins sa vignette de
 * sommaire : sur un site de cette taille, une photographie vue deux fois se remarque. Pour une
 * page composée, la liste choisie ci-dessus.
 */
export function imagesDeCorps(slug: string): ImageFiche[] {
  const propre = IMAGES_FICHES[slug]
  if (propre) {
    const deja = new Set(
      [HEROS_PAGES[slug]?.fichier, vignetteFinance(slug)?.fichier].filter(Boolean),
    )
    return propre.filter((i) => !deja.has(i.fichier) && !estRetiree(i.fichier))
  }
  return (CORPS_PAGES[slug] ?? [])
    .map(trouver)
    .filter((i): i is ImageFiche => i !== null && !estRetiree(i.fichier))
}
