@AGENTS.md

> Les **standards EkoMedia** (plugin `ekomedia-os`) s'appliquent : réponses en français, aucun
> processus en arrière-plan, aucun secret commité, aucun contenu inventé. Les règles ci-dessous
> les complètent et priment en cas de conflit.
>
> Skills utiles ici : `nextjs-quality` avant livraison, `seo-ekomedia` si le no-index est un jour
> levé, `session-memory` en fin de session. Commandes : `/qa`, `/score`.

# Argentum — site double marque

Site vitrine d'un groupe d'investissement genevois. **Un seul code, deux noms de domaine, deux
sociétés anonymes réellement distinctes**, que le client déploie sur deux serveurs. Livré en
français, en anglais et en allemand. Site entièrement en no-index, à la demande du client.

Serveur de dev sur le port 3000.

## La règle qui structure tout le projet

Rien de ce qui identifie une société ne s'écrit en dur. Raison sociale, numéro de registre, UID,
adresse, e-mail, secteur d'activité, palette : tout vient de `src/brand/brands.ts`.

| | Investments | Advisors |
|---|---|---|
| Domaine | argentuminvestments.ch | argentumadvisors.ch |
| Registre du commerce | CH-660.0.244.019-9 | CH-660.0.242.019-2 |
| Fiche Moneyhouse | `/en/company/argentum-investments-sa-4141745391` | `/de/company/argentum-advisors-sa-20144934951` |
| | *URL fournies par le client, langues différentes assumées : ce sont deux sociétés distinctes, pas deux versions d'une même page.* | |
| UID | CHE-134.341.014 | **non communiqué** |
| Adresse | Avenue Marc-Doret 14A, 1224 Chêne-Bougeries | **non communiquée** |
| Secteur | Exploitation de sociétés d'investissement | Prestations de services pour banques et établissements de crédit |
| E-mail | contact@argentuminvestments.ch | contact@argentumadvisors.ch |
| Thème | clair | sombre |

Aucune des deux sociétés n'a de numéro de téléphone : **ne jamais ajouter de champ téléphone**
pour l'entreprise. Le champ téléphone du formulaire concerne le visiteur, c'est différent.

Un champ à `null` dans la config est une donnée manquante : le rendu **omet la ligne**. Ne jamais
la remplir par déduction — une adresse supposée sur un Impressum suisse est une mention légale
fausse.

Écrire `Argentum Investments SA` dans une page produirait une mention fausse sur l'autre domaine.
Dans le contenu, la raison sociale est le jeton `%BRAND%`, résolu par `resolveBrandText()`.

### Comment l'entité active est déterminée

**Domaine Argentum réel > cookie > nom d'hôte approchant > Investments.**
Voir `src/brand/resolve.ts` et `src/proxy.ts` (en Next.js 16, `proxy.ts` remplace `middleware.ts`).

En production, seul le premier niveau joue : chaque domaine sert sa société.
`strictBrandFromHost()` tranche — correspondance exacte du domaine enregistré, `www.` et port
compris. `brandFromHost()`, qui accepte large (`advisors.vercel.app`), ne sert **pas** à décider
qui fait autorité.

Le cookie n'est plus écrit par l'interface depuis que la bascule redirige. Il reste lu, et c'est
le seul levier qui permet d'afficher l'autre entité hors des vrais domaines : `pnpm check:brand`
s'en sert pour balayer les deux sociétés sur `localhost`.

### Bascule : le clic mène à l'autre domaine

**Le sélecteur d'entité redirige, toujours** (`src/brand/useBrandSwitch.ts`). Chaque société a son
nom de domaine et le client déploie le site sur deux serveurs : le bouton de l'entité inactive est
un `<a href="https://argentumadvisors.ch{chemin courant}">`. Il n'y a plus de bascule sur place,
et donc plus d'écart entre ce que fait la recette et ce que fera la production.

| Où | Comportement |
|---|---|
| Production, préproduction, `localhost` | `<a>` vers l'autre domaine, même chemin |
| Export statique GitHub Pages | Lien vers l'export voisin (`actions.statique.ts`) |

L'export statique est la seule exception : aucun des deux domaines ne le sert, y rediriger
casserait la préproduction envoyée au client. Il se reconnaît à `NEXT_PUBLIC_EXPORT_STATIQUE=1`,
posé par `.github/workflows/pages.yml`.

**Pour travailler Advisors en local**, figer la marque au démarrage plutôt que de cliquer — un
clic quitterait le serveur de développement :

```
NEXT_PUBLIC_MARQUE_STATIQUE=advisors pnpm dev
```

Le chemin du lien vient de `usePathname()` et non de `window.location` : `hrefFor()` est appelé
pendant le rendu, y compris côté serveur.

Les deux boutons portent la **raison sociale complète**, découpée sur deux lignes par
`splitLegalName()`. « Investments » seul ne désigne aucune société.

`pnpm check:brand` vérifie la chaîne complète dans un vrai navigateur : thème, raison sociale,
mentions légales, persistance. **À relancer après toute modification du système de marque.**

## Trois langues : français, anglais, allemand

Le client a livré ses vingt fiches dans les trois langues le 23 août 2026. Tout le contenu
éditorial est donc **traduit par lui** ; seuls les libellés d'interface que nous avons écrits
nous-mêmes ont été traduits par IA, et ils vivent tous dans `src/i18n/ui.ts`.

**Français à la racine, préfixe pour les autres.** `/contact`, `/en/contact`, `/de/contact`. Les
pages vivent sous `src/app/[locale]/` et `src/proxy.ts` réécrit `/contact` en `/fr/contact` sans
que l'adresse change ; `/fr/...` est redirigé en 308 vers la forme sans préfixe, pour qu'une page
n'ait jamais deux adresses. **Les slugs restent français dans les trois langues** (`/en/a-propos`) :
une table de correspondance par page serait sans gain tant que le site est en no-index.

`src/i18n/locales.ts` porte le schéma d'URL, `src/i18n/ui.ts` les libellés, `src/i18n/server.ts`
la lecture de la langue. **`getLocale()` s'appuie sur `next/root-params`** : le segment `[locale]`
précédant la mise en page racine, n'importe quel composant serveur lit la langue sans qu'elle lui
soit passée en props — comme `getBrand()` lit l'entité. Les composants **clients** ne peuvent pas
l'utiliser : eux reçoivent `locale` et `strings` en props.

**`LOCALES_DISPONIBLES` est l'interrupteur.** Le sélecteur affiche les trois langues et ne rend
cliquables que celles de cette liste. En retirer une la grise sans rien casser.

### Ce à quoi il faut faire attention

- **`src/i18n/ui.ts` ne contient aucun contenu client.** Si un texte vient d'un `.odt`, sa place
  est dans `src/content/<locale>/`, pas ici. Deux exceptions assumées et documentées dans le
  fichier : les intitulés légaux, repris des trois Impressum du client, et les deux intitulés de
  groupe de la page Équipe.
- **Le type se charge de la complétude.** `UIStrings` est déduit de l'objet français : ajouter une
  clé sans la traduire dans les deux autres langues fait échouer `tsc`.
- **Les valeurs du formulaire ne sont pas traduites**, seulement leurs libellés. Le `<select>`
  porte `energies-renouvelables` ou `2-5`, jamais le texte affiché — sinon le schéma de validation
  aurait dû énumérer trente libellés et la demande reçue par le client aurait changé de vocabulaire
  selon la langue du visiteur.
- **Le message reçu par le client reste en français**, dans les trois cas, avec la langue du
  visiteur en clair. C'est une boîte unique : un format constant s'y dépouille plus vite que trois.
  L'accusé de réception envoyé au visiteur, lui, est dans sa langue.
- **L'export statique préfixe aussi le français.** Il n'a pas de proxy pour masquer `/fr`, d'où
  `NEXT_PUBLIC_EXPORT_STATIQUE=1` et le drapeau `PREFIXE_TOUJOURS` de `locales.ts`.
- Les balises `alternate` ne sont pas posées : elles n'ont de sens que si le no-index est levé.

## Le contenu vient du client, il ne s'invente pas

Les fiches `.odt` sont archivées dans `content-source/` : le français à la racine, l'anglais dans
`en/`, l'allemand dans `de/`. Vingt fiches par langue. Elles sont converties en modules TypeScript
par un pipeline en deux étapes :

```
pnpm content:extract   # content-source/**/*.odt -> scripts/blocks.json
pnpm content:build     # scripts/blocks.json     -> src/content/{fr,en,de}/*.ts
```

Les documents sont indexés par leur **chemin relatif** (`en/Crowdfunding.odt`), pas par leur nom :
les trois langues emploient les mêmes noms de fichiers.

**`src/content/<langue>/*.ts` est généré : ne pas l'éditer à la main.** Pour corriger un texte,
corriger le `.odt` puis relancer le pipeline, ou ajouter une retouche ciblée dans `PATCHES`
(`scripts/gen_content.py`). Le modèle de contenu (`src/content/types.ts`) et le registre d'images
(`src/content/fiche-images.ts`) sont communs aux trois langues : ils ne vivent pas dans un dossier
de langue.

Seule exception : `src/content/fr/mezzanine-capital.ts` est écrit à la main — le client avait
livré cette fiche en anglais dans le lot français, et sa traduction a été faite manuellement. Elle
est listée dans `HAND_WRITTEN` et le générateur ne l'écrase pas. Les versions anglaise et
allemande, elles, sont de vraies fiches livrées : elles sont générées.

**Le niveau de titre n'est pas présumé.** Le client ne titre pas ses documents de la même façon
d'une langue à l'autre — `Diskretion & Vertraulichkeit.odt` ouvre sur un H2 quand ses homologues
ouvrent sur un H1. `normalize_levels()` calcule le niveau de référence au lieu de supposer H1 ;
sans cela la page allemande sortait sans titre.

## Données que le client doit encore fournir

- **UID et adresse d'Argentum Advisors SA.** Arbitré : rien ne s'affiche tant qu'on ne les a pas.
- **Deux fonctions identiques et une adresse fautive dans `TEAM NAME.odt`.** Gabriel Silver et
  Matthias Bergman y portent tous deux « Chief Financial Officer », et l'adresse Advisors de ce
  dernier s'écrit `mathhias.bergman` là où celle d'Investments dit `matthias.bergman`. Repris tel
  quel pour la fonction ; l'adresse suit l'orthographe du nom. À faire confirmer.
- **« Cinq partenaires » contre sept personnes.** Les fiches À propos des trois langues annoncent
  cinq investisseurs et partenaires actifs ; le document équipe en liste sept. La contradiction est
  dans le contenu client, dans les trois langues à la fois.
- **Prestataire d'hébergement**, pour la politique de confidentialité (bloc `todo`, invisible en
  production).
- **Validation de la traduction** de Mezzanine Capital.
- **Identifiants SMTP** (`.env.example`), sans lesquels le formulaire invite à écrire directement.

## Décisions déjà arbitrées — ne pas les rouvrir

- **Les 6 images fournies sont utilisées telles quelles**, sur décision du client, malgré mon
  signalement qu'elles proviennent du tourisme genevois et de la banque de détail, et que les
  droits de deux d'entre elles ne sont pas vérifiables. La page Discrétion est volontairement la
  seule sans photographie : une image de lieu ou de foule y contredirait le propos.
- **Ordre du sous-menu Finance** : par priorité commerciale décroissante, Crowdfunding en dernier
  parce que la fiche dit elle-même que la levée de fonds publique n'est pas au cœur de l'approche.
- **La vidéo du hero (14 Mo) n'est jamais chargée d'office** : seulement sur écran large et hors
  `prefers-reduced-motion`. Ailleurs, l'image d'affiche suffit. À recompresser quand `ffmpeg` sera
  disponible.

### Fiche au registre sur la page Contact

Sous le numéro de registre, `LegalIdentity` affiche un lien Moneyhouse — **uniquement celui de la
société affichée** (`registryLink`). Arbitré le 19 août 2026 : renvoyer aussi vers l'autre société
mélangerait deux personnes morales que tout le reste du site sépare. Ne pas rouvrir.

## L'équipe : sept personnes, sans photographie

Le client a livré `content-source/TEAM NAME.odt` le 23 août 2026. Les sept personnes vivent dans
`src/config/equipe.ts`, **écrit à la main** — le document est une liste plate séparée par des
tirets, sans la structure de titres que `odt2blocks.py` sait lire. La fiche `.odt` de la page
Équipe, elle, ne contenait que des placeholders : `patch_team` les retire dans les trois langues.

**L'adresse e-mail ne porte que sa partie locale.** Le client en a livré deux par personne, une
par entité ; les écrire toutes les deux violerait la règle du projet. Le domaine vient de
`brand.domain`, comme partout ailleurs.

**Aucune photographie n'a été fournie** : l'avatar est le disque des deux initiales. Ne pas y
mettre d'image d'agence — elle ferait passer pour un collaborateur quelqu'un qui ne l'est pas.

La casse des noms est normalisée à l'affichage : le document alterne « ANDREW SILVER »,
« Matthias BERGMAN » et « Simon Adelstein ».

**« Andrew Silver » n'est plus une empreinte d'Investments** dans `check:brand`. Il est
représentant autorisé d'Investments au registre *et* CEO du groupe, donc présent sur la page
Équipe des deux sociétés. Ce qui engage l'entité est la ligne « Représentant autorisé » du bloc
d'identité légale, vérifiée à part.

## Images

**Toutes les images sont en WebP.** Les PNG d'origine pesaient jusqu'à 5 Mo pièce : en rendu
serveur Next les optimise, mais l'export statique GitHub Pages est en `images: { unoptimized: true }`
et servait le fichier brut. Ne jamais rajouter un PNG ou un JPEG dans `src/assets/images/`.

### La signature nomme la société

**Livrée le 20 août 2026 : une signature par entité**, « ARGENTUM INVESTMENTS » et « ARGENTUM
ADVISORS ». Elle a donc rejoint la règle du projet — elle suit la bascule comme la raison sociale,
et afficher la mauvaise sur un domaine serait la même faute que d'y écrire le mauvais nom.

Quatre fichiers, **générés** depuis les deux PNG livrés (archivés dans `content-source/logos/`) :

```
pnpm logos:build   # content-source/logos/ -> src/assets/brand/*.webp
```

Deux traitements que `scripts/gen_logos.py` documente en détail et qu'il ne faut pas refaire à la
main : les fichiers livrés n'ont **pas de couche alpha** — ils montrent un damier de transparence
aplati, donc un fond blanc — et l'en-tête sombre exige une version où le navy passe au blanc
pendant que le ciel reste ciel. Un `filter: brightness(0) invert(1)`, qui était l'ancienne
solution, écrase les deux encres en une seule : ne pas y revenir.

`Logo` prend l'entité **et le fond sur lequel il est posé** (`clair` / `sombre`). L'en-tête lit
l'entité sur `<html data-brand>` via `useBrandActif`, pour basculer au clic sans attendre le
rendu serveur ; le pied de page, rendu sur le serveur, prend simplement `brand.key`.

### Les dix dossiers du client

Le client a livré 96 photographies rangées par domaine d'investissement, une par fiche Finance
(`src/assets/images/fiches/<slug>/`). Le registre TypeScript est **généré** :

```
pnpm images:build   # src/assets/images/fiches/ -> src/content/fr/fiche-images.ts
```

`src/content/fr/fiche-images.ts` ne s'édite pas à la main. L'orientation de chaque image y est
déduite de son rapport et décide de son cadrage : une verticale ne peut pas faire un bandeau.

### Qui va où

`src/config/images-pages.ts` — écrit à la main, c'est le seul endroit qui décide. Il porte
l'image d'ouverture de chaque page, la vignette de chaque domaine sur le sommaire Finance, et,
pour les pages sans dossier propre (accueil, services, à propos, discrétion, notre équipe), la
liste des emprunts. Une image ne sert qu'une fois par domaine : `imagesDeCorps()` retire du
dossier l'ouverture de la fiche **et** sa vignette de sommaire.

`src/components/media/plan-images.ts` attribue ensuite une photographie aux sections qui peuvent
en porter une, en alternant les côtés. La logique est séparée du rendu et **testée**
(`plan-images.test.ts`) — c'est elle qui garantit qu'aucune image ne sert deux fois sur une page
et que deux rangées consécutives ne penchent pas du même bord.

### Le gabarit : une rangée texte–image, jamais un paquet d'images

**Décision du 20 août 2026, à ne pas rouvrir.** Les figures superposées (une vignette flottant
sur une grande image) et empilées (trois images côte à côte) ont été retirées de tout le site :
elles produisaient des paquets d'images posés entre deux pavés de texte, sans rapport avec ce qui
était écrit juste au-dessus. Ne pas les réintroduire sous une autre forme.

Une section illustrée est désormais une rangée `RangeeAlternee` — paragraphe d'un côté,
photographie de l'autre, les côtés alternant d'une rangée à la suivante. Deux points de mise en
page à connaître avant d'y toucher :

- **La photographie court jusqu'au bord de la fenêtre**, sans coin arrondi ni ombre. La rangée est
  une grille en deux moitiés posée sur toute la largeur du document, pas un contenu de
  `Container`.
- **La colonne de texte reste alignée sur la grille du site** grâce à une boîte de
  `--container-page / 2` poussée contre le milieu de la rangée. **Ne pas repasser par `100vw`**
  pour recalculer cet alignement : `100vw` compte la barre de défilement et décale le texte de
  quelques pixels par rapport à `Container`. Le gouttière commune est `--page-gutter`
  (`globals.css`), qui reprend les valeurs de `Container` (1,5 / 2 / 3 rem).

Une section qui porte une grille de critères ou un processus numéroté (`items`, `steps`) reste en
pleine largeur et sans image : repliée dans une demi-page, elle devient illisible. C'est
`peutPorterUneImage()` dans `PageBody` qui tranche.

### Personnes identifiables — audit du 23 août 2026

Les 96 photographies du client ont été passées en revue une à une, dossier par dossier. Quatre
montrent des personnes **identifiables de face**. Elles sont retirées du site par
`IMAGES_RETIREES` (`src/config/images-pages.ts`), qui filtre l'ouverture, la vignette de sommaire
et le corps de page — un retrait ne peut donc pas être contourné par un emprunt.

| Image | Ce qu'on y voit |
|---|---|
| `investissements-start-up-4` | Femme de face, nette, derrière un pupitre |
| `capital-investissement-2` | Femme de profil devant un ordinateur |
| `capital-investissement-3` | Homme de face, en pied |
| `crowdfunding-9` | Sept personnes autour d'une table de réunion |

**Armando n'avait pas traité ce lot.** Son commit `7af654a fix: remove visible people from site
imagery` (21 août) n'a touché que les six images d'ouverture que nous avions choisies nous-mêmes —
accueil, à propos, contact, notre équipe, immobilier, services. Les 96 photographies du client
n'ont jamais été auditées avant le 23 août.

Trois cas limites sont **restés en place**, à trancher avec le client : `capital-investissement-1`
(poignée de main, visages hors cadre), `capital-investissement-10` (femme, cadrage coupé au
menton) et `solutions-technologiques-e-mobilite-4` (conducteur de train vu de dos). Aucun visage
n'y est reconnaissable ; les retirer priverait la page Services de son registre humain.

Deux images non rendues aujourd'hui porteraient le même problème si elles étaient rappelées :
`medecine-pharma-10` (techniciens de laboratoire, masqués) et
`solutions-technologiques-e-mobilite-10` (plaque d'immatriculation lisible).

### Marques tierces lisibles — à trancher avec le client

Certaines photographies fournies montrent une enseigne ou une personne identifiable. Elles sont
**restées sur la fiche pour laquelle le client les a livrées** et sont **exclues des pages
composées**, où le choix était libre. Les afficher suggère une relation d'affaires qui n'existe
pas :

| Fiche | Images | Ce qui est lisible |
|---|---|---|
| crowdfunding | 7 | Agence **UBS**, logo en façade |
| crowdfunding | 1, 3, 5 | Banque nationale suisse, Bourse **SIX**, Paradeplatz |
| capital-investissement | 4, 5 | **Schweizerische Nationalbank**, **Prime Tower** |
| medecine-pharma | 8, 9 | **Lonza**, lettrage en façade |
| solutions-technologiques-e-mobilite | 6 | Borne de recharge **MOVE** |
| solutions-technologiques-e-mobilite | 9, 10 | Véhicules de marque identifiables |
| investissements-start-up | 9 | **Campus Biotech**, lettrage |
| capital-investissement | 8 | **LGT Bank**, enseigne — repérée le 23 août 2026 |
| crowdfunding | 10 | **Julius Bär**, enseigne — repérée le 23 août 2026 |

Le retrait de l'une d'elles se fait en une ligne dans `src/config/images-pages.ts`.

`capital-investissement-8` (LGT Bank) illustrait la page **Notre équipe**, ce qui contredisait la
règle « aucune marque tierce sur les pages composées ». Elle a été remplacée par
`capital-risque-2` le 23 août 2026. `capital-investissement-3` a été remplacée sur **Services**
par `mezzanine-capital-7` le même jour, pour la raison ci-dessus.

### Textes alternatifs

L'image d'ouverture de chaque page porte un `alt` rédigé d'après ce que la photographie montre.
Les images de corps portent un `alt` vide et `aria-hidden` : elles accompagnent un texte qui dit
déjà ce qu'elles illustrent. C'est la règle pour une image décorative, pas un oubli.

### Pages juridiques

Impressum, mentions légales et politique de confidentialité n'ont **qu'une image d'ouverture**,
volontairement. Des photographies intercalées entre les clauses d'une politique de
confidentialité desservent le propos. Décision à rouvrir avec le client, pas un oubli.

## Mouvement

Trois effets, tous conditionnés à `prefers-reduced-motion` :

- `MotionLayer` — apparition des blocs au défilement (`data-reveal`) et parallaxe des images
  (`data-parallax`, valeur = amplitude en % de la hauteur). Un seul observateur pour toute la
  page : les composants restent rendus sur le serveur, ils ne font que poser des attributs.
- `CursorGlow` — halo WebGL qui suit le pointeur, `three` en **import dynamique** pour rester
  hors du bundle initial. Ne s'active pas au tactile ni sans WebGL. La boucle de rendu s'arrête
  quand le halo a rattrapé le pointeur. Le fragment shader est en `highp`, dessine une gaussienne
  plutôt qu'un `smoothstep` et ajoute un tramage d'un demi-niveau : les trois évitent les anneaux
  concentriques qui faisaient paraître le halo pixellisé. **Ne pas repasser en `mediump`.**
- `RangeeAlternee` et `BandeauImage` (`src/components/media/`) — **aucun n'est un composant
  client** : ils posent des attributs `data-parallax` que `MotionLayer` anime, les pages restent
  rendues sur le serveur.

La parallaxe joue sur une couche découpée par son conteneur, agrandie à 1,2 par `--parallax-zoom`
pour absorber son déplacement — sans cette marge, un vide apparaîtrait en haut ou en bas. Le
survol d'une rangée cliquable n'utilise pas la transformation, déjà prise par la parallaxe : c'est
le voile de marque qui s'efface.

Le CSS correspondant vit sous `html[data-motion='on']`, posé par `MotionLayer` : **sans
JavaScript, aucune règle d'opacité ne s'applique et la page s'affiche entière.** Ne jamais
masquer un bloc par défaut sans cette condition.

Le filet de sécurité de `MotionLayer` ne révèle tout que si l'observateur n'a **rien** révélé au
bout de 1,5 s. Une version antérieure révélait tout inconditionnellement, ce qui neutralisait
l'apparition au défilement passé ce délai.

## Ce qui sépare visuellement les deux entités

**La palette reste à quatre couleurs**, décision client (`src/styles/ekomedia-tokens.css`).
L'écart entre Investments et Advisors se creuse sans teinte nouvelle : profondeur du fond
(blanc contre navy-950), rôle de la couleur de marque (royal contre ciel), teinte des filets, et
traitement photographique opposé (`.brand-media` — Investments ouvre les images, Advisors les
referme sur le navy). Toute demande de « plus de couleurs » revient sur cet arbitrage : la
reposer au client avant d'ajouter quoi que ce soit.

### L'en-tête est sombre sur les deux entités

**Décision client du 20 août 2026 : l'en-tête blanc a été refusé, jugé monocouleur.** La barre,
le panneau déroulant et le tiroir mobile sont désormais sombres sur les deux marques —
`--header-bg` est un dégradé navy → royal, `--menu-bg` un aplat, `--header-line` un filet ciel.
La demande de « quelque chose de plus coloré » a été servie **sans teinte nouvelle** : le dégradé
traverse trois des quatre couleurs de la charte. L'arbitrage sur la palette tient toujours.

Conséquences à connaître avant de toucher à `Header.tsx` :

- **Aucun jeton de thème ne s'applique dans la barre.** Sur le thème clair, `text-text` y sortirait
  navy sur navy. Les couleurs sont fixées en blanc et en ciel explicitement.
- **La navigation déployée commence à `xl` (1280 px), pas à `lg`.** La barre porte sept entrées et
  trois contrôles — signature, entité, langue : en dessous, elle débordait. En dessous de 1280 px
  tout passe par le tiroir. Les libellés portent `whitespace-nowrap` : sans lui, « À propos » se
  coupait en deux lignes dès que la barre se resserrait.
- L'entité active du sélecteur est marquée au **ciel**, pas au blanc : un pavé blanc dans une
  barre sombre était précisément ce que le client refusait.
- `useBrandSwitch` est tenu par `Header`, pas par `BrandSwitcher`. L'en-tête affiche **deux**
  sélecteurs — la barre et le tiroir mobile — qui doivent réagir ensemble au même clic. Le
  composant est une vue pure qui reçoit les commandes.
- La classe `.on-dark` a disparu : elle ne servait qu'au retournement de l'ancien logo.

## Pièges rencontrés sur ce projet

**Les règles d'éléments CSS doivent rester dans `@layer base`.** Écrites hors couche dans
`globals.css`, elles battent toutes les classes utilitaires de Tailwind : un `text-white` sur un
titre posé au-dessus d'une photographie n'a alors aucun effet, et les titres sortent navy sur
navy. Le bug a touché tous les fonds sombres du site avant correction.

**Ne pas passer une classe qui entre en conflit avec la base d'un composant.** `hidden` passé à un
composant dont la racine porte `inline-flex` ne masque rien — l'ordre dans la feuille décide. Pour
masquer, envelopper ; pour changer une couleur, ajouter une variante au composant. Les variantes
`solidOnDark` et `ghostOnDark` de `Button` existent pour les fonds photographiques, où aucun jeton
de thème ne s'applique.

**`innerText` sur un nœud cloné détaché retombe sur `textContent`** et rapporte alors le contenu
des `<script>` — dont la charge utile RSC de Next, qui nomme les deux sociétés. Le balayage de
`check:brand` masque les blocs et lit `document.body.innerText` sur la page vivante. Un seul bloc
nomme volontairement les deux sociétés et porte `data-names-both-entities` : la section « deux
sociétés » de l'accueil.

## Pas de sitemap, volontairement

`fscore` signalera toujours l'absence de sitemap. C'est correct : le site est en no-index total,
un sitemap proposerait aux moteurs des URL qu'on leur interdit par ailleurs. Ne pas « corriger »
cet avertissement. `src/content/site-spec.json` documente la décision.

## Carte du site

`src/content/site-spec.json` est **généré** depuis la navigation et le registre de contenu
(`pnpm content:spec`), pour ne pas diverger du code. Le régénérer après toute modification de la
navigation.

## Contrôles avant livraison

```
pnpm typecheck && pnpm lint && pnpm test && pnpm build
pnpm check:brand     # bascule d'entité dans un vrai navigateur — serveur de dev requis
pnpm check:shots     # captures dans .screenshots/
```

`pnpm test` couvre la résolution d'entité et les invariants du contenu **dans les trois langues** :
aucune raison sociale en dur, aucun placeholder du document source, parallélisme des slugs,
cohérence de la navigation, schéma d'URL.

`pnpm check:brand` va plus loin que son nom : il balaye les quatorze routes françaises et les
pages légales anglaises et allemandes, vérifie que le sélecteur d'entité pointe vers le bon
domaine, que les sept adresses de l'équipe suivent l'entité affichée, et que le sélecteur de
langue vise les bons préfixes. 140 vérifications.
