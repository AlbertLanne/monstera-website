'use client'

import { useActionState } from 'react'

import { submitEnquiry } from '@/app/[locale]/contact/actions'
import { SubmitButton } from '@/components/ui/Button'
import type { Choix, EnquiryState } from '@/domain/project-enquiry'
import type { Locale } from '@/i18n/locales'
import type { UIStrings } from '@/i18n/ui'

const FIELD =
  'w-full rounded-(--radius-md) border border-line bg-surface px-4 py-3 text-[0.9375rem] ' +
  'text-text transition-colors duration-150 placeholder:text-text-muted/70 ' +
  'focus:border-accent focus:outline-none'

const LABEL = 'mb-2 block text-[0.75rem] font-medium uppercase tracking-[0.1em] text-text-muted'

const INITIAL: EnquiryState = { status: 'idle' }

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null
  return <p className="mt-1.5 text-[0.8125rem] text-accent-contrast">{errors[0]}</p>
}

function Field({
  name,
  label,
  children,
  errors,
  className = '',
}: {
  name: string
  label: string
  children: React.ReactNode
  errors?: string[]
  className?: string
}) {
  return (
    <div className={className}>
      <label htmlFor={name} className={LABEL}>
        {label}
      </label>
      {children}
      <FieldError errors={errors} />
    </div>
  )
}

/**
 * Formulaire de soumission de projet.
 *
 * Les champs reprennent ce que les fiches du client annoncent analyser : domaine, besoin en
 * capitaux, utilisation prévue des fonds, présentation du projet. La demande part vers
 * l'adresse de l'entité active, résolue côté serveur dans l'action.
 */
export function ProjectEnquiryForm({
  email,
  locale,
  strings,
  domaines,
  tranches,
}: {
  email: string
  locale: Locale
  strings: UIStrings
  domaines: Choix[]
  tranches: Choix[]
}) {
  const [state, formAction, isPending] = useActionState(submitEnquiry, INITIAL)
  const errors = state.status === 'error' ? state.fieldErrors : undefined
  const t = strings.formulaire

  if (state.status === 'success') {
    return (
      <div
        role="status"
        className="rounded-(--radius-md) border border-accent bg-page-alt p-8 sm:p-10"
      >
        <h2 className="font-(family-name:--font-display) text-[1.5rem] leading-snug">
          {t.succesTitre}
        </h2>
        <p className="mt-4 max-w-[52ch] text-[0.9375rem] leading-[1.7] text-text-muted">
          {t.succesTexte}
        </p>
        <p className="mt-4 text-[0.9375rem] text-text-muted">
          {t.succesComplement}{' '}
          <a
            href={`mailto:${email}`}
            className="text-accent-contrast underline decoration-line-strong decoration-1 underline-offset-4"
          >
            {email}
          </a>
        </p>
      </div>
    )
  }

  return (
    <form action={formAction} noValidate className="space-y-6">
      {/* La langue voyage avec la demande : l'action valide et accuse réception dans celle-ci. */}
      <input type="hidden" name="locale" value={locale} />

      {state.status === 'error' ? (
        <p
          role="alert"
          className="rounded-(--radius-md) border border-accent bg-page-alt px-4 py-3 text-[0.875rem] text-text"
        >
          {state.message}
        </p>
      ) : null}

      <div className="grid gap-6 sm:grid-cols-2">
        <Field name="firstName" label={t.prenom} errors={errors?.firstName}>
          <input id="firstName" name="firstName" autoComplete="given-name" required className={FIELD} />
        </Field>
        <Field name="lastName" label={t.nom} errors={errors?.lastName}>
          <input id="lastName" name="lastName" autoComplete="family-name" required className={FIELD} />
        </Field>
        <Field name="email" label={t.email} errors={errors?.email}>
          <input id="email" name="email" type="email" autoComplete="email" required className={FIELD} />
        </Field>
        <Field name="phone" label={t.telephone} errors={errors?.phone}>
          <input id="phone" name="phone" type="tel" autoComplete="tel" className={FIELD} />
        </Field>
        <Field name="company" label={t.societe} errors={errors?.company}>
          <input id="company" name="company" autoComplete="organization" required className={FIELD} />
        </Field>
        <Field name="country" label={t.pays} errors={errors?.country}>
          <input id="country" name="country" autoComplete="country-name" className={FIELD} />
        </Field>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field name="domain" label={t.domaine} errors={errors?.domain}>
          <select id="domain" name="domain" required defaultValue="" className={FIELD}>
            <option value="" disabled>
              {t.choisirDomaine}
            </option>
            {domaines.map((choix) => (
              <option key={choix.value} value={choix.value}>
                {choix.label}
              </option>
            ))}
          </select>
        </Field>
        <Field name="capital" label={t.capitaux} errors={errors?.capital}>
          <select id="capital" name="capital" required defaultValue="" className={FIELD}>
            <option value="" disabled>
              {t.choisirTranche}
            </option>
            {tranches.map((choix) => (
              <option key={choix.value} value={choix.value}>
                {choix.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field name="useOfFunds" label={t.utilisation} errors={errors?.useOfFunds}>
        <textarea id="useOfFunds" name="useOfFunds" rows={3} required className={FIELD} />
      </Field>

      <Field name="message" label={t.presentation} errors={errors?.message}>
        <textarea
          id="message"
          name="message"
          rows={7}
          required
          className={FIELD}
          placeholder={t.placeholderPresentation}
        />
      </Field>

      {/* Piège à robots : invisible et hors du parcours au clavier. */}
      <div aria-hidden="true" className="absolute h-0 w-0 overflow-hidden opacity-0">
        <label htmlFor="website">{t.siteWeb}</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div>
        <label htmlFor="consent" className="flex cursor-pointer items-start gap-3">
          <input
            id="consent"
            name="consent"
            type="checkbox"
            required
            className="mt-1 size-4 shrink-0 accent-[var(--brand)]"
          />
          <span className="text-[0.875rem] leading-[1.65] text-text-muted">
            {t.consentement}
          </span>
        </label>
        <FieldError errors={errors?.consent} />
      </div>

      <div className="pt-2">
        <SubmitButton disabled={isPending}>
          {isPending ? t.envoiEnCours : t.envoyer}
        </SubmitButton>
      </div>

      <p className="text-[0.8125rem] leading-[1.7] text-text-muted">
        {t.avertissement}
      </p>
    </form>
  )
}
