import type { StaticImageData } from 'next/image'
import type { Metadata } from 'next'

import { resolveBrandText } from '@/brand/brands'
import { getBrand } from '@/brand/resolve'
import { PageBody } from '@/components/PageBody'
import { PageHero } from '@/components/PageHero'
import { heroDePage, imagesDeCorps } from '@/config/images-pages'
import { getPage, type PageSlug } from '@/content'
import { getLocale } from '@/i18n/server'

export type ContentPageProps = {
  slug: PageSlug
  /** Par défaut, le libellé de menu de la fiche — déjà traduit par le client. */
  eyebrow?: string
  image?: StaticImageData
  imageAlt?: string
  /** Destination des appels à l'action de la fiche. */
  ctaHref?: string
  /** Colonne continue plutôt que sections pleine largeur. Pour les pages juridiques. */
  compact?: boolean
  /** Ferme la page sur la mention d'éditeur du site. Voir `PageBody`. */
  editeur?: boolean
}

/**
 * Rend une fiche client complète : ouverture puis sections.
 *
 * Les 19 fiches livrées en .odt partagent la même structure — titre, chapeau, sections,
 * appel à l'action, avertissement — ce qui permet de n'avoir qu'un seul gabarit.
 *
 * Les images viennent du lot livré pour ce slug quand il en existe un, et l'appelant n'a rien à
 * passer : les dix fiches Finance ont leur dossier d'images, les autres pages fournissent leur
 * propre `image` d'ouverture. Une `image` passée explicitement l'emporte sur le lot.
 */
export async function ContentPage({
  slug,
  eyebrow,
  image,
  imageAlt,
  ctaHref,
  compact,
  editeur,
}: ContentPageProps) {
  const brand = await getBrand()
  const locale = await getLocale()
  const page = getPage(locale, slug)

  // Une image passée par la page l'emporte sur celle du registre : les six photographies
  // livrées à l'origine par le client gardent leur page d'ouverture.
  const hero = heroDePage(slug)
  const corps = imagesDeCorps(slug)

  return (
    <>
      <PageHero
        eyebrow={eyebrow ?? page.menu}
        title={page.title ?? page.menu}
        lead={page.lead}
        brand={brand}
        image={image ?? hero?.src}
        imageAlt={image ? imageAlt : (hero?.alt[locale] ?? '')}
      />
      <PageBody
        page={page}
        brand={brand}
        locale={locale}
        ctaHref={ctaHref}
        compact={compact}
        editeur={editeur}
        images={corps}
      />
    </>
  )
}

/** Balise title et description d'une fiche, avec la raison sociale de l'entité active. */
export async function contentMetadata(slug: PageSlug): Promise<Metadata> {
  const brand = await getBrand()
  const locale = await getLocale()
  const page = getPage(locale, slug)
  const description = page.lead[0] ?? page.title ?? undefined

  return {
    title: page.menu,
    description: description ? resolveBrandText(description, brand).slice(0, 300) : undefined,
  }
}
