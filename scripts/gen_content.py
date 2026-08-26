"""Genere les fichiers de contenu TypeScript du site Argentum a partir de blocks.json.

Chaque .odt du client devient un module `src/content/<langue>/<slug>.ts` exportant un PageContent.
Les mentions de la raison sociale deviennent le jeton %BRAND%, resolu a l'execution selon
l'entite active (Investments ou Advisors).

Trois langues. Le client a livre les memes vingt fiches en francais, en anglais et en allemand :
les slugs, l'ordre des pages et la structure des blocs sont donc communs, seuls changent le
fichier source, le libelle de menu et les quelques chaines que les retouches doivent reconnaitre.
C'est ce que decrit LOCALES.
"""
import json
import os
import re
import sys
import unicodedata

OUT = sys.argv[1]

BRAND_TOKEN = "%BRAND%"

# Paragraphes gardes dans le chapeau d'une fiche sans intertitre. Deux, comme l'accueil.
CRYPTO_LEAD = 2

# Ordre commun aux trois langues. Il fixe l'ordre du sous-menu Finance : par priorite
# commerciale decroissante, Crowdfunding en dernier.
SLUGS = [
    "accueil",
    "services",
    "services-immobilier",
    "finance",
    "financement-immobilier",
    "capital-investissement",
    "capital-risque",
    "investissements-start-up",
    "mezzanine-capital",
    "developpement-de-projets",
    "energies-renouvelables",
    "medecine-pharma",
    "solutions-technologiques-e-mobilite",
    "crowdfunding",
    "actifs-numeriques",
    "a-propos",
    "discretion",
    "notre-equipe",
    "mentions-legales",
    "impressum",
    "politique-de-confidentialite",
]

# slug -> (fichier source dans le dossier de la langue, libelle de menu).
# Les libelles viennent des titres que le client a lui-meme donnes a ses documents.
FR = {
    "accueil": ("Acceuil.odt", "Accueil"),
    "services": ("Services.odt", "Services"),
    "services-immobilier": ("Service.imobilier.odt", "Services immobilier"),
    "finance": ("Financement.odt", "Finance"),
    "financement-immobilier": ("Financement immobilier.odt", "Financement immobilier"),
    "capital-investissement": ("Capital-investissement.odt", "Capital-investissement"),
    "capital-risque": ("Ventuere Capital.odt", "Capital-risque"),
    "investissements-start-up": ("Investissements dans les start-up.odt", "Investissements start-up"),
    "mezzanine-capital": ("Mezzanine Capital.odt", "Mezzanine Capital"),
    "developpement-de-projets": ("Développement de projets.odt", "Développement de projets"),
    "energies-renouvelables": ("Énergies renouvelables.odt", "Énergies renouvelables"),
    "medecine-pharma": ("Médecine & Pharma.odt", "Médecine & Pharma"),
    "solutions-technologiques-e-mobilite": ("Solutions technologiques & E-Mobilité.odt",
                                            "Solutions technologiques & E-Mobilité"),
    "crowdfunding": ("Crowdfunding.odt", "Crowdfunding"),
    "actifs-numeriques": ("Actifs numériques & Cryptomonnaies.odt", "Digital Assets"),
    "a-propos": ("a propos.odt", "À propos"),
    "discretion": ("Discrétion & Confidentialité.odt", "Discrétion"),
    "notre-equipe": ("Notre Équipe.odt", "Notre équipe"),
    "mentions-legales": ("Mentions légales.odt", "Mentions légales"),
    "impressum": ("Mentions légales (Impressum).odt", "Impressum"),
    "politique-de-confidentialite": ("Politique de confidentialité.odt", "Politique de confidentialité"),
}

EN = {
    "accueil": ("HOMW.odt", "Home"),
    "services": ("Service.odt", "Services"),
    "services-immobilier": ("Service. Real Estate.odt", "Real Estate"),
    "finance": ("Financing odt..odt", "Financing"),
    "financement-immobilier": ("Real Estate Financing.odt", "Real Estate Financing"),
    "capital-investissement": ("Private Equity.odt", "Private Equity"),
    "capital-risque": ("Ventuere Capital.odt", "Venture Capital"),
    "investissements-start-up": ("Start-up Investments.odt", "Start-up Investments"),
    "mezzanine-capital": ("Mezzanine Capital.odt", "Mezzanine Capital"),
    "developpement-de-projets": ("Project Development.odt", "Project Development"),
    "energies-renouvelables": ("Renewable Energy.odt", "Renewable Energy"),
    "medecine-pharma": ("Medicine & Pharma.odt", "Medicine & Pharma"),
    "solutions-technologiques-e-mobilite": ("Technology Solutions & E-Mobility.odt",
                                            "Technology Solutions & E-Mobility"),
    "crowdfunding": ("Crowdfunding.odt", "Crowdfunding"),
    "actifs-numeriques": ("Digital Assets & Cryptocurrencies.odt", "Digital Assets"),
    "a-propos": ("About Us.odt", "About Us"),
    "discretion": ("Discretion & Confidentiality.odt", "Discretion"),
    "notre-equipe": ("Our Team.odt", "Our Team"),
    "mentions-legales": ("Legal Notice.odt", "Legal Notice"),
    "impressum": ("Legal Notice (Imprint).odt", "Imprint"),
    "politique-de-confidentialite": ("Privacy Policy.odt", "Privacy Policy"),
}

DE = {
    "accueil": ("Startseite.odt", "Startseite"),
    "services": ("Service.odt", "Services"),
    "services-immobilier": ("Service.Immobilien.odt", "Immobilien"),
    "finance": ("Finanzierung odt.odt", "Finanzierung"),
    "financement-immobilier": ("Immobilienfinanzierung.odt", "Immobilienfinanzierung"),
    "capital-investissement": ("Private Equity.odt", "Private Equity"),
    "capital-risque": ("Ventuere Capital.odt", "Venture Capital"),
    "investissements-start-up": ("Start-up Investments.odt", "Start-up Investments"),
    "mezzanine-capital": ("Mezzanine-Kapital.odt", "Mezzanine-Kapital"),
    "developpement-de-projets": ("Projektentwicklung.odt", "Projektentwicklung"),
    "energies-renouvelables": ("Erneuerbare Energien.odt", "Erneuerbare Energien"),
    "medecine-pharma": ("Medizin & Pharma.odt", "Medizin & Pharma"),
    "solutions-technologiques-e-mobilite": ("Technologie Solutions & Elektromobilität.odt",
                                            "Technologie Solutions & Elektromobilität"),
    "crowdfunding": ("Crowdfunding.odt", "Crowdfunding"),
    "actifs-numeriques": ("Digitale Vermögenswerte & Kryptowährungen.odt", "Digital Assets"),
    "a-propos": ("über uns.odt", "Über uns"),
    "discretion": ("Diskretion & Vertraulichkeit.odt", "Diskretion"),
    "notre-equipe": ("Unser Team.odt", "Unser Team"),
    "mentions-legales": ("Rechtliche Hinweise.odt", "Rechtliche Hinweise"),
    "impressum": ("Impressum.odt", "Impressum"),
    "politique-de-confidentialite": ("Datenschutzerklärung.odt", "Datenschutzerklärung"),
}

# Chaines que les retouches doivent reconnaitre ou produire, par langue.
# Celles marquees « ecrit par nous » n'existent dans aucun document client : ce sont les seules
# de ce fichier a avoir ete traduites par IA.
TEXTS = {
    "fr": {
        "hosting_label": "hébergement",
        "services_label": "Services effectivement",
        "updated_label": "Dernière mise à jour",
        "hosting_todo": "Prestataire d’hébergement à confirmer",          # ecrit par nous
        "services_term": "Services tiers utilisés :",                      # ecrit par nous
        "services_text": "Ce site n’utilise aucun service de mesure d’audience, aucune régie "
                         "publicitaire et aucun cookie de suivi. Seuls des cookies techniques "
                         "strictement nécessaires au fonctionnement du site sont déposés.",
        "updated_term": "Dernière mise à jour :",
        "updated_value": "août 2026",
        "team_title": "Notre équipe",
        "about_title": "À propos",
        "crypto_hint": "ne constituent ni un conseil",
        "crypto_todo": "Avertissement juridique de la fiche Digital Assets",
    },
    "en": {
        "hosting_label": "Hosting provider",
        "services_label": "Services actually used",
        "updated_label": "Last updated",
        "hosting_todo": "Hosting provider to be confirmed",                # ecrit par nous
        "services_term": "Third-party services used:",                     # ecrit par nous
        "services_text": "This website uses no analytics service, no advertising network and no "
                         "tracking cookies. Only technical cookies strictly necessary for the "
                         "operation of the website are set.",
        "updated_term": "Last updated:",
        "updated_value": "August 2026",
        "team_title": "Our Team",
        "about_title": "About Us",
        "crypto_hint": "do not constitute investment",
        "crypto_todo": "Legal disclaimer for the Digital Assets page — missing in the client document",
    },
    "de": {
        "hosting_label": "Hosting-Anbieter",
        "services_label": "Tatsächlich verwendete Dienste",
        "updated_label": "Stand:",
        "hosting_todo": "Hosting-Anbieter noch zu bestätigen",             # ecrit par nous
        "services_term": "Verwendete Dienste Dritter:",                    # ecrit par nous
        "services_text": "Diese Website verwendet keinen Analysedienst, kein Werbenetzwerk und "
                         "keine Tracking-Cookies. Es werden ausschliesslich technisch notwendige "
                         "Cookies gesetzt.",
        "updated_term": "Stand:",
        "updated_value": "August 2026",
        "team_title": "Unser Team",
        "about_title": "Über uns",
        "crypto_hint": "stellen weder eine Anlage",
        "crypto_todo": "Rechtlicher Hinweis der Digital-Assets-Seite — im Kundendokument nicht vorhanden",
    },
}

# Fiches maintenues a la main : la generation les laisse intactes.
# `fr/mezzanine-capital` est la seule fiche que le client avait livree en anglais dans le lot
# francais ; sa traduction a ete ecrite manuellement et serait perdue a chaque regeneration.
# Les versions anglaise et allemande, elles, sont de vraies fiches livrees : on les genere.
HAND_WRITTEN = {("fr", "mezzanine-capital")}

LOCALES = {
    "fr": {"dir": "", "pages": FR},
    "en": {"dir": "en", "pages": EN},
    "de": {"dir": "de", "pages": DE},
}


def detokenize(text):
    """Remplace la raison sociale par un jeton resolu selon l'entite active."""
    text = re.sub(r"Argentum\s+Investments\s+SA", BRAND_TOKEN, text)
    return re.sub(r"\bArgentum\s+Investments\b", BRAND_TOKEN, text)


def clean(node):
    if isinstance(node, str):
        return detokenize(node)
    if isinstance(node, list):
        return [clean(x) for x in node]
    if isinstance(node, dict):
        return {k: clean(v) for k, v in node.items()}
    return node


def normalize_levels(blocks):
    """Le premier titre du niveau le plus haut est le titre de page ; ses pairs sont des sections.

    Le niveau de reference est **calcule**, pas suppose. Le client ne titre pas ses documents de
    la meme facon dans les trois langues : `Diskretion & Vertraulichkeit.odt` ouvre sur un H2 et
    place ses sections en H3, la ou les versions francaise et anglaise ouvrent sur un H1 avec des
    sections en H2. Presumer H1 laissait la page allemande sans titre et decalait toutes ses
    sections d'un cran.

    Apres passage, les trois langues ont la meme forme : niveau 0 pour le titre, 2 pour les
    sections, 3 et au-dela pour les sous-sections.
    """
    niveaux = [b["level"] for b in blocks if b["type"] == "heading"]
    if not niveaux:
        return blocks

    base = min(niveaux)
    seen_title = False
    for b in blocks:
        if b["type"] != "heading":
            continue
        if b["level"] == base and not seen_title:
            seen_title = True
            b["level"] = 0  # titre de page
        elif b["level"] == base:
            b["level"] = 2
        else:
            b["level"] = 2 + (b["level"] - base - 1)
    return blocks


def to_page(slug, menu, blocks):
    """Regroupe les blocs plats en titre + chapeau + sections."""
    blocks = normalize_levels(blocks)
    title, lead, sections = None, [], []
    for b in blocks:
        if b["type"] == "heading":
            if b["level"] == 0:
                title = b["title"]
            else:
                sections.append({"title": b["title"], "level": b["level"], "blocks": []})
            continue
        if sections:
            sections[-1]["blocks"].append(b)
        elif b["type"] == "prose":
            lead.extend(b["paragraphs"])
        else:
            sections.append({"title": None, "level": 2, "blocks": [b]})
    return {"slug": slug, "menu": menu, "title": title, "lead": lead, "sections": sections}


# --- Retouches ciblees ------------------------------------------------------

def same_heading(a, b):
    """Compare deux titres en ignorant la casse et les accents.

    Le client ecrit « Notre Équipe » en intertitre et « Notre équipe » ailleurs : sans cette
    normalisation, le titre de page et l'intertitre s'afficheraient tous les deux.
    """
    def norm(value):
        if not value:
            return ""
        decomposed = unicodedata.normalize("NFD", value)
        stripped = "".join(c for c in decomposed if not unicodedata.combining(c))
        return " ".join(stripped.lower().split())

    return norm(a) == norm(b)


def patch_impressum(page, t):
    """L'identite legale vient de la config de marque, pas du texte fige du .odt."""
    for section in page["sections"]:
        section["blocks"] = [
            {"type": "legalIdentity"} if b["type"] == "items" else b
            for b in section["blocks"]
        ]
        # Le .odt titre la section avec la raison sociale, que le bloc d'identite repete
        # immediatement en dessous.
        if section["title"] == BRAND_TOKEN:
            section["title"] = None
    # Le dernier bloc reprend l'adresse en pied de page : le vrai footer s'en charge.
    last = page["sections"][-1]
    last["blocks"] = [b for b in last["blocks"] if b["type"] != "legalIdentity"]
    return page


def patch_privacy(page, t):
    """Responsable du traitement -> config de marque ; les autres trous sont documentes."""
    for section in page["sections"]:
        out = []
        for b in section["blocks"]:
            if b["type"] != "items":
                out.append(b)
                continue
            labels = " ".join(i["label"] for i in b["items"])
            if BRAND_TOKEN in labels:
                out.append({"type": "legalIdentity"})
            elif t["hosting_label"] in labels:
                out.append({"type": "todo", "note": t["hosting_todo"]})
            elif t["services_label"] in labels:
                out.append({"type": "definitions", "items": [{
                    "label": t["services_term"],
                    "text": t["services_text"],
                }]})
            elif t["updated_label"] in labels:
                out.append({"type": "definitions", "items": [
                    {"label": t["updated_term"], "text": t["updated_value"]}]})
            else:
                out.append(b)
        section["blocks"] = out
    return page


def patch_team(page, t):
    """La grille des partenaires est retiree du contenu genere.

    Le client n'a livre dans la fiche que des placeholders `[Prenom Nom]`. Les sept personnes
    reelles sont arrivees a part, dans `TEAM NAME.odt`, et vivent dans `src/config/equipe.ts` :
    la page les rend elle-meme, dans les trois langues, avec l'adresse resolue par entite.

    La fiche n'a pas de H1 : elle ouvre sur un H2 homonyme, dont le texte devient le chapeau de
    la page pour ne pas afficher deux fois le meme titre.
    """
    page["sections"] = [s for s in page["sections"] if s["level"] < 3]
    first = page["sections"][0] if page["sections"] else None
    if first and same_heading(first["title"], page["title"] or t["team_title"]):
        page["lead"] = [p for b in first["blocks"]
                        if b["type"] == "prose" for p in b["paragraphs"]]
        page["sections"] = page["sections"][1:]
    page["title"] = page["title"] or t["team_title"]
    # Ce qui reste est la section de placeholders : elle ne contient aucune donnee.
    page["sections"] = [s for s in page["sections"]
                        if not placeholders_seuls(s)]
    return page


def placeholders_seuls(section):
    """Vrai si la section ne contient que des gabarits `[...]` non remplis."""
    textes = []
    for b in section["blocks"]:
        if b["type"] == "prose":
            textes.extend(b["paragraphs"])
        elif b["type"] in ("items", "steps", "definitions"):
            textes.extend(i.get("label", "") + " " + i.get("text", "") for i in b["items"])
        elif b["type"] == "bullets":
            textes.extend(b["items"])
    return bool(textes) and all(t.strip().startswith("[") for t in textes if t.strip())


def patch_about(page, t):
    """Le .odt titre la page avec la raison sociale ; on garde un titre editorial."""
    page["title"] = t["about_title"]
    return page


def repartir(items, n):
    """Decoupe une liste en n groupes aussi egaux que possible, les plus gros d'abord."""
    if not items:
        return []
    taille, reste = divmod(len(items), n)
    groupes, debut = [], 0
    for i in range(n):
        fin = debut + taille + (1 if i < reste else 0)
        if fin > debut:
            groupes.append(items[debut:fin])
        debut = fin
    return groupes


# Nombre de sections illustrees visees pour la fiche Digital Assets. Le gabarit pose une
# photographie par section, cotes alternes : trois rangees donnent le rythme sans noyer un
# texte qui reste court.
CRYPTO_RANGEES = 3


def patch_actifs_numeriques(page, t):
    """
    Met en page une fiche que le client a livree sans le moindre intertitre.

    Les dix-neuf autres documents sont structures par des H2, et la generation en tire des
    sections. Celui-ci est un texte suivi : tel quel, ses sept premiers paragraphes tombaient
    dans le chapeau — qui en porte deux ailleurs sur le site — et le reste dans une section
    unique, donc une seule photographie possible. Aucun mot n'est touche ici, seule leur
    repartition l'est : deux paragraphes d'accroche, puis trois sections sans titre qui peuvent
    chacune porter une image.

    Second geste, l'avertissement. Le client a clos la version francaise par un paragraphe
    juridique mais l'a omis en anglais et en allemand. En francais il est isole dans son propre
    bloc, pour etre rendu comme les avertissements des autres fiches ; dans les deux langues ou
    il manque, un `todo` le signale sans rien inventer. Un avertissement juridique ne se traduit
    pas sans l'accord du client.
    """
    reste = page["lead"][CRYPTO_LEAD:]
    page["lead"] = page["lead"][:CRYPTO_LEAD]
    ajoutees = [{"title": None, "level": 2,
                 "blocks": [{"type": "prose", "paragraphs": groupe}]}
                for groupe in repartir(reste, CRYPTO_RANGEES)]
    page["sections"] = ajoutees + page["sections"]

    blocs = page["sections"][-1]["blocks"]
    for i, bloc in enumerate(blocs):
        if bloc["type"] != "prose":
            continue
        avert = [p for p in bloc["paragraphs"] if t["crypto_hint"] in p]
        if not avert:
            continue
        bloc["paragraphs"] = [p for p in bloc["paragraphs"] if p not in avert]
        blocs.insert(i + 1, {"type": "disclaimer", "paragraphs": avert})
        return page

    blocs.append({"type": "todo", "note": t["crypto_todo"]})
    return page


PATCHES = {
    "impressum": patch_impressum,
    "politique-de-confidentialite": patch_privacy,
    "notre-equipe": patch_team,
    "a-propos": patch_about,
    "actifs-numeriques": patch_actifs_numeriques,
}

BANNER = ("// Généré depuis le contenu client (.odt) — ne pas éditer à la main.\n"
          "// Source : {src}\n"
          "// %BRAND% est résolu à l’exécution selon l’entité active.\n")


def ident_of(slug):
    return re.sub(r"[^a-z0-9]+", "_", slug)


def generate(locale, data):
    conf = LOCALES[locale]
    out_dir = os.path.join(OUT, locale)
    os.makedirs(out_dir, exist_ok=True)
    prefix = f"{conf['dir']}/" if conf["dir"] else ""
    t = TEXTS[locale]

    written, skipped, missing = 0, [], []
    for slug in SLUGS:
        src, menu = conf["pages"][slug]
        key = f"{prefix}{src}"

        if (locale, slug) in HAND_WRITTEN:
            skipped.append(slug)
            continue
        if key not in data:
            missing.append(key)
            continue

        page = to_page(slug, menu, clean(data[key]))
        if slug in PATCHES:
            page = PATCHES[slug](page, t)
        body = json.dumps(page, ensure_ascii=False, indent=2)
        with open(os.path.join(out_dir, f"{slug}.ts"), "w") as fh:
            fh.write(f"{BANNER.format(src=key)}import type {{ PageContent }} from '../types'\n\n"
                     f"export const {ident_of(slug)}: PageContent = {body}\n")
        written += 1

    with open(os.path.join(out_dir, "index.ts"), "w") as fh:
        fh.write(f"// Généré — registre des pages de contenu ({locale}).\n")
        for slug in SLUGS:
            fh.write(f"import {{ {ident_of(slug)} }} from './{slug}'\n")
        fh.write("\nimport type { PageContent } from '../types'\n\n")
        fh.write("export const pages = {\n")
        for slug in SLUGS:
            fh.write(f"  '{slug}': {ident_of(slug)},\n")
        fh.write("} satisfies Record<string, PageContent>\n")

    return written, skipped, missing


def main():
    data = json.load(open(os.path.join(os.path.dirname(__file__), "blocks.json")))
    for locale in LOCALES:
        written, skipped, missing = generate(locale, data)
        note = f"{locale} : {written} pages générées"
        if skipped:
            note += f" ; conservées à la main : {', '.join(skipped)}"
        if missing:
            note += f" ; SOURCE INTROUVABLE : {', '.join(missing)}"
        print(note)


if __name__ == "__main__":
    main()
