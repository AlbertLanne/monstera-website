import type { Metadata } from 'next'

import image from '@/assets/images/actifs-numeriques.webp'
import { ContentPage, contentMetadata } from '@/components/ContentPage'
import { getLocale } from '@/i18n/server'
import { UI } from '@/i18n/ui'

export function generateMetadata(): Promise<Metadata> {
  return contentMetadata('actifs-numeriques')
}

/**
 * Entrée de 1er niveau, hors du sommaire Finance.
 *
 * La fiche est un domaine d'investissement comme les dix du menu Finance, mais le client la
 * traite à part et elle porte son propre avertissement : elle a sa place dans la barre
 * principale, pas dans un sous-menu. Le slug reste français comme partout ailleurs sur le
 * site — seul le libellé du menu, « Digital Assets », suit le titre que le client donne à ses
 * trois documents.
 */
export default async function ActifsNumeriquesPage() {
  const locale = await getLocale()

  return (
    <ContentPage
      slug="actifs-numeriques"
      image={image}
      imageAlt={UI[locale].alt.actifsNumeriques}
    />
  )
}
