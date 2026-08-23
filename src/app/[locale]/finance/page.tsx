import type { Metadata } from 'next'

import image from '@/assets/images/finance.webp'
import { resolveBrandText, type Brand } from '@/brand/brands'
import { getBrand } from '@/brand/resolve'
import { PageBody } from '@/components/PageBody'
import { PageHero } from '@/components/PageHero'
import { RangeeAlternee } from '@/components/media/RangeeAlternee'
import { imagesDeCorps, vignetteFinance } from '@/config/images-pages'
import { financeLinks } from '@/config/navigation'
import { getPage } from '@/content'
import type { PageContent } from '@/content/types'
import { getLocale } from '@/i18n/server'
import { UI } from '@/i18n/ui'

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getBrand()
  const locale = await getLocale()
  const page = getPage(locale, 'finance')
  return {
    title: page.menu,
    description: resolveBrandText(UI[locale].finance.description, brand),
  }
}

/**
 * La première phrase de la fiche.
 *
 * Le chapeau (`lead`) est vide sur la plupart des dix fiches — le client y ouvre directement par
 * un intertitre. On reprend alors le premier paragraphe de la première section, qui suit
 * immédiatement l'accroche : c'est le même texte, dans le même ordre, sans rien ajouter.
 */
function premierParagraphe(page: PageContent): string | null {
  if (page.lead[0]) return page.lead[0]
  const bloc = page.sections[0]?.blocks.find((b) => b.type === 'prose')
  return bloc?.paragraphs[0] ?? null
}

/**
 * Le pôle Finance : la fiche du client, et le sommaire de ses dix domaines.
 *
 * Le client a livré la fiche « Financement » le 23 août 2026, dans les trois langues — elle
 * n'existait pas jusque-là et cette page était tenue par un texte que nous avions rédigé. Ce
 * texte a été retiré : la page ouvre désormais sur la fiche du client et se ferme sur son propre
 * appel à l'action, comme les dix fiches sectorielles.
 *
 * Le sommaire s'intercale entre l'ouverture et le corps : c'est ce que le visiteur vient chercher
 * ici, et le laisser en bas de neuf sections de texte l'aurait rendu invisible. Chaque domaine
 * reprend le sous-titre et la première phrase de sa propre fiche, sans texte ajouté. L'ordre est
 * celui du sous-menu, par priorité commerciale décroissante — c'est ce que la numérotation donne
 * à lire.
 */
export default async function FinancePage() {
  const brand = await getBrand()
  const locale = await getLocale()
  const t = UI[locale]
  const page = getPage(locale, 'finance')

  const domains = financeLinks(locale).map((link) => {
    const fiche = getPage(locale, link.content!)
    return {
      href: link.href,
      label: link.label,
      /** Le premier intertitre de la fiche fait office d'accroche. */
      claim: fiche.sections[0]?.title ?? null,
      summary: premierParagraphe(fiche),
      vignette: vignetteFinance(link.content!),
    }
  })

  return (
    <>
      <PageHero
        eyebrow={t.finance.eyebrow}
        title={page.title ?? page.menu}
        lead={page.lead}
        brand={brand}
        image={image}
        imageAlt={t.alt.finance}
      />

      <ol className="bg-page">
        {domains.map((domain, index) =>
          domain.vignette ? (
            <li key={domain.href} className="border-t border-line">
              <RangeeAlternee
                image={domain.vignette}
                cote={index % 2 === 0 ? 'droite' : 'gauche'}
                href={domain.href}
                densite="compacte"
              >
                <DomaineTexte
                  domain={domain}
                  numero={index + 1}
                  brand={brand}
                  decouvrir={t.finance.decouvrir}
                />
              </RangeeAlternee>
            </li>
          ) : null,
        )}
      </ol>

      <PageBody page={page} brand={brand} locale={locale} images={imagesDeCorps('finance')} />
    </>
  )
}

type Domaine = {
  label: string
  claim: string | null
  summary: string | null
}

/** Le contenu d'une rangée du sommaire. Le titre est un `h2` : la page est une liste de domaines. */
function DomaineTexte({
  domain,
  numero,
  brand,
  decouvrir,
}: {
  domain: Domaine
  numero: number
  brand: Brand
  decouvrir: string
}) {
  return (
    <div className="flex flex-col gap-4">
      <span className="font-(family-name:--font-display) text-[0.875rem] tabular-nums text-accent-contrast">
        {String(numero).padStart(2, '0')}
      </span>
      <h2 className="font-(family-name:--font-display) text-[1.625rem] leading-[1.2] text-text-strong sm:text-[1.875rem]">
        {domain.label}
      </h2>
      {domain.claim ? (
        <p className="max-w-[42ch] text-[1.0625rem] leading-snug text-text">
          {resolveBrandText(domain.claim, brand)}
        </p>
      ) : null}
      {domain.summary ? (
        <p className="line-clamp-3 text-[0.9375rem] leading-[1.7] text-text-muted">
          {resolveBrandText(domain.summary, brand)}
        </p>
      ) : null}
      <span
        aria-hidden="true"
        className="mt-2 inline-flex items-center gap-3 text-[0.8125rem] text-text-muted transition-colors duration-200 group-hover:text-accent-contrast"
      >
        {decouvrir}
        <span className="h-px w-8 bg-current transition-all duration-300 ease-(--ease-out-quart) group-hover:w-14" />
      </span>
    </div>
  )
}
