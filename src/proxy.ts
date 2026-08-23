import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { BRAND_COOKIE, brandFromHost, isBrandKey } from '@/brand/brands'
import { BRAND_HEADER } from '@/brand/resolve'
import { DEFAULT_LOCALE, isLocale } from '@/i18n/locales'

/**
 * Deux rôles : router la langue, et déduire l'entité du nom d'hôte.
 *
 * **Langue.** Les pages vivent sous `src/app/[locale]`, mais le français reste servi à la racine :
 * `/contact` est réécrit en interne vers `/fr/contact`, sans que l'adresse affichée change. Les
 * deux autres langues portent leur préfixe et passent telles quelles. `/fr/...` est redirigé vers
 * la forme sans préfixe pour qu'une page n'ait jamais deux adresses.
 *
 * **Entité.** Le site est déployé sur argentuminvestments.ch et argentumadvisors.ch. Chaque
 * visiteur doit arriver sur la bonne entité sans rien cliquer ; `getBrandKey()` tranche à partir
 * du nom d'hôte, cet en-tête ne fait que transmettre ce que le proxy a vu.
 *
 * En Next.js 16 ce fichier remplace l'ancien `middleware.ts`.
 */
/**
 * Un chemin de fichier : son dernier segment porte une extension.
 *
 * `/video/hero-geneve.webm` et les autres fichiers de `public/` ne sont pas des pages : les
 * préfixer d'une langue les envoie sur une route qui n'existe pas. Le 23 août 2026, la vidéo du
 * hero est restée muette une demi-journée pour cette raison. Ils traversent donc sans réécriture,
 * mais reçoivent quand même l'en-tête de non-indexation — c'est précisément pour les réponses non
 * HTML que cet en-tête existe.
 */
const EST_FICHIER = /\.[a-z0-9]+$/i

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const premier = pathname.split('/')[1]
  const estFichier = EST_FICHIER.test(pathname.split('/').pop() ?? '')

  // `/fr/contact` n'est pas une adresse du site : sa forme canonique est `/contact`.
  if (premier === DEFAULT_LOCALE) {
    const url = request.nextUrl.clone()
    url.pathname = pathname.slice(`/${DEFAULT_LOCALE}`.length) || '/'
    return NextResponse.redirect(url, 308)
  }

  const requestHeaders = new Headers(request.headers)
  const fromHost = brandFromHost(request.headers.get('host'))

  if (fromHost) {
    requestHeaders.set(BRAND_HEADER, fromHost)
  } else {
    requestHeaders.delete(BRAND_HEADER)
  }

  // Sans préfixe de langue, la page est française : on la sert depuis `/fr` sans le montrer.
  const response = isLocale(premier) || estFichier
    ? NextResponse.next({ request: { headers: requestHeaders } })
    : NextResponse.rewrite(
        new URL(`/${DEFAULT_LOCALE}${pathname === '/' ? '' : pathname}${request.nextUrl.search}`, request.url),
        { request: { headers: requestHeaders } },
      )

  // Le site entier est en no-index : l'en-tête double la balise meta et couvre les
  // réponses non HTML (documents, images) que la balise ne peut pas atteindre.
  response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet, noimageindex')

  // Un cookie corrompu ou périmé ferait basculer le site sur une entité inconnue.
  const cookie = request.cookies.get(BRAND_COOKIE)?.value
  if (cookie !== undefined && !isBrandKey(cookie)) {
    response.cookies.delete(BRAND_COOKIE)
  }

  return response
}

export const config = {
  // Tout sauf les assets statiques, l'optimiseur d'images et les fichiers servis à la racine.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt).*)'],
}
