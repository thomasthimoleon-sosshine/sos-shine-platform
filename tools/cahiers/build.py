# -*- coding: utf-8 -*-
"""Refait la couverture des cahiers 2 à 7 sur le modèle du cahier 1.
Le modèle est réutilisé tel quel (logo, ornement, signature, photo, pied de page) :
seuls le titre et le sous-titre sont retirés puis réécrits."""
import pymupdf, os

UP = '/root/.claude/uploads/5685289d-11de-5496-9164-79137260751a/'
MODELE = UP + 'b714f296-SOS_Shine__01__LAmourPropre.pdf'

# Repères relevés sur la couverture modèle
TITRE_TAILLE   = 33.0
TITRE_BASE     = 198.1          # ligne de base du titre sur une seule ligne
TITRE_INTER    = 44.0           # interligne si le titre tient sur deux lignes
SOUS_TAILLE    = 22.0
SOUS_BASES     = (337.1, 367.8)
CENTRE         = 297.75
LARGEUR_MAX_T  = 440.0
LARGEUR_MAX_S  = 470.0
ZONES_A_EFFACER = [
    (134.0, 160.0, 462.0, 214.0),   # titre
    (93.0, 309.0, 512.0, 346.0),    # sous-titre ligne 1
    (93.0, 340.0, 512.0, 377.0),    # sous-titre ligne 2
]

CINZEL   = 'Cinzel-Bold.ttf'
PLAYFAIR = 'Playfair-Regular.ttf'
f_titre  = pymupdf.Font(fontfile=CINZEL)
f_sous   = pymupdf.Font(fontfile=PLAYFAIR)

CAHIERS = [
    ('a0044f72-02_Dependance_Affective.pdf', '02_Dependance_Affective.pdf',
     'LA DÉPENDANCE AFFECTIVE', ['LA DÉPENDANCE', 'AFFECTIVE'],
     ['30 jours pour sortir du manque.', "Apprendre à se suffire avant de s'unir."]),
    ('7d22f3d7-03_Confiance_En_Soi.pdf', '03_Confiance_En_Soi.pdf',
     'LA CONFIANCE EN SOI', ['LA CONFIANCE', 'EN SOI'],
     ['28 jours pour cesser d’attendre la permission.', 'Construire la preuve par l’acte.']),
    ('68c313f9-04_Sortir_du_BurnOut.pdf', '04_Sortir_du_BurnOut.pdf',
     'SORTIR DU BURN-OUT', ['SORTIR DU', 'BURN-OUT'],
     ['14 jours pour rendre ce qui ne t’appartient pas.', 'Et reprendre ce qui est tien.']),
    ('38ee9a96-05_Apres_Le_Traumatisme.pdf', '05_Apres_Le_Traumatisme.pdf',
     'APRÈS LE TRAUMATISME', ['APRÈS', 'LE TRAUMATISME'],
     ['49 jours pour se réapproprier son corps.', 'Un pas à la fois. À ton rythme.']),
    ('0827ba77-06_Apres_La_Rupture.pdf', '06_Apres_La_Rupture.pdf',
     'APRÈS LA RUPTURE', ['APRÈS', 'LA RUPTURE'],
     ['21 jours pour se détacher, sans effacer.', "Redevenir soi, après l'autre."]),
    ('9f9d444f-07_Apres_Le_Deuil.pdf', '07_Apres_Le_Deuil.pdf',
     'APRÈS LE DEUIL', ['APRÈS', 'LE DEUIL'],
     ['49 jours pour traverser les sept étapes.', 'Et continuer à vivre. Autrement.']),
]

def centre_x(texte, police, taille):
    return CENTRE - police.text_length(texte, fontsize=taille) / 2

modele = pymupdf.open(MODELE)
os.makedirs('out', exist_ok=True)

for src, dest, titre_1l, titre_2l, sous in CAHIERS:
    doc = pymupdf.open(UP + src)
    assert doc[0].rect.width > 500

    # 1. La couverture modèle, isolée
    couv = pymupdf.open()
    couv.insert_pdf(modele, from_page=0, to_page=0)
    page = couv[0]

    # 2. On efface titre et sous-titre du modèle
    for z in ZONES_A_EFFACER:
        page.add_redact_annot(pymupdf.Rect(*z), fill=(1, 1, 1))
    page.apply_redactions()

    page.insert_font(fontname='titre', fontfile=CINZEL)
    page.insert_font(fontname='sous', fontfile=PLAYFAIR)

    # 3. Titre : une ligne si la largeur le permet, sinon deux, centrées
    #    sur la même hauteur optique que le modèle.
    largeur = f_titre.text_length(titre_1l, fontsize=TITRE_TAILLE)
    if largeur <= LARGEUR_MAX_T:
        lignes = [(titre_1l, TITRE_BASE)]
    else:
        lignes = [(titre_2l[0], TITRE_BASE - TITRE_INTER / 2),
                  (titre_2l[1], TITRE_BASE + TITRE_INTER / 2)]
    for texte, base in lignes:
        page.insert_text((centre_x(texte, f_titre, TITRE_TAILLE), base), texte,
                         fontname='titre', fontsize=TITRE_TAILLE, color=(0, 0, 0))

    # 4. Sous-titre : deux lignes, réduites si l'une déborde
    taille_s = SOUS_TAILLE
    while max(f_sous.text_length(t, fontsize=taille_s) for t in sous) > LARGEUR_MAX_S:
        taille_s -= 0.5
    for texte, base in zip(sous, SOUS_BASES):
        page.insert_text((centre_x(texte, f_sous, taille_s), base), texte,
                         fontname='sous', fontsize=taille_s, color=(0, 0, 0))

    # 5. La nouvelle couverture remplace l'ancienne, le reste est intact
    pages_avant = doc.page_count
    doc.delete_page(0)
    doc.insert_pdf(couv, from_page=0, to_page=0, start_at=0)
    assert doc.page_count == pages_avant

    doc.save('out/' + dest, garbage=3, deflate=True)
    print("%-32s %2d pages | titre sur %d ligne(s) | sous-titre %.1f pt"
          % (dest, doc.page_count, len(lignes), taille_s))
    doc.close(); couv.close()
