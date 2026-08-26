import type { Metadata } from 'next'

import { resolveBrandText } from '@/brand/brands'
import { getBrand } from '@/brand/resolve'
import { HeroVideo } from '@/components/HeroVideo'
import { PageBody } from '@/components/PageBody'
import { TwoEntities } from '@/components/TwoEntities'
import { Button } from '@/components/ui/Button'
import { TitreAnime } from '@/components/media/TitreAnime'
import { Container } from '@/components/ui/Container'
import { imagesDeCorps } from '@/config/images-pages'
import { getPage } from '@/content'
import { pathnameForLocale } from '@/i18n/locales'
import { getLocale } from '@/i18n/server'
import { UI } from '@/i18n/ui'

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getBrand()
  const locale = await getLocale()
  const page = getPage(locale, 'accueil')
  return {
    // L'accueil porte la raison sociale seule, sans le gabarit « %s — … ».
    title: { absolute: `${brand.legalName} — ${UI[locale].accueil.titreMeta}` },
    description: resolveBrandText(page.lead[0] ?? brand.tagline[locale], brand).slice(0, 300),
  }
}

/**
 * Les trois repères chiffrés sont tirés du contenu client, non inventés : le seuil de 1,5 M€ et
 * les délais d'évaluation figurent dans Acceuil.odt et Services.odt, les sept années
 * d'expérience dans Acceuil.odt. Leurs libellés vivent dans `src/i18n/ui.ts`, traduits.
 */
export default async function HomePage() {
  const brand = await getBrand()
  const locale = await getLocale()
  const t = UI[locale]
  const page = getPage(locale, 'accueil')

  return (
    <>
      <section className="relative isolate flex min-h-[38rem] items-end overflow-hidden sm:min-h-[44rem] lg:min-h-[calc(100dvh-2rem)]">
        <HeroVideo />

        <Container className="relative pt-[calc(var(--header-h)+5rem)] pb-20 sm:pb-28">
          {/* Comme sur `PageHero` : surtitre, titre, chapeau et boutons entrent séparément, par
              la gauche et en cascade. L'accueil garde sa vidéo — pas de shader ici, le mouvement
              du plan fait déjà le travail que le shader fait sur une photographie fixe. */}
          <div className="flex flex-col gap-7">
            <div data-reveal data-reveal-from="gauche" className="flex items-center gap-4">
              <span aria-hidden="true" className="h-px w-14 bg-white/70" />
              <span className="text-[0.6875rem] uppercase tracking-[0.16em] text-white/80">
                {t.accueil.lieu}
              </span>
            </div>

            <TitreAnime
              as="h1"
              texte={resolveBrandText(page.title ?? brand.legalName, brand)}
              className="max-w-[24ch] text-[2.125rem] leading-[1.1] text-white sm:text-[3.25rem] sm:leading-[1.08] lg:text-[4.25rem]"
            />

            <div
              data-reveal
              data-reveal-from="gauche"
              data-reveal-delay="2"
              className="max-w-(--container-prose) space-y-4"
            >
              {page.lead.map((paragraph, index) => (
                <p key={index} className="text-[1.0625rem] leading-[1.75] text-white/85 sm:text-[1.125rem]">
                  {resolveBrandText(paragraph, brand)}
                </p>
              ))}
            </div>

            <div
              data-reveal
              data-reveal-from="gauche"
              data-reveal-delay="3"
              className="mt-2 flex flex-wrap gap-4"
            >
              {/* Sur la vidéo, aucun jeton de thème ne s'applique : les deux boutons sont
                  explicitement traités pour fond sombre. */}
              <Button href={pathnameForLocale('/contact', locale)} variant="solidOnDark">
                {t.accueil.ctaProjet}
              </Button>
              <Button
                href={pathnameForLocale('/finance', locale)}
                variant="ghostOnDark"
                withArrow={false}
              >
                {t.accueil.ctaDomaines}
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-b border-line bg-page-alt py-12 sm:py-14">
        <Container>
          <dl className="grid gap-10 sm:grid-cols-3">
            {t.accueil.chiffres.map((figure, index) => (
              <div
                key={figure.valeur}
                data-reveal
                data-reveal-from={index % 2 === 0 ? 'gauche' : 'droite'}
                data-reveal-delay={index + 1}
                className="flex flex-col gap-2"
              >
                <dt className="font-(family-name:--font-display) text-[2.25rem] leading-none text-text-strong sm:text-[2.75rem]">
                  {figure.valeur}
                </dt>
                <dd className="max-w-[24ch] text-[0.875rem] leading-snug text-text-muted">
                  {figure.libelle}
                </dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      <TwoEntities active={brand.key} locale={locale} strings={t} />

      <PageBody page={page} brand={brand} locale={locale} images={imagesDeCorps('accueil')} />
    </>
  )
}
