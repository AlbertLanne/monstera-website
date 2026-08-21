/**
 * Vérifie la bascule d'entité de bout en bout, dans un vrai navigateur.
 *
 * Deux niveaux :
 *
 * 1. Le mécanisme — le thème change immédiatement, la raison sociale suit, et le choix survit à
 *    une navigation puis à un rechargement.
 * 2. Le balayage — sur les quatorze routes du site, aucune trace de la société qui n'est pas
 *    affichée : ni raison sociale, ni numéro de registre, ni UID, ni adresse e-mail, ni adresse
 *    postale. C'est le contrôle qui compte : une seule mention oubliée publie l'identité d'une
 *    société sur le site de l'autre.
 *
 * Une exception, assumée, marquée `data-names-both-entities` : la section « deux sociétés » de
 * l'accueil, qui présente le groupe. Elle est retirée du texte balayé, pas ignorée — son contenu
 * est vérifié à part. La page Contact, elle, ne nomme plus que la société affichée : elle passe
 * le balayage sans exception.
 *
 * Usage : node scripts/check-brand-switch.mjs [url]
 */
import { chromium } from 'playwright'

/**
 * `networkidle` attend un silence réseau que le serveur de développement ne donne pas toujours :
 * il compile la route à la demande et garde une liaison ouverte pour le rechargement à chaud.
 * On attend le pied de page, qui est le dernier élément rendu par le serveur.
 */
async function aller(page, url) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 })
  await page.locator('footer').first().waitFor({ state: 'attached', timeout: 90000 })
}

const BASE = process.argv[2] ?? 'http://localhost:3000'

/** Les quatorze routes du site. */
const ROUTES = [
  '/',
  '/services',
  '/services/immobilier',
  '/finance',
  '/finance/financement-immobilier',
  '/finance/capital-investissement',
  '/finance/capital-risque',
  '/finance/investissements-start-up',
  '/finance/mezzanine-capital',
  '/finance/developpement-de-projets',
  '/finance/energies-renouvelables',
  '/finance/medecine-pharma',
  '/finance/solutions-technologiques-e-mobilite',
  '/finance/crowdfunding',
  '/a-propos',
  '/discretion',
  '/notre-equipe',
  '/contact',
  '/impressum',
  '/mentions-legales',
  '/politique-de-confidentialite',
]

/** Tout ce qui identifie une société et ne doit jamais apparaître sur le site de l'autre. */
const EMPREINTES = {
  investments: [
    'Argentum Investments SA',
    'CH-660.0.244.019-9',
    'CHE-134.341.014',
    'contact@argentum-investments.ch',
    'Marc-Doret',
    'Andrew Silver',
  ],
  advisors: [
    'Argentum Advisors SA',
    'CH-660.0.242.019-2',
    'contact@argentum-advisors.ch',
  ],
}

const checks = []
function check(label, actual, expected) {
  const ok = actual === expected
  checks.push({ label, ok })
  console.log(
    `${ok ? '  ok  ' : ' ÉCHEC'} ${label}${ok ? '' : ` — attendu « ${expected} », obtenu « ${actual} »`}`,
  )
}

const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'fr-CH' })
const page = await context.newPage()

const brandAttr = () => page.getAttribute('html', 'data-brand')

/**
 * Texte réellement affiché, moins les blocs qui nomment volontairement les deux sociétés.
 *
 * On masque ces blocs puis on lit `document.body.innerText` sur la page vivante, plutôt que de
 * lire un clone détaché : sans mise en page, `innerText` retombe sur `textContent` et rapporte
 * alors le contenu des `<script>` — la charge utile RSC de Next y nomme les deux sociétés, ce
 * qui produisait une fuite qui n'existe pas à l'écran.
 */
async function texteDeLaPage() {
  return page.evaluate(() => {
    const blocs = [...document.querySelectorAll('[data-names-both-entities]')]
    const avant = blocs.map((n) => n.style.display)
    blocs.forEach((n) => (n.style.display = 'none'))
    const texte = document.body.innerText
    blocs.forEach((n, i) => (n.style.display = avant[i]))
    return texte
  })
}

/** Clique l'entité voulue dans le sélecteur de l'en-tête. */
async function basculer(nomComplet) {
  await page.getByRole('button', { name: nomComplet }).first().click()
}

// --- 1. Mécanisme ----------------------------------------------------------
await aller(page, `${BASE}/`)
check('état initial : thème', await brandAttr(), 'investments')

const footerInitial = await page.locator('footer').innerText()
check('état initial : footer nomme Investments', footerInitial.includes('Argentum Investments SA'), true)
check('état initial : footer ne nomme pas Advisors', footerInitial.includes('Argentum Advisors SA'), false)
check('état initial : registre affiché', footerInitial.includes('CH-660.0.244.019-9'), true)
check('état initial : UID affiché', footerInitial.includes('CHE-134.341.014'), true)

// Le sélecteur porte la raison sociale complète, pas le seul mot distinctif.
const selecteur = page.getByRole('group', { name: 'Entité du groupe Argentum' }).first()
// `innerText` rend le texte tel qu'il s'affiche, capitales du CSS comprises.
const texteSelecteur = (await selecteur.innerText()).replace(/\s+/g, ' ').toLowerCase()
check(
  'sélecteur : raison sociale complète d’Investments',
  texteSelecteur.includes('argentum investments sa'),
  true,
)
check(
  'sélecteur : raison sociale complète d’Advisors',
  texteSelecteur.includes('argentum advisors sa'),
  true,
)

// Hors des vrais domaines, la bascule reste un bouton : rediriger casserait la démonstration.
check(
  'localhost : la bascule est un bouton, pas un lien',
  await selecteur.locator('a').count(),
  0,
)

await basculer('Argentum Advisors SA')
await page.waitForFunction(() => document.documentElement.dataset.brand === 'advisors')
check('après clic : thème basculé', await brandAttr(), 'advisors')

await page.waitForFunction(
  () => !document.querySelector('footer')?.innerText.includes('Argentum Investments SA'),
  null,
  { timeout: 10000 },
)

const footerApres = await page.locator('footer').innerText()
check('après clic : footer nomme Advisors', footerApres.includes('Argentum Advisors SA'), true)
check('après clic : registre Advisors', footerApres.includes('CH-660.0.242.019-2'), true)
check('après clic : UID masqué faute de donnée', footerApres.includes('CHE-'), false)
check('après clic : adresse masquée faute de donnée', footerApres.includes('Marc-Doret'), false)
check('après clic : e-mail Advisors', footerApres.includes('contact@argentum-advisors.ch'), true)

// --- 2. Balayage des routes en Advisors -----------------------------------
console.log('\n— Balayage des routes, entité affichée : Advisors')
for (const route of ROUTES) {
  await aller(page, `${BASE}${route}`)
  check(`${route} : thème conservé`, await brandAttr(), 'advisors')

  const texte = await texteDeLaPage()
  const fuites = EMPREINTES.investments.filter((trace) => texte.includes(trace))
  check(`${route} : aucune trace d’Investments${fuites.length ? ` (${fuites.join(', ')})` : ''}`, fuites.length, 0)
  check(`${route} : nomme bien Advisors`, texte.includes('Argentum Advisors SA'), true)
}

// --- 3. Persistance --------------------------------------------------------
await page.reload({ waitUntil: 'domcontentloaded' })
check('rechargement : thème conservé', await brandAttr(), 'advisors')

// --- 4. Retour en Investments et balayage symétrique -----------------------
await aller(page, `${BASE}/`)
await basculer('Argentum Investments SA')
await page.waitForFunction(() => document.documentElement.dataset.brand === 'investments')
await page.waitForFunction(
  () => document.querySelector('footer')?.innerText.includes('Argentum Investments SA'),
  null,
  { timeout: 10000 },
)
check('retour : thème', await brandAttr(), 'investments')

console.log('\n— Balayage des routes, entité affichée : Investments')
for (const route of ROUTES) {
  await aller(page, `${BASE}${route}`)
  const texte = await texteDeLaPage()
  const fuites = EMPREINTES.advisors.filter((trace) => texte.includes(trace))
  check(`${route} : aucune trace d’Advisors${fuites.length ? ` (${fuites.join(', ')})` : ''}`, fuites.length, 0)
}

// --- 5. Fiche au registre du commerce, page Contact ------------------------
// La page Contact ne renvoie que vers la société affichée : la fiche doit suivre la bascule.
for (const [marque, nom, url] of [
  ['investments', 'Argentum Investments SA', 'https://www.moneyhouse.ch/en/company/argentum-investments-sa-4141745391'],
  ['advisors', 'Argentum Advisors SA', 'https://www.moneyhouse.ch/de/company/argentum-advisors-sa-20144934951'],
]) {
  await context.addCookies([{ name: 'argentum-brand', value: marque, url: BASE }])
  await aller(page, `${BASE}/contact`)

  const liens = page.locator('[data-registry-link] a')
  check(`contact ${marque} : une seule fiche au registre`, await liens.count(), 1)
  check(`contact ${marque} : la fiche pointe sur la bonne société`, await liens.first().getAttribute('href'), url)
  check(`contact ${marque} : la fiche nomme la société affichée`, (await liens.first().innerText()).includes(nom), true)
  check(
    `contact ${marque} : aucun lien vers l’autre société`,
    await page.locator('a[href*="moneyhouse.ch"]').count(),
    1,
  )
}

await browser.close()

const failed = checks.filter((c) => !c.ok)
console.log(`\n${checks.length - failed.length}/${checks.length} vérifications passées`)
if (failed.length) process.exit(1)
