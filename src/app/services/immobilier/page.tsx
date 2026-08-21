import type { Metadata } from 'next'

import image from '@/assets/images/immobilier.webp'
import { ContentPage, contentMetadata } from '@/components/ContentPage'

export function generateMetadata(): Promise<Metadata> {
  return contentMetadata('services-immobilier')
}

export default function ServicesImmobilierPage() {
  return (
    <ContentPage
      slug="services-immobilier"
      eyebrow="Services · Immobilier"
      image={image}
      imageAlt="Façade d’une villa de prestige à Genève"
    />
  )
}
