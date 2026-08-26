'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import type { BrandKey } from '@/brand/brands'
import { useBrandActif } from '@/brand/useBrandActif'
import { useBrandSwitch } from '@/brand/useBrandSwitch'
import { BrandSwitcher } from '@/components/BrandSwitcher'
import { LocaleSwitcher } from '@/components/LocaleSwitcher'
import { Logo } from '@/components/Logo'
import { Container } from '@/components/ui/Container'
import type { NavLink } from '@/config/navigation'
import type { Locale } from '@/i18n/locales'
import type { UIStrings } from '@/i18n/ui'

function isCurrent(pathname: string, href: string) {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}

/** Vrai si l'entrée ou l'une de ses sous-entrées correspond à la page courante. */
function isBranchActive(pathname: string, link: NavLink) {
  return isCurrent(pathname, link.href) || (link.children ?? []).some((c) => isCurrent(pathname, c.href))
}

/**
 * Classes du libellé de navigation.
 *
 * La barre est sombre en toutes circonstances depuis que le fond blanc a été refusé : les
 * couleurs sont fixées en blanc et en ciel explicitement, et non par une variante utilitaire de
 * thème — sur le thème clair, `text-text` sortirait navy sur navy.
 */
function entryClasses(active: boolean) {
  return active ? 'text-accent' : 'text-white/80 hover:text-white'
}

function DesktopEntry({ link, pathname }: { link: NavLink; pathname: string }) {
  const [open, setOpen] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const active = isBranchActive(pathname, link)

  // Un survol qui traverse le vide entre le libellé et le panneau ne doit pas le refermer.
  function scheduleClose() {
    closeTimer.current = setTimeout(() => setOpen(false), 120)
  }
  function cancelClose() {
    if (closeTimer.current) clearTimeout(closeTimer.current)
  }
  useEffect(() => cancelClose, [])

  if (!link.children) {
    return (
      <Link
        href={link.href}
        aria-current={active ? 'page' : undefined}
        className={`relative py-2 text-[0.8125rem] font-medium tracking-[0.04em] whitespace-nowrap transition-colors duration-200 ${entryClasses(active)}`}
      >
        {link.label}
      </Link>
    )
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => {
        cancelClose()
        setOpen(true)
      }}
      onMouseLeave={scheduleClose}
    >
      <Link
        href={link.href}
        aria-expanded={open}
        aria-current={active ? 'page' : undefined}
        onFocus={() => setOpen(true)}
        className={`flex items-center gap-1.5 py-2 text-[0.8125rem] font-medium tracking-[0.04em] whitespace-nowrap transition-colors duration-200 ${entryClasses(active)}`}
      >
        {link.label}
        <span
          aria-hidden="true"
          className={`text-[0.5rem] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        >
          ▾
        </span>
      </Link>

      <div
        hidden={!open}
        className="absolute top-full left-0 z-50 w-[22rem] pt-3"
        onMouseEnter={cancelClose}
        onMouseLeave={scheduleClose}
      >
        <ul className="overflow-hidden rounded-(--radius-md) border border-menu-line bg-menu py-2 shadow-(--shadow-card)">
          {link.children.map((child) => (
            <li key={child.href}>
              <Link
                href={child.href}
                onClick={() => setOpen(false)}
                aria-current={isCurrent(pathname, child.href) ? 'page' : undefined}
                className={`block border-l-2 px-5 py-2.5 text-[0.875rem] transition-colors duration-150 ${
                  isCurrent(pathname, child.href)
                    ? 'border-accent bg-white/8 text-accent'
                    : 'border-transparent text-white/70 hover:border-accent hover:bg-white/8 hover:text-white'
                }`}
              >
                {child.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

/** Le tiroir reprend l'aplat du panneau déroulant : le menu blanc a été refusé avec l'en-tête. */
function MobileMenu({
  nav,
  pathname,
  onClose,
}: {
  nav: NavLink[]
  pathname: string
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 top-[var(--header-h)] z-40 overflow-y-auto bg-menu lg:hidden">
      <Container className="py-8">
        <nav>
          <ul className="divide-y divide-menu-line">
            {nav.map((link) => (
              <li key={link.href} className="py-4">
                <Link
                  href={link.href}
                  onClick={onClose}
                  aria-current={isCurrent(pathname, link.href) ? 'page' : undefined}
                  className={`font-(family-name:--font-display) text-[1.375rem] ${
                    isBranchActive(pathname, link) ? 'text-accent' : 'text-white'
                  }`}
                >
                  {link.label}
                </Link>
                {link.children ? (
                  <ul className="mt-3 space-y-2.5 border-l border-menu-line pl-4">
                    {link.children.map((child) => (
                      <li key={child.href}>
                        <Link
                          href={child.href}
                          onClick={onClose}
                          className={`block text-[0.9375rem] ${
                            isCurrent(pathname, child.href) ? 'text-accent' : 'text-white/70'
                          }`}
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
        </nav>

      </Container>
    </div>
  )
}

/**
 * L'accueil est la seule page dont le hero est une vidéo plein écran. Son chemin dépend de la
 * langue : `/` en français, `/en` et `/de` ailleurs.
 */
function surLAccueil(pathname: string, locale: Locale) {
  // La barre finale existe dans l'export statique (`trailingSlash`), pas sur le site servi.
  const nu = pathname.replace(/\/$/, '')
  return nu === '' || nu === `/${locale}`
}

/**
 * En-tête du site.
 *
 * Sur l'accueil il démarre transparent au-dessus de la vidéo puis devient opaque au défilement.
 * Les pages intérieures ont un en-tête opaque dès le départ.
 *
 * Le fond opaque est un dégradé navy → royal, et non le blanc du thème : décision client du
 * 20 août 2026, l'en-tête blanc a été refusé comme monocouleur. La barre est donc sombre sur les
 * deux entités et tout ce qu'elle contient est réglé pour un fond sombre.
 *
 * `useBrandSwitch` est tenu ici et non dans le sélecteur : l'en-tête en affiche deux — la barre
 * et le tiroir mobile — qui doivent réagir ensemble au même clic.
 */
export function Header({
  nav,
  brandKey,
  locale,
  strings,
}: {
  nav: NavLink[]
  brandKey: BrandKey
  locale: Locale
  strings: UIStrings
}) {
  const pathname = usePathname()
  const commandes = useBrandSwitch(brandKey)
  // La signature nomme la société : elle suit `<html data-brand>`, posé dès le clic, plutôt que
  // le rendu serveur qui arrive une centaine de millisecondes plus tard.
  const brandAffichee = useBrandActif(brandKey)
  const overHero = surLAccueil(pathname, locale)
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 24)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Pas d'effet sur `pathname` pour refermer le menu : chaque lien du tiroir appelle déjà
  // `onClose`, et fermer depuis un effet déclencherait un rendu en cascade.

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  const floating = overHero && !scrolled && !menuOpen

  return (
    <>
      <header
        data-floating={floating ? '' : undefined}
        className={`fixed top-0 right-0 left-0 z-50 h-[var(--header-h)] transition-colors duration-300 ${
          floating
            ? 'border-b border-white/10 bg-transparent'
            : 'border-b border-header-line bg-(image:--header-bg)'
        }`}
      >
        {/* Bande utilitaire : qui l'on consulte, et dans quelle langue. Elle est plus sombre que
            la navigation quand l'en-tête est opaque, et s'efface avec lui au-dessus de la vidéo
            d'accueil — deux registres, une seule barre. */}
        <div
          className={`h-[var(--topbar-h)] transition-colors duration-300 ${
            floating ? 'border-b border-white/10' : 'border-b border-white/8 bg-navy-950'
          }`}
        >
          <Container className="flex h-full items-center justify-between gap-6">
            <BrandSwitcher commandes={commandes} locale={locale} strings={strings} />
            <LocaleSwitcher strings={strings} />
          </Container>
        </div>

        <Container className="flex h-[var(--nav-h)] items-center justify-between gap-8">
          <Link
            href={nav[0].href}
            aria-label={strings.nav.accueilAria}
            className="flex shrink-0 items-center"
          >
            <Logo brand={brandAffichee} fond="sombre" />
          </Link>

          <nav aria-label={strings.nav.navigationAria} className="hidden lg:block">
            <ul className="flex items-center gap-6">
              {nav.map((link) => (
                <li key={link.href}>
                  <DesktopEntry link={link} pathname={pathname} />
                </li>
              ))}
            </ul>
          </nav>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? strings.nav.fermerMenu : strings.nav.ouvrirMenu}
            className="-mr-2 p-2 text-white lg:hidden"
          >
            <span aria-hidden="true" className="block text-lg leading-none">
              {menuOpen ? '✕' : '☰'}
            </span>
          </button>
        </Container>
      </header>

      {menuOpen ? (
        <MobileMenu nav={nav} pathname={pathname} onClose={() => setMenuOpen(false)} />
      ) : null}
    </>
  )
}
