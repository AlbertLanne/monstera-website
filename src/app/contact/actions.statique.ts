'use client'

import { BRANDS, DEFAULT_BRAND, isBrandKey } from '@/brand/brands'
import { projectEnquirySchema, type EnquiryState } from '@/domain/project-enquiry'

/**
 * Remplace `actions.ts` dans l'export statique — la substitution est faite par
 * `.github/workflows/pages.yml`, ce fichier n'est jamais utilisé en rendu serveur.
 *
 * Un export ne peut rien envoyer : il n'y a pas de serveur pour tenir la connexion SMTP. Plutôt
 * que d'afficher un formulaire qui ne mène nulle part, la saisie est reversée dans un message
 * pré-rempli ouvert chez le visiteur. La validation reste la même qu'en production, pour que la
 * preview montre les mêmes messages d'erreur que le site final.
 */
export async function submitEnquiry(
  _previous: EnquiryState,
  formData: FormData,
): Promise<EnquiryState> {
  const parsed = projectEnquirySchema.safeParse(Object.fromEntries(formData))

  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Certains champs doivent être corrigés.',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const data = parsed.data
  if (data.website) return { status: 'success' }

  const key = document.documentElement.dataset.brand
  const brand = BRANDS[isBrandKey(key) ? key : DEFAULT_BRAND]

  const corps = [
    `Nom : ${data.firstName} ${data.lastName}`,
    `E-mail : ${data.email}`,
    ...(data.phone ? [`Téléphone : ${data.phone}`] : []),
    `Société / projet : ${data.company}`,
    ...(data.country ? [`Pays : ${data.country}`] : []),
    `Domaine : ${data.domain}`,
    `Besoin en capitaux : ${data.capital}`,
    `Utilisation prévue des fonds : ${data.useOfFunds}`,
    '',
    data.message,
  ].join('\n')

  const sujet = `Soumission de projet — ${data.company}`
  window.location.href = `mailto:${brand.email}?subject=${encodeURIComponent(sujet)}&body=${encodeURIComponent(corps)}`

  return {
    status: 'error',
    message: `Cette version de démonstration ne transmet pas les demandes. Votre message vient de s’ouvrir dans votre logiciel de messagerie ; sinon, écrivez à ${brand.email}.`,
  }
}
