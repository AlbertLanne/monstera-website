'use server'

import { headers } from 'next/headers'

import { getBrand } from '@/brand/resolve'
import {
  capitalChoices,
  domainChoices,
  labelOf,
  projectEnquirySchema,
  type EnquiryState,
} from '@/domain/project-enquiry'
import { DEFAULT_LOCALE, LOCALE_INFO, isLocale } from '@/i18n/locales'
import { UI } from '@/i18n/ui'
import {
  buildAcknowledgement,
  buildEnquiryHtml,
  buildEnquiryText,
  EmailNotConfiguredError,
  getTransporter,
  resolveRecipient,
  sanitizeHeader,
  smtpFrom,
  type MailField,
} from '@/lib/email'

const RATE_LIMIT = 5
const RATE_WINDOW_MS = 60 * 60 * 1000

/**
 * Limitation en mémoire du processus.
 *
 * Suffisante contre un envoi répété depuis un même poste. Elle ne survit pas à un redémarrage et
 * n'est pas partagée entre instances : sur un hébergement multi-instances, la remplacer par un
 * compteur externe.
 */
const attempts = new Map<string, { count: number; firstAt: number }>()

function withinRateLimit(key: string): boolean {
  const now = Date.now()
  const entry = attempts.get(key)

  if (!entry || now - entry.firstAt > RATE_WINDOW_MS) {
    attempts.set(key, { count: 1, firstAt: now })
    return true
  }
  if (entry.count >= RATE_LIMIT) return false
  entry.count += 1
  return true
}

async function clientKey(): Promise<string> {
  const headerStore = await headers()
  return (
    headerStore.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    headerStore.get('x-real-ip') ??
    'inconnu'
  )
}

/**
 * Traite une soumission de projet.
 *
 * Deux messages partent : la demande vers la boîte de l'entité active, et un accusé de réception
 * vers le visiteur. L'accusé est secondaire — s'il échoue, la demande a tout de même été reçue et
 * le visiteur ne doit pas voir d'erreur.
 *
 * **Deux langues cohabitent volontairement.** Ce que lit le visiteur — messages d'erreur, accusé
 * de réception — est dans la langue du site qu'il consulte, portée par le champ caché `locale`.
 * La demande reçue par le client, elle, reste en français quelle que soit cette langue : c'est
 * une boîte unique, et un format constant s'y dépouille plus vite que trois. La langue du
 * visiteur y figure en clair, pour que la réponse parte dans la bonne.
 */
export async function submitEnquiry(
  _previous: EnquiryState,
  formData: FormData,
): Promise<EnquiryState> {
  const champ = formData.get('locale')
  const locale = isLocale(champ) ? champ : DEFAULT_LOCALE
  const t = UI[locale].formulaire

  const parsed = projectEnquirySchema(locale).safeParse(Object.fromEntries(formData))

  if (!parsed.success) {
    return {
      status: 'error',
      message: t.erreurs.global,
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const data = parsed.data

  // Piège à robots : on accepte sans rien envoyer, pour ne pas signaler la détection.
  if (data.website) return { status: 'success' }

  if (!withinRateLimit(await clientKey())) {
    return {
      status: 'error',
      message: t.erreurs.tropDeDemandes,
    }
  }

  const brand = await getBrand()
  const { to, redirected } = resolveRecipient(brand)

  // Le domaine et la tranche voyagent en valeurs stables : on les rend lisibles en français,
  // langue du message adressé au client.
  const domaine = labelOf(domainChoices(DEFAULT_LOCALE), data.domain)
  const tranche = labelOf(capitalChoices(DEFAULT_LOCALE), data.capital)

  const fields: MailField[] = [
    { label: 'Entité destinataire', value: brand.legalName },
    ...(redirected ? [{ label: 'Redirigé depuis', value: brand.email }] : []),
    { label: 'Langue du visiteur', value: LOCALE_INFO[locale].name },
    { label: 'Nom', value: `${data.firstName} ${data.lastName}` },
    { label: 'E-mail', value: data.email },
    ...(data.phone ? [{ label: 'Téléphone', value: data.phone }] : []),
    { label: 'Société / projet', value: data.company },
    ...(data.country ? [{ label: 'Pays', value: data.country }] : []),
    { label: 'Domaine', value: domaine },
    { label: 'Besoin en capitaux', value: tranche },
    { label: 'Utilisation prévue des fonds', value: data.useOfFunds },
    { label: 'Présentation du projet', value: data.message },
  ]

  const title = `Nouvelle soumission de projet — ${data.company}`
  const transporter = getConfiguredTransporter()

  if ('error' in transporter) {
    return {
      status: 'error',
      message: t.erreurs.envoiInactif.replace('{email}', brand.email),
    }
  }

  try {
    await transporter.value.sendMail({
      from: smtpFrom(brand),
      to,
      replyTo: sanitizeHeader(data.email),
      subject: sanitizeHeader(`[${brand.distinctive}] ${data.company} — ${tranche}`),
      text: buildEnquiryText(title, fields),
      html: buildEnquiryHtml(title, fields),
    })
  } catch (error) {
    console.error('[contact] échec de l’envoi de la demande :', error)
    return {
      status: 'error',
      message: t.erreurs.envoiEchoue.replace('{email}', brand.email),
    }
  }

  // À partir d'ici la demande est arrivée : plus aucune erreur ne doit être montrée au visiteur.
  try {
    const ack = buildAcknowledgement(brand, locale, data.firstName, data.company)
    await transporter.value.sendMail({
      from: smtpFrom(brand),
      to: sanitizeHeader(data.email),
      replyTo: brand.email,
      subject: sanitizeHeader(ack.subject),
      text: ack.text,
      html: ack.html,
    })
  } catch (error) {
    console.error('[contact] accusé de réception non envoyé :', error)
  }

  return { status: 'success' }
}

/** Isole l'absence de configuration SMTP des erreurs d'envoi, qui ne se traitent pas pareil. */
function getConfiguredTransporter():
  | { value: ReturnType<typeof getTransporter> }
  | { error: EmailNotConfiguredError } {
  try {
    return { value: getTransporter() }
  } catch (error) {
    if (error instanceof EmailNotConfiguredError) {
      console.error('[contact] SMTP non configuré :', error.message)
      return { error }
    }
    throw error
  }
}
