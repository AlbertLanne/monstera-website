/**
 * Vérifie la bascule d'entité de bout en bout, dans un vrai navigateur.
 *
 * Deux niveaux :
 *
 * 1. Le mécanisme — le sélecteur pointe vers le domaine de l'autre société, sur le même chemin,
 *    et l'entité affichée tient sur toute la navigation puis sur un rechargement.
 * 2. Le balayage — sur les quatorze routes du site, aucune trace de la société qui n'est pas
 *    affichée : ni raison sociale, ni numéro de registre, ni UID, ni adresse e-mail, ni adresse
 *    postale. C'est le contrôle qui compte : une seule mention oubliée publie l'identité d'une
 *    société sur le site de l'autre.
 *
 * Le sélecteur ne bascule plus sur place : chaque société a son domaine, et cliquer y mène. Ce
 * contrôle ne peut donc pas cliquer — il quitterait le serveur de développement pour un domaine
 * réel. Il pose le cookie d'entité, que `getBrandKey()` honore hors des vrais domaines, et
 * vérifie séparément que les liens du sélecteur portent la bonne adresse.
 *
 * Une exception, assumée, marquée `data-names-both-entities` : la section « deux sociétés » de
 * l'accueil, qui présente le groupe. Elle est retirée du texte balayé, pas ignorée — son contenu
 * est vérifié à part. La page Contact, elle, ne nomme plus que la société affichée : elle passe
 * le balayage sans exception.
 *
 * « Andrew Silver » a quitté les empreintes d'Investments le 23 août 2026 : il est représentant
 * autorisé d'Investments au registre **et** CEO du groupe, présent sur la page Équipe des deux
 * sociétés avec une adresse sur chaque domaine. Son nom seul ne désigne donc plus une entité. Ce
 * qui engage l'entité, c'est la ligne « Représentant autorisé » du bloc d'identité légale — elle
 * est vérifiée à part, section 6.
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
    'contact@argentuminvestments.ch',
    'Marc-Doret',
  ],
  advisors: [
    'Argentum Advisors SA',
    'CH-660.0.242.019-2',
    'contact@argentumadvisors.ch',
  ],
}

/** Les sept personnes livrées par le client — elles appartiennent au groupe, pas à une entité. */
const MEMBRES = [
  'Andrew Silver',
  'Gabriel Silver',
  'Matthias Bergman',
  'Simon Adelstein',
  'Vincent Meunier',
  'Nathalie Berger',
  'Sebastian Bühler',
]

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

/**
 * Affiche l'entité voulue.
 *
 * Hors des vrais domaines, l'entité vient du cookie : c'est le seul levier dont dispose ce
 * contrôle depuis que le sélecteur redirige. Le cookie est posé pour l'origine testée, puis la
 * page est rechargée pour que le serveur rejoue le rendu.
 */
async function afficher(marque, route = '/') {
  await context.addCookies([{ name: 'argentum-brand', value: marque, url: BASE }])
  await aller(page, `${BASE}${route}`)
}

/**
 * Le sélecteur d'entité et celui de langue sont des déroulants : un déclencheur qui énonce l'état
 * courant, et un panneau relié par `aria-controls`, rendu dans le document mais masqué tant qu'on
 * n'a pas cliqué. On entre donc par le **nom accessible du déclencheur** — c'est ce qu'annonce un
 * lecteur d'écran, et le vérifier ici a une valeur propre.
 *
 * Les `href` se lisent panneau fermé : le contenu est dans le DOM. Le texte affiché, lui, exige
 * de l'ouvrir — `innerText` ne rend que ce qui est mis en page.
 */
function deroulant(nom) {
  const declencheur = page.getByRole('button', { name: nom }).first()

  const panneau = async () =>
    page.locator(`[id="${await declencheur.getAttribute('aria-controls')}"]`)

  return {
    declencheur,
    panneau,
    async ouvrir() {
      if ((await declencheur.getAttribute('aria-expanded')) !== 'true') await declencheur.click()
    },
    async liens() {
      return (await panneau())
        .locator('a')
        .evaluateAll((liens) => liens.map((a) => a.getAttribute('href')))
    },
    /** Ce que le sélecteur donne à lire une fois déployé : déclencheur et panneau. */
    async texteDeploye() {
      if ((await declencheur.getAttribute('aria-expanded')) !== 'true') await declencheur.click()
      return `${await declencheur.innerText()} ${await (await panneau()).innerText()}`
    },
  }
}

const SELECTEUR_ENTITE = /Entité du groupe Argentum/
const SELECTEUR_LANGUE = /Langue du site|Website language|Sprache der Website/

/** Les liens du sélecteur d'entité de l'en-tête, par domaine visé. */
async function liensDuSelecteur() {
  return deroulant(SELECTEUR_ENTITE).liens()
}

// --- 0. C'est bien le bon site ---------------------------------------------
// Le port 3000 est le défaut de tous les projets de la machine. Un autre site qui l'occupe rend
// une page valide, avec un pied de page : le balayage court alors jusqu'au bout et ne signale
// rien d'utile — le 23 août, il a interrogé un site sans rapport pendant trente secondes avant
// d'échouer sur un délai dépassé. On refuse tout de suite plutôt que de rendre un vert faux.
await aller(page, `${BASE}/`)
const marqueur = await page.locator('html').getAttribute('data-brand')
if (!marqueur) {
  console.error(
    `\n${BASE} ne sert pas Argentum : la racine n'a pas d'attribut « data-brand ».\n` +
      `Un autre projet occupe sans doute le port. Lancez « pnpm dev --port <libre> » et passez\n` +
      `l'adresse en argument : node scripts/check-brand-switch.mjs http://localhost:<libre>\n`,
  )
  await browser.close()
  process.exit(2)
}

// --- 1. Mécanisme ----------------------------------------------------------
check('état initial : thème', await brandAttr(), 'investments')

const footerInitial = await page.locator('footer').innerText()
check('état initial : footer nomme Investments', footerInitial.includes('Argentum Investments SA'), true)
check('état initial : footer ne nomme pas Advisors', footerInitial.includes('Argentum Advisors SA'), false)
check('état initial : registre affiché', footerInitial.includes('CH-660.0.244.019-9'), true)
check('état initial : UID affiché', footerInitial.includes('CHE-134.341.014'), true)

// Le sélecteur porte la raison sociale complète, pas le seul mot distinctif.
// `innerText` rend le texte tel qu'il s'affiche, capitales du CSS comprises.
const texteSelecteur = (await deroulant(SELECTEUR_ENTITE).texteDeploye())
  .replace(/\s+/g, ' ')
  .toLowerCase()
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

// L'entité inactive est un lien vers son propre domaine, et l'entité affichée n'en est pas un.
const liensAccueil = await liensDuSelecteur()
check('sélecteur : un seul lien, celui de l’entité inactive', liensAccueil.length, 1)
check(
  'sélecteur : le lien vise le domaine d’Advisors',
  liensAccueil[0],
  'https://argentumadvisors.ch/',
)

// Le chemin courant est conservé : on doit arriver sur la même page chez l'autre société.
await aller(page, `${BASE}/finance/capital-risque`)
const liensSousPage = await liensDuSelecteur()
check(
  'sélecteur : le lien conserve le chemin courant',
  liensSousPage[0],
  'https://argentumadvisors.ch/finance/capital-risque',
)

await afficher('advisors')
check('entité Advisors : thème', await brandAttr(), 'advisors')

const footerApres = await page.locator('footer').innerText()
check('entité Advisors : footer nomme Advisors', footerApres.includes('Argentum Advisors SA'), true)
check('entité Advisors : registre Advisors', footerApres.includes('CH-660.0.242.019-2'), true)
check('entité Advisors : UID masqué faute de donnée', footerApres.includes('CHE-'), false)
check('entité Advisors : adresse masquée faute de donnée', footerApres.includes('Marc-Doret'), false)
check('entité Advisors : e-mail Advisors', footerApres.includes('contact@argentumadvisors.ch'), true)

// Sur le site d'Advisors, le sélecteur renvoie vers Investments.
const liensAdvisors = await liensDuSelecteur()
check(
  'sélecteur en Advisors : le lien vise le domaine d’Investments',
  liensAdvisors[0],
  'https://argentuminvestments.ch/',
)

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
await afficher('investments')
check('retour : thème', await brandAttr(), 'investments')
check(
  'retour : footer nomme Investments',
  (await page.locator('footer').innerText()).includes('Argentum Investments SA'),
  true,
)

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

// --- 6. Représentant autorisé : une donnée du registre, pas un membre d'équipe ------
// Andrew Silver figure sur la page Équipe des deux sociétés. En revanche il n'est représentant
// autorisé qu'd'Investments : la ligne ne doit exister que là, et le bloc d'identité légale est
// le seul endroit qui l'affirme.
for (const [marque, attendu] of [
  ['investments', true],
  ['advisors', false],
]) {
  await afficher(marque, '/contact')
  const bloc = page.locator('[data-legal-identity]').first()
  const texte = await bloc.innerText()
  // Les intitulés sont mis en capitales par le CSS, et `innerText` rend le texte tel qu'il
  // s'affiche : la comparaison se fait en minuscules.
  check(
    `contact ${marque} : ligne « Représentant autorisé »`,
    texte.toLowerCase().includes('représentant autorisé'),
    attendu,
  )
  check(`contact ${marque} : le représentant nommé`, texte.includes('Andrew Silver'), attendu)
}

// --- 7. Page Équipe : les sept personnes, sur le domaine affiché -------------------
for (const [marque, domaine] of [
  ['investments', 'argentuminvestments.ch'],
  ['advisors', 'argentumadvisors.ch'],
]) {
  await afficher(marque, '/notre-equipe')
  const texte = await texteDeLaPage()
  check(`équipe ${marque} : les sept personnes`, MEMBRES.filter((m) => texte.includes(m)).length, 7)
  const adresses = await page
    .locator('a[href^="mailto:"]')
    .evaluateAll((liens) => liens.map((a) => a.getAttribute('href')))
  const equipe = adresses.filter((h) => !h.includes('contact@'))
  check(`équipe ${marque} : sept adresses e-mail`, equipe.length, 7)
  check(
    `équipe ${marque} : toutes sur ${domaine}`,
    equipe.every((h) => h.endsWith(`@${domaine}`)),
    true,
  )
}

// --- 8. Les trois langues ne fuient pas davantage que le français -----------
// Les empreintes d'entité — raison sociale, registre, UID, e-mail, adresse — ne sont pas
// traduites : elles doivent rester absentes du site de l'autre société dans les trois langues.
// Le balayage complet reste français ; ici on cible les pages qui portent des données légales.
const ROUTES_LEGALES = [
  '/',
  '/contact',
  '/notre-equipe',
  '/impressum',
  '/mentions-legales',
  '/politique-de-confidentialite',
]

console.log('\n— Balayage anglais et allemand, entité affichée : Advisors')
for (const prefixe of ['/en', '/de']) {
  for (const route of ROUTES_LEGALES) {
    const chemin = `${prefixe}${route === '/' ? '' : route}`
    await afficher('advisors', chemin)
    const texte = await texteDeLaPage()
    const fuites = EMPREINTES.investments.filter((trace) => texte.includes(trace))
    check(
      `${chemin} : aucune trace d’Investments${fuites.length ? ` (${fuites.join(', ')})` : ''}`,
      fuites.length,
      0,
    )
  }
}

// --- 9. Sélecteur de langue : trois liens, vers les bons préfixes -----------
for (const [depuis, attendus] of [
  ['/contact', ['/en/contact', '/de/contact']],
  ['/en/contact', ['/contact', '/de/contact']],
  ['/de/finance', ['/finance', '/en/finance']],
]) {
  await aller(page, `${BASE}${depuis}`)
  const liens = await deroulant(SELECTEUR_LANGUE).liens()
  check(`langue depuis ${depuis} : deux liens`, liens.length, 2)
  check(`langue depuis ${depuis} : cibles`, liens.sort().join(' '), attendus.sort().join(' '))
}

await browser.close()

const failed = checks.filter((c) => !c.ok)
console.log(`\n${checks.length - failed.length}/${checks.length} vérifications passées`)
if (failed.length) process.exit(1)
