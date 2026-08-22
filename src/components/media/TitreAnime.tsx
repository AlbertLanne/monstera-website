import { Fragment, type CSSProperties } from 'react'

/**
 * Un titre dont les mots se composent un à un.
 *
 * Ce n'est pas un composant client : chaque mot reçoit son rang dans une variable CSS, et
 * `globals.css` en déduit un retard de transition. Le rendu reste serveur, `MotionLayer` se
 * contente d'observer le conteneur — l'effet ne coûte donc pas un octet de JavaScript.
 *
 * Il ne s'active qu'à partir du régime « marqué ». En dessous, les mots sont des `inline-block`
 * inertes et la phrase entre d'un bloc comme avant.
 *
 * **À réserver aux grands intertitres.** Sur un paragraphe courant, décomposer la phrase la rend
 * pénible à lire : le regard attend le mot suivant au lieu de parcourir la ligne.
 *
 * L'espace entre deux mots est un nœud de texte **hors** du `span` : placée à l'intérieur d'un
 * `inline-block`, une espace de fin est ignorée et les mots se toucheraient.
 */
export function TitreAnime({
  texte,
  className = '',
  as: Balise = 'h2',
}: {
  texte: string
  className?: string
  as?: 'h1' | 'h2' | 'h3' | 'p'
}) {
  const mots = texte.split(' ')

  return (
    <Balise data-mots className={className}>
      {mots.map((mot, index) => (
        <Fragment key={index}>
          <span style={{ '--i': index } as CSSProperties}>{mot}</span>
          {index < mots.length - 1 ? ' ' : ''}
        </Fragment>
      ))}
    </Balise>
  )
}
