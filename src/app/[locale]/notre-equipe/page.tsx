import type { Metadata } from 'next'

import image from '@/assets/images/equipe.webp'
import { getBrand } from '@/brand/resolve'
import { ContentPage, contentMetadata } from '@/components/ContentPage'
import { EquipeGrid } from '@/components/EquipeGrid'
import { BandeauImage } from '@/components/media/ParallaxeMedia'
import { RelatedLinks } from '@/components/RelatedLinks'
import { imagesDeCorps } from '@/config/images-pages'
import { pathnameForLocale } from '@/i18n/locales'
import { getLocale } from '@/i18n/server'
import { UI } from '@/i18n/ui'

export function generateMetadata(): Promise<Metadata> {
  return contentMetadata('notre-equipe')
}

const BANDEAU = imagesDeCorps('notre-equipe')[0] ?? null

/**
 * La grille des partenaires est revenue, remplie.
 *
 * La fiche `.odt` ne livrait que des blocs `[Prénom Nom] / [Fonction] / [Adresse e-mail]` non
 * remplis, et la grille avait été retirée faute de données. Le client a fourni les sept personnes
 * le 23 août 2026 (`content-source/TEAM NAME.odt`) : elles vivent dans `src/config/equipe.ts` et
 * sont rendues par `EquipeGrid`, sans photographie — il n'en a pas fourni.
 *
 * Le générateur de contenu retire toujours la section « Nos Partenaires » de la fiche : ses trois
 * placeholders sont remplacés par la grille, qui en compte sept et les groupe autrement.
 */
export default async function NotreEquipePage() {
  const brand = await getBrand()
  const locale = await getLocale()
  const t = UI[locale]

  return (
    <>
      <ContentPage
        slug="notre-equipe"
        image={image}
        imageAlt={t.alt.notreEquipe}
      />

      <EquipeGrid brand={brand} locale={locale} />

      {/* Un seul bandeau ferme la page : une suite de photographies sans texte en face ne serait
          qu'un paquet d'images. */}
      {BANDEAU ? <BandeauImage image={BANDEAU} hauteur="moyenne" /> : null}

      <RelatedLinks
        title={t.renvois.poursuivre}
        locale={locale}
        slugs={[
          { slug: 'a-propos', href: pathnameForLocale('/a-propos', locale) },
          { slug: 'discretion', href: pathnameForLocale('/discretion', locale) },
          { slug: 'services', href: pathnameForLocale('/services', locale) },
        ]}
      />
    </>
  )
}
