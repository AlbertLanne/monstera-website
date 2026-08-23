import type { Metadata } from 'next'

import image from '@/assets/images/immobilier.webp'
import { ContentPage, contentMetadata } from '@/components/ContentPage'
import { getLocale } from '@/i18n/server'
import { UI } from '@/i18n/ui'

export function generateMetadata(): Promise<Metadata> {
  return contentMetadata('services-immobilier')
}

export default async function ServicesImmobilierPage() {
  const locale = await getLocale()

  return (
    <ContentPage
      slug="services-immobilier"
      image={image}
      imageAlt={UI[locale].alt.servicesImmobilier}
    />
  )
}
