import { resolveBrandText, type Brand } from '@/brand/brands'
import { BlockRenderer, type Tone } from '@/components/blocks/BlockRenderer'
import { EditeurDuSite } from '@/components/EditeurDuSite'
import { planifierImages, type RangeeImage } from '@/components/media/plan-images'
import { RangeeAlternee, type Cote } from '@/components/media/RangeeAlternee'
import { Container } from '@/components/ui/Container'
import type { ImageFiche } from '@/content/fiche-images'
import { pathnameForLocale, type Locale } from '@/i18n/locales'
import type { Block, PageContent, Section } from '@/content/types'

/**
 * Compare deux titres en ignorant casse et accents.
 *
 * Le client écrit « Notre Équipe » en intertitre et « Notre équipe » en titre : une comparaison
 * stricte laisserait le même titre s'afficher deux fois.
 */
function sameHeading(a: string | null, b: string | null) {
  const norm = (value: string | null) =>
    (value ?? '')
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase()
      .trim()
  return norm(a) === norm(b)
}

/** Blocs qui portent une structure dense : ils justifient un fond teinté. */
const DENSE: Block['type'][] = ['items', 'steps', 'bullets']

/** Un bloc pleine largeur mérite la largeur de page ; le texte courant reste en colonne. */
const WIDE: Block['type'][] = ['items', 'steps', 'legalIdentity']

function isDense(section: Section) {
  return section.blocks.some((block) => DENSE.includes(block.type))
}

function hasButton(section: Section) {
  return section.blocks.some((block) => block.type === 'button')
}

/**
 * Décide du fond de chaque section.
 *
 * La dernière section porteuse d'un appel à l'action devient un bandeau à contraste inversé :
 * c'est le seul endroit de la page où le regard doit être forcé. Les sections denses
 * (grilles de critères, processus numérotés) reçoivent un fond teinté qui les encadre.
 */
function planTones(sections: Section[]): Tone[] {
  const lastCta = sections.reduce((found, section, index) => (hasButton(section) ? index : found), -1)
  return sections.map((section, index) => (index === lastCta ? 'band' : 'page'))
}

function sectionBackground(section: Section, tone: Tone) {
  if (tone === 'band') return 'bg-band text-band-text'
  return isDense(section) ? 'bg-page-alt' : 'bg-page'
}

function SectionHeading({
  title,
  tone,
  brand,
  etroit = false,
  cote,
}: {
  title: string
  tone: Tone
  brand: Brand
  /** Dans une rangée, le titre dispose d'une demi-page : il descend d'un cran dans l'échelle. */
  etroit?: boolean
  /** Côté d'entrée, quand la section est pleine largeur. Voir `PageBody`. */
  cote?: Cote
}) {
  return (
    <div data-reveal {...(cote ? { 'data-reveal-from': cote } : {})} className="mb-8 flex flex-col gap-5 sm:mb-10">
      <span
        aria-hidden="true"
        className={`h-px w-14 ${tone === 'band' ? 'bg-band-accent' : 'bg-accent'}`}
      />
      <h2
        className={`max-w-[36ch] leading-[1.2] ${
          etroit ? 'text-[1.625rem] sm:text-[1.875rem]' : 'text-[1.75rem] sm:text-[2.125rem]'
        } ${tone === 'band' ? 'text-band-text' : 'text-text-strong'}`}
      >
        {resolveBrandText(title, brand)}
      </h2>
    </div>
  )
}

function SectionBlocks({
  section,
  brand,
  tone,
  ctaHref,
  locale,
  cote,
}: {
  section: Section
  brand: Brand
  tone: Tone
  ctaHref: string
  locale: Locale
  /** Côté d'entrée, quand la section est pleine largeur. Voir `PageBody`. */
  cote?: Cote
}) {
  return (
    <div className="space-y-8">
      {section.blocks.map((block, index) => (
        <div
          key={index}
          data-reveal
          {...(cote ? { 'data-reveal-from': cote } : {})}
          data-reveal-delay={Math.min(index, 3)}
          className={WIDE.includes(block.type) ? '' : 'max-w-(--container-prose)'}
        >
          <BlockRenderer block={block} brand={brand} locale={locale} tone={tone} ctaHref={ctaHref} />
        </div>
      ))}
    </div>
  )
}

/**
 * Rend les sections d'une fiche en colonne continue.
 *
 * Les pages juridiques enchaînent une quinzaine de sections de deux paragraphes : leur donner
 * chacune l'espacement d'une section éditoriale étirerait la page sans rien apporter.
 */
function CompactBody({
  page,
  brand,
  ctaHref,
  locale,
  editeur = false,
}: {
  page: PageContent
  brand: Brand
  ctaHref: string
  locale: Locale
  /** Ajoute la mention d'éditeur en fin de colonne. Voir `PageBody`. */
  editeur?: boolean
}) {
  return (
    <section className="bg-page py-16 sm:py-20">
      <Container width="prose">
        <div className="space-y-12">
          {page.sections.map((section, index) => (
            <div key={index} data-reveal className="space-y-5">
              {section.title && !sameHeading(section.title, page.title) ? (
                <h2 className="text-[1.25rem] leading-snug sm:text-[1.375rem]">
                  {resolveBrandText(section.title, brand)}
                </h2>
              ) : null}
              {section.blocks.map((block, blockIndex) => (
                <BlockRenderer
                  locale={locale}
                  key={blockIndex}
                  block={block}
                  brand={brand}
                  tone="page"
                  ctaHref={ctaHref}
                />
              ))}
            </div>
          ))}
          {editeur ? (
            <div data-reveal className="border-t border-line pt-12">
              <EditeurDuSite brand={brand} locale={locale} />
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  )
}

/**
 * Une section peut-elle se mettre en rangée à côté d'une photographie ?
 *
 * Non pour le bandeau d'appel à l'action, qui tient toute la largeur par construction, et non
 * pour les sections denses — une grille de critères ou un processus numéroté repliés dans une
 * demi-page deviennent illisibles. Le texte courant, lui, s'accommode très bien d'une colonne.
 */
/**
 * Le côté par lequel entre une section **sans photographie**.
 *
 * Les sections illustrées n'ont pas besoin de ce plan : `RangeeAlternee` fait déjà entrer leur
 * texte du côté opposé à leur image, et cette direction-là veut dire quelque chose. Restent les
 * sections pleine largeur — grilles de critères, processus numérotés, bandeau final — qui
 * n'entraient que par le bas, alors qu'elles sont souvent les plus longues de la page.
 *
 * Elles alternent donc à leur tour, **en poursuivant le compte des rangées plutôt qu'en repartant
 * de zéro**. Une section pleine largeur coincée entre deux rangées venues de la gauche doit venir
 * de la droite, sinon trois blocs de suite arrivent du même bord et le rythme se casse — c'est
 * exactement ce que `plan-images.ts` évite déjà entre deux rangées voisines.
 */
function planifierCotes(sections: Section[], rangees: Map<number, RangeeImage>): Map<number, Cote> {
  const plan = new Map<number, Cote>()
  // Côté d'entrée du dernier texte posé, rangée comprise. Initialisé à droite pour que la
  // première section pleine largeur d'une page sans rangée entre par la gauche, dans le sens de
  // lecture.
  let precedent: Cote = 'droite'

  for (const index of sections.keys()) {
    const rangee = rangees.get(index)
    if (rangee) {
      // `rangee.cote` est le côté de la **photographie** ; le texte entre par l'autre bord.
      precedent = rangee.cote === 'droite' ? 'gauche' : 'droite'
      continue
    }
    const cote: Cote = precedent === 'gauche' ? 'droite' : 'gauche'
    plan.set(index, cote)
    precedent = cote
  }

  return plan
}

function peutPorterUneImage(section: Section, tone: Tone) {
  return tone !== 'band' && !section.blocks.some((block) => WIDE.includes(block.type))
}

/**
 * Rend une fiche de contenu client en sections mises en page.
 *
 * Chaque section illustrable devient une rangée « paragraphe d'un côté, photographie de
 * l'autre », les côtés alternant d'une rangée à la suivante. Les sections denses et le bandeau
 * final gardent la pleine largeur : elles en ont besoin, et elles font respirer l'alternance.
 *
 * Un intertitre identique au titre de la page est ignoré : le cas se présente sur la fiche
 * Notre Équipe, dont le .odt ouvre sur un H2 homonyme.
 */
export function PageBody({
  page,
  brand,
  locale,
  ctaHref,
  compact = false,
  editeur = false,
  images = [],
}: {
  page: PageContent
  brand: Brand
  locale: Locale
  /** Par défaut la page Contact de la langue courante. */
  ctaHref?: string
  /** Colonne continue plutôt que sections pleine largeur. Pour les pages juridiques. */
  compact?: boolean
  /**
   * Ferme la page sur la mention d'éditeur.
   *
   * Réservé aux pages légales que le client n'a pas terminées par un bloc d'identité — les autres
   * le portent déjà dans leur contenu, l'ajouter ici l'afficherait deux fois.
   */
  editeur?: boolean
  /** Images à répartir entre les sections. Voir `plan-images.ts`. */
  images?: ImageFiche[]
}) {
  const cible = ctaHref ?? pathnameForLocale('/contact', locale)

  if (compact)
    return (
      <CompactBody page={page} brand={brand} locale={locale} ctaHref={cible} editeur={editeur} />
    )

  const sections = page.sections
  const tones = planTones(sections)
  const rangees = planifierImages(
    sections.map((section, index) => peutPorterUneImage(section, tones[index])),
    images,
  )
  const cotesPleineLargeur = planifierCotes(sections, rangees)

  return (
    <>
      {sections.map((section, index) => {
        const tone = tones[index]
        const skipTitle = section.title !== null && sameHeading(section.title, page.title)
        const rangee = rangees.get(index)
        // Une section illustrée n'en reçoit pas : sa rangée porte déjà l'entrée latérale, du côté
        // opposé à sa photographie. En donner une seconde aux blocs les ferait entrer deux fois.
        const cote = rangee ? undefined : cotesPleineLargeur.get(index)
        const titre =
          section.title && !skipTitle ? (
            <SectionHeading
              title={section.title}
              tone={tone}
              brand={brand}
              etroit={Boolean(rangee)}
              cote={cote}
            />
          ) : null
        const blocs = (
          <SectionBlocks
            section={section}
            brand={brand}
            locale={locale}
            tone={tone}
            ctaHref={cible}
            cote={cote}
          />
        )

        if (rangee) {
          return (
            <section key={index} className={sectionBackground(section, tone)}>
              <RangeeAlternee image={rangee.image} cote={rangee.cote}>
                {titre}
                {blocs}
              </RangeeAlternee>
            </section>
          )
        }

        return (
          <section
            key={index}
            className={`py-16 sm:py-20 lg:py-(--spacing-section) ${sectionBackground(section, tone)}`}
          >
            <Container>
              {titre}
              {blocs}
            </Container>
          </section>
        )
      })}
    </>
  )
}
