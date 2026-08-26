import type { Metadata } from 'next'

import { ContentPage, contentMetadata } from '@/components/ContentPage'

export function generateMetadata(): Promise<Metadata> {
  return contentMetadata('mentions-legales')
}

export default function MentionsLegalesPage() {
  // Le client n'a pas terminé ce document par un bloc d'identité, contrairement à l'Impressum
  // et à la politique de confidentialité : la mention d'éditeur est ajoutée ici.
  return <ContentPage slug="mentions-legales" compact editeur />
}
