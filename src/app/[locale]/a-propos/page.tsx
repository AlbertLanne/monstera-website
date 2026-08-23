import type { Metadata } from 'next'

import image from '@/assets/images/a-propos.webp'
import { ContentPage, contentMetadata } from '@/components/ContentPage'
import { getLocale } from '@/i18n/server'
import { UI } from '@/i18n/ui'

export function generateMetadata(): Promise<Metadata> {
  return contentMetadata('a-propos')
}

export default async function AProposPage() {
  const locale = await getLocale()

  return (
    <ContentPage
      slug="a-propos"
      image={image}
      imageAlt={UI[locale].alt.aPropos}
    />
  )
}
