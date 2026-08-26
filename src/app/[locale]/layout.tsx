import type { Metadata, Viewport } from 'next'
import { Inter, Newsreader } from 'next/font/google'

import { getBrand } from '@/brand/resolve'
import { CopyGuard } from '@/components/CopyGuard'
import { Footer } from '@/components/Footer'
import {
  GoogleTagManagerNoScript,
  GoogleTagManagerScript,
} from '@/components/GoogleTagManager'
import { Header } from '@/components/Header'
import { CurseurSurMesure } from '@/components/CurseurSurMesure'
import { CursorGlow } from '@/components/CursorGlow'
import { MotionLayer } from '@/components/MotionLayer'
import { mainNav } from '@/config/navigation'
import { DEFAULT_LOCALE, LOCALES, LOCALE_INFO, isLocale, type Locale } from '@/i18n/locales'
import { getLocale } from '@/i18n/server'
import { UI } from '@/i18n/ui'

import '../globals.css'

const newsreader = Newsreader({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-newsreader',
  weight: ['400', '500'],
  style: ['normal'],
})

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

/**
 * Le segment de langue précède la mise en page racine : c'est lui qui fait de `locale` un
 * paramètre racine, lisible par `next/root-params` depuis n'importe quel composant serveur.
 */
export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }))
}

/**
 * Le site entier est exclu de l'indexation, à la demande du client.
 *
 * Trois verrous se cumulent : cette balise meta, l'en-tête `X-Robots-Tag` posé par
 * `src/proxy.ts` pour couvrir les réponses non HTML, et le `robots.txt` généré par
 * `src/app/robots.ts`.
 */
const NO_INDEX = {
  index: false,
  follow: false,
  nocache: true,
  googleBot: { index: false, follow: false },
} as const

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale: segment } = await params
  const locale: Locale = isLocale(segment) ? segment : DEFAULT_LOCALE
  const brand = await getBrand()

  return {
    title: {
      default: brand.legalName,
      template: `%s — ${brand.legalName}`,
    },
    description: brand.tagline[locale],
    applicationName: brand.legalName,
    robots: NO_INDEX,
    metadataBase: new URL(`https://${brand.domain}`),
    openGraph: {
      title: brand.legalName,
      description: brand.tagline[locale],
      locale: LOCALE_INFO[locale].ogLocale,
      type: 'website',
      siteName: brand.legalName,
    },
    formatDetection: { telephone: false, email: false, address: false },
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

/**
 * Le site est en validation chez le client : la copie est dissuadée par défaut. Voir la portée
 * réelle de cette protection dans `CopyGuard`. À passer à `off` lors de la mise en ligne.
 */
const COPY_GUARD = process.env.NEXT_PUBLIC_COPY_GUARD !== 'off'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const brand = await getBrand()
  const locale = await getLocale()
  const t = UI[locale]

  return (
    /* `data-motion-intensite` est posé ici, au rendu serveur, et non par un composant client :
       écrit dans un effet, il produisait un premier affichage sans le régime puis un saut. Rien
       ne se déclenche pour autant tant que `MotionLayer` n'a pas posé `data-motion='on'` — tout
       le CSS de mouvement exige les deux attributs, et sans JavaScript le site s'affiche
       entièrement, sans effet. */
    <html
      lang={LOCALE_INFO[locale].htmlLang}
      data-brand={brand.key}
      data-motion-intensite="premium"
      className={`${inter.variable} ${newsreader.variable}`}
    >
      <body className="flex min-h-dvh flex-col">
        <GoogleTagManagerNoScript />

        {COPY_GUARD ? <CopyGuard /> : null}

        <MotionLayer />
        <CursorGlow />
        <CurseurSurMesure />

        <a
          href="#contenu"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-100 focus:rounded-(--radius-md) focus:bg-brand focus:px-4 focus:py-2 focus:text-on-brand"
        >
          {t.nav.allerAuContenu}
        </a>

        <Header nav={mainNav(locale)} brandKey={brand.key} locale={locale} strings={t} />

        <main id="contenu" className="flex-1">
          {children}
        </main>

        <Footer brand={brand} locale={locale} />

        <GoogleTagManagerScript />
      </body>
    </html>
  )
}
