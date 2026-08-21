/**
 * Génère `src/content/fr/fiche-images.ts` depuis `src/assets/images/fiches/`.
 *
 * Les images sont importées statiquement et non servies depuis `public/` : c'est ce qui donne à
 * Next les dimensions réelles (pas de saut de mise en page) et l'aperçu flouté au chargement.
 * Cent imports écrits à la main dériveraient du dossier au premier ajout — d'où ce générateur,
 * sur le modèle du pipeline de contenu.
 *
 * Usage : node scripts/gen_fiche_images.mjs
 */
import { readdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const sharp = require('../node_modules/.pnpm/sharp@0.35.3_@types+node@20.19.43/node_modules/sharp')

const RACINE = 'src/assets/images/fiches'
const CIBLE = 'src/content/fr/fiche-images.ts'

/** Le cadrage possible d'une image découle de son rapport, pas d'un classement à la main. */
function orientation(ratio) {
  if (ratio >= 2.1) return 'panoramique'
  if (ratio >= 1.2) return 'paysage'
  if (ratio >= 0.85) return 'carre'
  return 'portrait'
}

const numero = (f) => Number(f.match(/-(\d+)\.webp$/)?.[1] ?? 0)
const identifiant = (slug, f) =>
  `img_${slug.replace(/-/g, '_')}_${numero(f)}`

const dossiers = (await readdir(RACINE, { withFileTypes: true }))
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort()

const imports = []
const entrees = []

for (const slug of dossiers) {
  const fichiers = (await readdir(join(RACINE, slug)))
    .filter((f) => f.endsWith('.webp'))
    .sort((a, b) => numero(a) - numero(b))

  const lignes = []
  for (const f of fichiers) {
    const meta = await sharp(join(RACINE, slug, f)).metadata()
    const id = identifiant(slug, f)
    imports.push(`import ${id} from '@/assets/images/fiches/${slug}/${f}'`)
    lignes.push(
      `    { fichier: '${f}', src: ${id}, orientation: '${orientation(meta.width / meta.height)}' },`,
    )
  }
  entrees.push(`  '${slug}': [\n${lignes.join('\n')}\n  ],`)
}

const source = `// Généré par \`node scripts/gen_fiche_images.mjs\` — ne pas éditer à la main.
//
// Les images des fiches Finance, fournies par le client, une par dossier de slug. L'orientation
// est déduite du rapport de l'image et décide de son cadrage : une verticale ne peut pas servir
// de bandeau pleine largeur, une panoramique ne peut pas servir de portrait.
import type { StaticImageData } from 'next/image'

${imports.join('\n')}

export type OrientationImage = 'panoramique' | 'paysage' | 'carre' | 'portrait'

export type ImageFiche = {
  /** Nom du fichier, seul lien stable avec le dossier source du client. */
  fichier: string
  src: StaticImageData
  orientation: OrientationImage
}

export const IMAGES_FICHES: Record<string, ImageFiche[]> = {
${entrees.join('\n')}
}
`

await writeFile(CIBLE, source)
console.log(`${CIBLE} : ${dossiers.length} fiches, ${imports.length} images`)
