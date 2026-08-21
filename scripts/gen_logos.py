#!/usr/bin/env python3
"""Prépare les signatures des deux entités à partir des fichiers livrés par le client.

    pnpm logos:build   # content-source/logos/*.png -> src/assets/brand/*.webp

Le client a livré deux PNG, un par société, où le mot-symbole est suivi de la raison sociale.
Deux traitements sont nécessaires avant de pouvoir les poser sur le site.

**Détourage.** Les fichiers n'ont pas de couche alpha : ils montrent un damier de transparence
*aplati*, c'est-à-dire un fond blanc légèrement quadrillé. Posés tels quels sur l'en-tête, ils
apparaîtraient dans un rectangle blanc. L'opacité est donc reconstruite ici, à partir de deux
critères combinés — la clarté du pixel et sa chromie. Le second est indispensable : le bleu ciel
de la signature est presque aussi clair que certains gris du damier, et un seuil de clarté seul
le rendrait à moitié transparent.

**Version pour fond sombre.** L'en-tête du site est désormais un dégradé navy → royal : le navy
de la signature y disparaîtrait. Plutôt que de la retourner en blanc plein — ce qui écraserait
les deux encres en une seule — chaque pixel est reporté sur une échelle blanc → ciel selon sa
clarté d'origine. Le navy devient blanc, le ciel reste ciel : la signature garde ses deux tons.

Les quatre fichiers produits ne s'éditent pas à la main.
"""

from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image

RACINE = Path(__file__).resolve().parent.parent
SOURCE = RACINE / "content-source" / "logos"
CIBLE = RACINE / "src" / "assets" / "brand"

ENTITES = {
    "argentum-investments": "argentum-investments-source.png",
    "argentum-advisors": "argentum-advisors-source.png",
}

# --- Détourage -----------------------------------------------------------------------------
# Au-dessus de cette clarté, un pixel neutre est du fond. Les gris du damier livré descendent à
# 242 ; l'encre la plus claire de la signature est à 145.
FOND_CLARTE = 243
# Étendue sur laquelle l'opacité monte de 0 à 1. Couvre l'anti-crénelage des lettres.
FOND_ETENDUE = 93
# Un pixel coloré est de l'encre, quelle que soit sa clarté. Le damier est neutre, la signature
# ne l'est jamais : c'est ce qui sauve le bleu ciel d'un détourage au seul seuil de clarté.
# Le plancher écarte les gris du damier, qui dérivent d'une ou deux valeurs entre leurs canaux et
# recevraient sinon une opacité résiduelle — assez pour que le recadrage ne rogne plus rien.
CHROMIE_PLANCHER = 8
CHROMIE_ENCRE = 30

# --- Version pour fond sombre --------------------------------------------------------------
BLANC = (255, 255, 255)
# Ciel de la charte, remonté d'un cran : sur navy, la valeur nominale manque de présence.
CIEL_CLAIR = (130, 184, 255)
# Bornes de clarté entre lesquelles l'encre passe du blanc au ciel.
ENCRE_SOMBRE = 30
ENCRE_CLAIRE = 140

# Largeur de sortie. La signature est affichée à ~200 px de large ; 720 px couvre les écrans à
# plus de trois fois la densité sans embarquer les 1774 px du fichier source.
LARGEUR = 720
# Marge conservée autour du tracé, en pixels de la source.
MARGE = 8


def clarte(r: int, g: int, b: int) -> float:
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def borner(valeur: float, mini: float = 0.0, maxi: float = 1.0) -> float:
    return max(mini, min(maxi, valeur))


def detourer(image: Image.Image) -> Image.Image:
    """Reconstruit la couche alpha et retire le blanc du fond de chaque pixel."""
    pixels = list(image.convert("RGB").getdata())
    sortie = []

    for r, g, b in pixels:
        l = clarte(r, g, b)
        chromie = max(r, g, b) - min(r, g, b)
        alpha = borner(
            max((FOND_CLARTE - l) / FOND_ETENDUE, (chromie - CHROMIE_PLANCHER) / CHROMIE_ENCRE)
        )

        if alpha <= 0:
            sortie.append((0, 0, 0, 0))
            continue

        # Le pixel livré est l'encre composée sur du blanc : on la remonte à sa valeur pure,
        # sans quoi les bords resteraient laiteux une fois posés sur l'en-tête sombre.
        pur = tuple(int(borner((c - 255 * (1 - alpha)) / alpha, 0, 255)) for c in (r, g, b))
        sortie.append((*pur, int(round(alpha * 255))))

    detouree = Image.new("RGBA", image.size)
    detouree.putdata(sortie)
    return detouree


def eclaircir(image: Image.Image) -> Image.Image:
    """Reporte l'encre sur une échelle blanc → ciel, pour un fond sombre."""
    sortie = []

    for r, g, b, a in image.getdata():
        if a == 0:
            sortie.append((0, 0, 0, 0))
            continue

        t = borner((clarte(r, g, b) - ENCRE_SOMBRE) / (ENCRE_CLAIRE - ENCRE_SOMBRE))
        melange = tuple(int(round(BLANC[i] + (CIEL_CLAIR[i] - BLANC[i]) * t)) for i in range(3))
        sortie.append((*melange, a))

    claire = Image.new("RGBA", image.size)
    claire.putdata(sortie)
    return claire


def cadrer(image: Image.Image) -> Image.Image:
    """Recadre sur le tracé et ramène à la largeur de sortie."""
    boite = image.getchannel("A").point(lambda a: 255 if a > 8 else 0).getbbox()
    if boite is None:
        raise SystemExit("signature entièrement transparente : le détourage a tout mangé")

    gauche, haut, droite, bas = boite
    recadree = image.crop(
        (
            max(0, gauche - MARGE),
            max(0, haut - MARGE),
            min(image.width, droite + MARGE),
            min(image.height, bas + MARGE),
        )
    )

    hauteur = round(recadree.height * LARGEUR / recadree.width)
    return recadree.resize((LARGEUR, hauteur), Image.LANCZOS)


def main() -> int:
    if not SOURCE.is_dir():
        raise SystemExit(f"dossier source absent : {SOURCE}")
    CIBLE.mkdir(parents=True, exist_ok=True)

    for nom, fichier in ENTITES.items():
        chemin = SOURCE / fichier
        if not chemin.is_file():
            raise SystemExit(f"fichier livré absent : {chemin}")

        sombre = cadrer(detourer(Image.open(chemin)))
        claire = eclaircir(sombre)

        for suffixe, rendu in (("", sombre), ("-clair", claire)):
            destination = CIBLE / f"{nom}{suffixe}.webp"
            # Lossy à 92 : le sans-perte pèse dix fois plus pour un tracé qui ne dépasse jamais 220 px
            # à l'écran, et l'aplat de la signature ne montre pas d'artefact à ce niveau.
            rendu.save(destination, "WEBP", quality=92, method=6)
            poids = destination.stat().st_size / 1024
            print(f"  {destination.relative_to(RACINE)}  {rendu.width}×{rendu.height}  {poids:.0f} Ko")

    return 0


if __name__ == "__main__":
    sys.exit(main())
