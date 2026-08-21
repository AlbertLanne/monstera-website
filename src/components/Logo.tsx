import Image from 'next/image'

import advisors from '@/assets/brand/argentum-advisors.webp'
import advisorsClair from '@/assets/brand/argentum-advisors-clair.webp'
import investments from '@/assets/brand/argentum-investments.webp'
import investmentsClair from '@/assets/brand/argentum-investments-clair.webp'
import { BRANDS, type BrandKey } from '@/brand/brands'

/**
 * Signature de l'entité active.
 *
 * Depuis le 20 août 2026 le client a livré **une signature par société** : le mot-symbole est
 * suivi de la raison sociale, « ARGENTUM INVESTMENTS » ou « ARGENTUM ADVISORS ». Elle nomme donc
 * une personne morale, et doit suivre la bascule d'entité comme le reste du site — afficher la
 * mauvaise signature sur un domaine serait la même faute que d'y écrire la mauvaise raison
 * sociale.
 *
 * Deux versions par entité, produites par `pnpm logos:build` :
 *
 * — sur fond clair, la signature d'origine, navy et ciel ;
 * — sur fond sombre, la même où le navy passe au blanc et le ciel reste ciel. Un simple
 *   retournement en blanc plein aurait écrasé les deux encres en une seule.
 *
 * Le texte alternatif porte la raison sociale complète et non « Argentum » : c'est ce que le
 * fichier montre.
 */

/** Le fond sur lequel la signature est posée, pas la couleur de la signature. */
export type FondDeSignature = 'clair' | 'sombre'

const SIGNATURES: Record<BrandKey, Record<FondDeSignature, typeof investments>> = {
  investments: { clair: investments, sombre: investmentsClair },
  advisors: { clair: advisors, sombre: advisorsClair },
}

export function Logo({
  brand,
  fond = 'clair',
  className = '',
}: {
  brand: BrandKey
  fond?: FondDeSignature
  className?: string
}) {
  return (
    <Image
      src={SIGNATURES[brand][fond]}
      alt={BRANDS[brand].legalName}
      priority
      sizes="220px"
      className={`h-auto w-[168px] sm:w-[196px] ${className}`}
    />
  )
}
