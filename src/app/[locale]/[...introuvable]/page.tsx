import { notFound } from 'next/navigation'

/**
 * Attrape toute adresse qui ne correspond à aucune page, et déclenche `not-found.tsx`.
 *
 * Sans elle, Next ne trouve aucune route pour `/fr/adresse-inventee` et sert son propre écran
 * — « This page could not be found », en anglais, sur les trois langues. La mise en page racine
 * vivant sous `[locale]`, il n'existe pas de `app/not-found.tsx` qu'il puisse rendre à sa place :
 * ce segment attrape-tout est le moyen de lui en donner un.
 *
 * Les routes réelles restent prioritaires : Next préfère toujours un segment nommé à un
 * attrape-tout, donc `/finance/capital-risque` continue de passer par `finance/[slug]`.
 */
export default function Introuvable() {
  notFound()
}
