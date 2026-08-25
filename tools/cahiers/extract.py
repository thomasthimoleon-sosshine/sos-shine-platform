# -*- coding: utf-8 -*-
"""Extraction sémantique d'un cahier SOS Shine.

Chaque fragment de texte du PDF porte une signature (taille, graisse, italique,
couleur) qui identifie sans ambiguïté son rôle éditorial. On s'appuie dessus
plutôt que sur la position, plus fragile.
Toute signature inconnue est signalée : l'extraction n'est acceptée que si
zéro fragment reste non classé.
"""
import pymupdf, json, sys, re

GOLD, GOLD_D, INK, INK_2, MUTED = 0xc9a961, 0x8a7338, 0x1a1a1a, 0x2c2c2c, 0x666666

def role(taille, gras, ital, couleur, texte):
    t = round(taille, 1)
    # En-tête et pied de page : régénérés, donc écartés. La règle est étroite
    # à dessein : « — Thomas » a la même taille et la même couleur que le folio.
    if t == 8.5 and ital and couleur == GOLD:                       return 'chrome'
    if t == 8.0 and 'Module pratique' in texte:                     return 'chrome'
    if t == 9.0 and re.match(r'^[—–-]\s*[0-9IVXLC]+\s*[—–-]$', texte.strip()): return 'chrome'
    if couleur == 0xffffff:                        return 'chrome'   # bandeau noir de couverture
    if t >= 28:                                    return 'titre_phase'
    if t >= 22 and couleur == INK:                 return 'titre'
    if t >= 20:                                    return 'titre'
    if 14 <= t < 20 and gras:                      return 'inter_titre'
    if t == 12.0 and gras and couleur == INK:      return 'jour_numero'
    if t == 12.0 and gras and couleur == GOLD_D:   return 'jour_titre'
    if t == 13.0 and ital:                         return 'mantra'
    if t == 12.0 and ital:                         return 'phase_sous_titre'
    if t == 11.0 and ital and couleur == MUTED:    return 'aide'
    if t == 11.0 and ital and couleur == GOLD:     return 'signature'
    if t == 11.5 and gras:                         return 'sous_titre'
    if t == 11.5 and ital:                         return 'chapeau'
    if t == 11.0 and gras and couleur == INK:      return 'question'
    if t == 11.0 and gras and couleur in (GOLD, GOLD_D): return 'surtitre'
    if t == 10.5 and gras:                         return 'question'
    if t == 10.5 and ital:                         return 'chapeau'
    if t == 10.5:                                  return 'texte'
    if t == 10.0 and ital:                         return 'temoignage'
    if t == 9.5 and ital and couleur == GOLD:      return 'renvoi'
    if t == 9.5 and ital and couleur == MUTED:     return 'aide'
    if t == 9.5 and ital and couleur == INK_2:     return 'case_a_cocher'
    if t == 9.5 and ital:                          return 'aide'
    if t == 9.5:                                   return 'liste'
    if t == 9.0 and ital and couleur == GOLD:      return 'signature'
    if t == 9.0 and gras:                          return 'surtitre'
    if t == 9.0:                                   return 'liste'
    if t == 8.5 and gras:                          return 'etiquette'
    if t == 8.0:                                   return 'liste'
    return None

# ═══════════════════════════════════════════════════════════════
# Première génération de cahiers (L'Amour-Propre) : autre grille
# typographique — Cinzel pour les titres, Playfair pour les signaux,
# Lora pour le texte, et des gris chauds différents.
# ═══════════════════════════════════════════════════════════════
G1_CHROME, G1_FOLIO, G1_ENCRE = 0xbdb6a8, 0xd9cfb8, 0x141414
G1_GRIS, G1_GRIS_2, G1_DISCRET, G1_TERRE = 0x3a362f, 0x4a463f, 0x6e6a63, 0xb5654a

def role_g1(taille, gras, ital, couleur, police, texte):
    t = round(taille, 1)
    if couleur in (G1_CHROME, G1_FOLIO, 0xffffff):            return 'chrome'
    if t >= 30:                                    return 'titre_phase'   # couverture
    if t >= 20 and 'GreatVibes' in police:         return 'signature_main'
    if t >= 20:                                    return 'chapeau'       # couverture
    if t == 19.0 and gras:                         return 'titre'
    if t == 14.5 and gras:                         return 'titre_phase'
    if t == 13.4 and gras:                         return 'jour_titre'
    if t == 12.5 and gras:                         return 'inter_titre'
    if t == 12.4:                                  return 'mantra'
    if t == 11.0 and couleur == 0xc9a961:          return 'surtitre'
    if t == 10.6 and gras:                         return 'surtitre'
    if t == 10.6 and ital:                         return 'chapeau'
    if t == 10.4 and gras:                         return 'question'
    if t == 10.1 and gras:                         return 'question'
    if t == 10.0 and gras:                         return 'chapeau'
    if t == 10.0:                                  return 'texte'
    if t == 9.9 and ital:                          return 'temoignage'
    if t == 9.6 and couleur == 0xc9a961:           return 'surtitre'
    if t == 9.6:                                   return 'texte'
    if t == 9.4 and couleur == 0xc9a961:           return 'jour_numero'
    if t == 9.2 and ital:                          return 'aide'
    if t == 9.2:                                   return 'case_a_cocher'
    if t == 8.9 and ital and couleur == 0xc9a961:  return 'renvoi'
    if t == 8.9 and ital:                          return 'phase_sous_titre'
    if t == 8.9:                                   return 'aide'
    if t == 8.8 and ital:                          return 'phase_sous_titre'
    if t == 8.4 and couleur == G1_TERRE:           return 'etiquette'
    if t == 8.4 and couleur == 0xc9a961:           return 'signature'
    if t == 8.2:                                   return 'liste'
    if t == 6.2:                                   return 'entete_grille'
    return None

def premiere_generation(doc):
    """Reconnue à l'en-tête courant de sa deuxième page."""
    for b in doc[1].get_text("dict")["blocks"]:
        if b["type"] != 0: continue
        for l in b["lines"]:
            for sp in l["spans"]:
                if round(sp["size"], 1) == 7.4 and sp["color"] == G1_CHROME:
                    return True
    return False

def extraire(chemin):
    doc = pymupdf.open(chemin)
    g1 = premiere_generation(doc)
    pages, inconnus = [], []
    for i, page in enumerate(doc):
        elements = []
        for b in page.get_text("dict")["blocks"]:
            if b["type"] != 0:
                continue
            for l in b["lines"]:
                if not l["spans"]:
                    continue
                texte = "".join(s["text"] for s in l["spans"]).replace('\xa0', ' ').strip()
                if not texte:
                    continue
                # Une ligne peut porter deux rôles : l'étiquette d'un encadré
                # et son texte partagent parfois la même ligne de base.
                tranches, cour = [], None
                for s in l["spans"]:
                    if not s["text"].strip() and cour: cour[1] += s["text"]; continue
                    gras = bool(s["flags"] & 16); ital = bool(s["flags"] & 2)
                    r = (role_g1(s["size"], gras, ital, s["color"], s["font"], texte) if g1
                         else role(s["size"], gras, ital, s["color"], texte))
                    if r is None:
                        inconnus.append((i + 1, round(s["size"],1), gras, ital, hex(s["color"]), s["text"][:60]))
                        r = 'chrome'
                    if cour and cour[0] == r: cour[1] += s["text"]
                    else:
                        cour = [r, s["text"]]; tranches.append(cour)
                for k, (r, txt) in enumerate(tranches):
                    txt = txt.replace('\xa0', ' ').strip()
                    if r == 'chrome' or not txt:
                        continue
                    # Seule la première tranche commence à gauche ; les suivantes
                    # ne servent qu'à porter leur texte, la mise en page les suit.
                    elements.append({'role': r, 'texte': txt,
                                     'y': round(l["bbox"][1], 1) + k * 0.01,
                                     'x': round(l["bbox"][0], 1),
                                     'x1': round(l["bbox"][2], 1) if k == len(tranches)-1 else 0})
        # filets d'écriture de la page
        # Une ligne d'écriture est beige (#C5B896) et court sur toute la colonne.
        # Les ornements du titre sont dorés (#C9A961) et bien plus courts : on les écarte,
        # ils seront redessinés par la feuille de style.
        def est_ligne_ecriture(d):
            r, c = d["rect"], d.get("color")
            if r.height >= 2.5 or r.width < 350 or not c:
                return False
            return any(abs(c[0]-a) < .02 and abs(c[1]-b) < .02 and abs(c[2]-d2) < .02
                       for a, b, d2 in ((0.773, 0.722, 0.588), (0.784, 0.765, 0.729)))
        filets = sorted(round(d["rect"].y0, 1) for d in page.get_drawings() if est_ligne_ecriture(d))
        # Les lignes d'écriture prennent leur place dans le flux, à leur hauteur :
        # elles appartiennent à ce qui les précède, quel qu'en soit le rôle.
        for y in filets:
            elements.append({'role': 'ligne', 'texte': '', 'y': y, 'x': 0, 'x1': 0})
        elements.sort(key=lambda e: (e['y'], e['x']))
        pages.append({'page': i + 1, 'elements': elements, 'filets': filets})
    return pages, inconnus

if __name__ == '__main__':
    pages, inconnus = extraire(sys.argv[1])
    total = sum(len(p['elements']) for p in pages)
    print("pages: %d | fragments classés: %d | NON CLASSÉS: %d" % (len(pages), total, len(inconnus)))
    for u in inconnus[:15]:
        print("   ?  p%-3d %5.1f gras=%s ital=%s %s | %s" % u)
    json.dump(pages, open(sys.argv[2], 'w'), ensure_ascii=False, indent=1)
