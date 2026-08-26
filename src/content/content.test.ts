import { describe, expect, it } from 'vitest'

import { financeLinks, legalNav, mainNav } from '@/config/navigation'
import { LOCALES, pathnameForLocale, type Locale } from '@/i18n/locales'

import { CONTENT } from './index'
import type { PageContent } from './types'

/**
 * Le contenu est généré depuis les .odt du client, dans les trois langues. Ces tests protègent
 * les invariants que la génération doit préserver, et signalent les régressions de contenu
 * qu'aucun type ne peut voir.
 *
 * Chaque bloc est rejoué pour les trois langues : une fiche allemande vide ou un placeholder
 * resté dans la version anglaise échoue au même titre que son équivalent français.
 */

/** Toutes les chaînes d'une fiche, y compris les intitulés de listes et d'étapes. */
function allStrings(page: PageContent): string[] {
  const out: string[] = [page.title ?? '', ...page.lead]
  for (const section of page.sections) {
    if (section.title) out.push(section.title)
    for (const block of section.blocks) {
      switch (block.type) {
        case 'prose':
        case 'disclaimer':
          out.push(...block.paragraphs)
          break
        case 'items':
        case 'definitions':
        case 'steps':
          out.push(...block.items.flatMap((item) => [item.label, item.text]))
          break
        case 'bullets':
          out.push(...block.items)
          break
        case 'quote':
          out.push(block.text)
          break
        case 'button':
          out.push(block.label)
          break
      }
    }
  }
  return out.filter(Boolean)
}

describe.each(LOCALES)('intégrité des fiches — %s', (locale: Locale) => {
  const pages = CONTENT[locale]
  const allPages = Object.values(pages) as PageContent[]

  // Vingt fiches à la livraison initiale, plus Digital Assets reçue le 26 août 2026.
  it('couvre les vingt et une fiches livrées par le client', () => {
    expect(allPages).toHaveLength(21)
  })

  it('donne un titre et du contenu à chaque fiche', () => {
    for (const page of allPages) {
      expect(page.title, page.slug).toBeTruthy()
      // La fiche Notre Équipe se réduit à son chapeau : sa grille de placeholders a été retirée,
      // les vraies personnes venant de `src/config/equipe.ts`.
      expect(page.lead.length + page.sections.length, page.slug).toBeGreaterThan(0)
    }
  })

  it('donne un libellé de menu à chaque fiche', () => {
    for (const page of allPages) {
      expect(page.menu, page.slug).toBeTruthy()
    }
  })

  it('n’écrit jamais la raison sociale en dur', () => {
    // Une occurrence en dur produirait une mention fausse sur l'autre domaine.
    for (const page of allPages) {
      for (const text of allStrings(page)) {
        expect(text, `${page.slug} : « ${text.slice(0, 70)}… »`).not.toMatch(
          /Argentum\s+(Investments|Advisors)/,
        )
      }
    }
  })

  it('ne laisse aucun placeholder du document source', () => {
    // Le client a livré des « [Insérer …] », « [Prénom Nom] », « [Insert …] », « [Vorname … ] »
    // qui ne doivent pas être publiés.
    for (const page of allPages) {
      for (const text of allStrings(page)) {
        expect(text, `${page.slug} : « ${text.slice(0, 70)}… »`).not.toMatch(
          /\[(Insérer|Prénom|Fonction|Adresse|Mois|Insert|First Name|Position|Email|Vorname|E-Mail|Telefon|Position)/,
        )
      }
    }
  })

  it('a retiré la grille des partenaires, remplacée par les vraies personnes', () => {
    const equipe = pages['notre-equipe']
    expect(equipe.lead.length).toBeGreaterThan(0)
    expect(
      equipe.sections.flatMap((s) => s.blocks).filter((b) => b.type === 'items'),
    ).toHaveLength(0)
  })

  it('rend l’identité légale depuis la config sur les pages qui la portent', () => {
    for (const slug of ['impressum', 'politique-de-confidentialite'] as const) {
      const blocks = pages[slug].sections.flatMap((section) => section.blocks)
      expect(
        blocks.some((block) => block.type === 'legalIdentity'),
        `${locale}/${slug}`,
      ).toBe(true)
    }
  })
})

describe('fiche Mezzanine, traduite à la main en français', () => {
  it('ne laisse aucune trace de la version anglaise livrée dans le lot français', () => {
    const mezzanine = allStrings(CONTENT.fr['mezzanine-capital']).join(' ')
    for (const marker of ['Flexible Capital', 'from EUR', 'SUBMIT YOUR', 'What Matters']) {
      expect(mezzanine).not.toContain(marker)
    }
    expect(mezzanine).toContain('millions d’euros')
  })
})

describe('parallélisme des trois langues', () => {
  it('expose exactement les mêmes slugs', () => {
    const reference = Object.keys(CONTENT.fr).sort()
    for (const locale of LOCALES) {
      expect(Object.keys(CONTENT[locale]).sort(), locale).toEqual(reference)
    }
  })

  it('donne à chaque langue ses propres libellés de menu', () => {
    // Un libellé identique dans les trois langues signalerait une fiche non traduite. Quelques-uns
    // le sont légitimement — « Crowdfunding », « Private Equity », « Mezzanine Capital » — mais
    // pas la majorité.
    const slugs = Object.keys(CONTENT.fr) as (keyof typeof CONTENT.fr)[]
    const identiques = slugs.filter(
      (slug) => CONTENT.fr[slug].menu === CONTENT.de[slug].menu,
    )
    expect(identiques.length).toBeLessThan(slugs.length / 2)
  })
})

describe.each(LOCALES)('cohérence de la navigation — %s', (locale: Locale) => {
  const pages = CONTENT[locale]
  const nav = mainNav(locale)
  const legal = legalNav(locale)
  const finance = financeLinks(locale)

  it('associe chaque entrée de menu à une fiche existante', () => {
    const links = [...nav, ...nav.flatMap((l) => l.children ?? []), ...legal]
    for (const link of links) {
      if (!link.content) continue
      expect(pages[link.content], `${link.label} -> ${link.content}`).toBeDefined()
    }
  })

  it('expose les dix domaines Finance, chacun avec sa fiche', () => {
    expect(finance).toHaveLength(10)
    for (const link of finance) {
      expect(link.content, link.label).toBeDefined()
      expect(pages[link.content!], link.label).toBeDefined()
    }
  })

  it('place Crowdfunding en dernier et le financement immobilier en premier', () => {
    // Arbitrage documenté : la fiche Crowdfunding dit elle-même que la levée de fonds publique
    // n'est pas au cœur de l'approche.
    expect(finance[0].content).toBe('financement-immobilier')
    expect(finance.at(-1)!.content).toBe('crowdfunding')
  })

  it('ne propose aucune URL en double', () => {
    const hrefs = [...nav, ...nav.flatMap((l) => l.children ?? []), ...legal].map((l) => l.href)
    expect(new Set(hrefs).size).toBe(hrefs.length)
  })

  it('préfixe les URL de la langue, sauf en français', () => {
    for (const link of nav) {
      if (locale === 'fr') {
        expect(link.href.startsWith('/en') || link.href.startsWith('/de')).toBe(false)
      } else {
        expect(link.href, link.label).toMatch(new RegExp(`^/${locale}(/|$)`))
      }
    }
  })
})

describe('schéma d’URL', () => {
  it('laisse le français à la racine et préfixe les autres', () => {
    expect(pathnameForLocale('/contact', 'fr')).toBe('/contact')
    expect(pathnameForLocale('/contact', 'en')).toBe('/en/contact')
    expect(pathnameForLocale('/contact', 'de')).toBe('/de/contact')
  })

  it('traite l’accueil sans produire de barre finale', () => {
    expect(pathnameForLocale('/', 'fr')).toBe('/')
    expect(pathnameForLocale('/', 'en')).toBe('/en')
  })

  it('change de langue sans empiler les préfixes', () => {
    expect(pathnameForLocale('/en/contact', 'de')).toBe('/de/contact')
    expect(pathnameForLocale('/de/contact', 'fr')).toBe('/contact')
    expect(pathnameForLocale('/en', 'fr')).toBe('/')
  })
})
