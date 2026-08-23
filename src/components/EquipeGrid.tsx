import type { Brand } from '@/brand/brands'
import { Container } from '@/components/ui/Container'
import { EQUIPE, adresseEmail, initiales, type Membre } from '@/config/equipe'
import type { Locale } from '@/i18n/locales'
import { UI } from '@/i18n/ui'

/**
 * Les sept personnes de l'équipe, groupées comme le client les a livrées.
 *
 * Composant serveur : rien n'y est interactif, et l'adresse e-mail doit suivre l'entité affichée,
 * qui est résolue sur le serveur.
 *
 * **Pas de photographie, par manque de portrait fourni** : l'avatar est un disque portant les deux
 * initiales. C'est ce qu'a demandé Albert le 23 août 2026. Une photographie d'agence à la place
 * d'un vrai portrait ferait passer pour un collaborateur quelqu'un qui ne l'est pas.
 */

function Avatar({ nom }: { nom: string }) {
  return (
    <span
      aria-hidden="true"
      className="flex size-14 shrink-0 items-center justify-center rounded-full bg-brand font-(family-name:--font-display) text-[1.0625rem] tracking-[0.04em] text-on-brand"
    >
      {initiales(nom)}
    </span>
  )
}

function Carte({ membre, brand, ecrireA }: { membre: Membre; brand: Brand; ecrireA: string }) {
  const email = adresseEmail(membre, brand.domain)

  return (
    <article className="flex h-full flex-col gap-4 border-t border-line py-7">
      <div className="flex items-center gap-4">
        <Avatar nom={membre.nom} />
        <div className="min-w-0">
          <h3 className="font-(family-name:--font-display) text-[1.1875rem] leading-snug text-text-strong">
            {membre.nom}
          </h3>
          <p className="mt-1 text-[0.6875rem] uppercase tracking-[0.1em] text-text-muted">
            {membre.fonction}
          </p>
        </div>
      </div>

      {/* `break-all` : une adresse longue ne doit pas élargir la colonne de la grille. */}
      <a
        href={`mailto:${email}`}
        aria-label={`${ecrireA} ${membre.nom}`}
        className="mt-auto break-all text-[0.8125rem] text-accent-contrast underline decoration-line-strong decoration-1 underline-offset-4 transition-colors hover:decoration-accent"
      >
        {email}
      </a>
    </article>
  )
}

export function EquipeGrid({ brand, locale }: { brand: Brand; locale: Locale }) {
  const t = UI[locale].equipe

  return (
    <section className="bg-page py-16 sm:py-20 lg:py-(--spacing-section)">
      <Container>
        <div className="flex flex-col gap-14">
          {EQUIPE.map((groupe) => (
            <div key={groupe.cle} data-reveal>
              <div className="mb-2 flex flex-col gap-4">
                <span aria-hidden="true" className="h-px w-14 bg-accent" />
                <h2 className="font-(family-name:--font-display) text-[1.5rem] leading-[1.2] text-text-strong sm:text-[1.75rem]">
                  {t[groupe.cle]}
                </h2>
              </div>

              <ul className="grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
                {groupe.membres.map((membre) => (
                  <li key={membre.email}>
                    <Carte membre={membre} brand={brand} ecrireA={t.ecrireA} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
