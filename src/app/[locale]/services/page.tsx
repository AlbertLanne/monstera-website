import type { Metadata } from 'next'

import image from '@/assets/images/services.webp'
import { ContentPage, contentMetadata } from '@/components/ContentPage'
import { getLocale } from '@/i18n/server'
import { UI } from '@/i18n/ui'

export function generateMetadata(): Promise<Metadata> {
  return contentMetadata('services')
}

export default async function ServicesPage() {
  const locale = await getLocale()

  return (
    <ContentPage
      slug="services"
      image={image}
      imageAlt={UI[locale].alt.services}
    />
  )
}
