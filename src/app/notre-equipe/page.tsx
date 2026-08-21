import type { Metadata } from 'next'

import image from '@/assets/images/equipe.webp'
import { ContentPage, contentMetadata } from '@/components/ContentPage'
import { BandeauImage } from '@/components/media/ParallaxeMedia'
import { RelatedLinks } from '@/components/RelatedLinks'
import { imagesDeCorps } from '@/config/images-pages'

export function generateMetadata(): Promise<Metadata> {
  return contentMetadata('notre-equipe')
}

const BANDEAU = imagesDeCorps('notre-equipe')[0] ?? null

/**
 * La grille des partenaires a été retirée du contenu généré.
 *
 * Le client n'a livré que des blocs `[Prénom Nom] / [Fonction] / [Adresse e-mail]` non remplis, et
 * la fiche À propos parle de cinq partenaires là où la fiche Équipe n'en prévoyait que trois. La
 * fiche se réduisant à son introduction, la page est close par des renvois — construits depuis la
 * navigation, sans texte ajouté — plutôt que par un bloc rédigé de toutes pièces.
 */
export default function NotreEquipePage() {
  return (
    <>
      <ContentPage
        slug="notre-equipe"
        eyebrow="Notre équipe"
        image={image}
        imageAlt="Escalier en marbre d’un intérieur institutionnel élégant"
      />
      {/* La fiche n'a plus de section depuis le retrait de la grille des partenaires : aucune
          rangée texte–image n'est possible ici. Un seul bandeau ferme la page — une suite de
          photographies sans texte en face ne serait qu'un paquet d'images. */}
      {BANDEAU ? <BandeauImage image={BANDEAU} hauteur="moyenne" /> : null}

      <RelatedLinks
        title="Poursuivre"
        slugs={[
          { slug: 'a-propos', href: '/a-propos' },
          { slug: 'discretion', href: '/discretion' },
          { slug: 'services', href: '/services' },
        ]}
      />
    </>
  )
}
