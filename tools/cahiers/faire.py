# -*- coding: utf-8 -*-
"""Chaîne complète de fabrication d'un cahier :
   PDF source -> JSON sémantique -> HTML -> PDF composé -> assemblage avec la couverture.
   Le contrôle de perte est fait à chaque étape : aucun mot ne doit disparaître."""
import json, re, subprocess, sys, unicodedata, os
import pymupdf
import extract, compose, romains

RACINE = os.path.dirname(os.path.abspath(__file__))

def mots(texte):
    # Les césures de fin de ligne sont refermées à la composition : on compare
    # donc de part et d'autre le texte décésuré, sinon tout mot coupé paraîtrait perdu.
    texte = re.sub(r'-\s+', '', texte)
    t = unicodedata.normalize('NFKD', texte.lower())
    t = "".join(c for c in t if not unicodedata.combining(c))
    return re.findall(r"[a-z0-9]+", t)

def fabriquer(source, couverture, titre, sortie, cle):
    pages, inconnus = extract.extraire(source)
    # La couverture est refaite à part : ses signatures ne concernent pas le corps.
    inconnus = [u for u in inconnus if u[0] > 1]
    assert not inconnus, "fragments non classés : %r" % inconnus[:5]

    # Les cahiers numérotent en chiffres romains : on rétablit les chiffres
    # arabes, comme sur la plateforme. Fait ici, avant tout contrôle, pour que
    # les deux côtés de la comparaison parlent la même langue.
    romains.convertir_pages(pages)

    html_path = os.path.join(RACINE, 'cahier_%s.html' % cle)
    css_path  = os.path.join(RACINE, 'cahier_%s.css'  % cle)
    css = open(os.path.join(RACINE, 'cahier.css')).read().replace('__TITRE__', titre.upper())
    open(css_path, 'w').write(css)

    corps = compose.compose(pages[1:], titre)
    open(html_path, 'w').write(
        '<!doctype html><html lang="fr"><head><meta charset="utf-8">'
        '<title>%s</title><link rel="stylesheet" href="%s"></head><body>%s</body></html>'
        % (titre, os.path.basename(css_path), corps))

    # ── contrôle 1 : le HTML contient tout le texte du JSON
    # Le texte attendu se lit d'un trait : c'est ainsi que les césures se referment.
    attendu = mots(" ".join(e['texte'] for p in pages[1:] for e in p['elements']))
    obtenu = mots(re.sub(r'<[^>]+>', ' ', corps))
    from collections import Counter
    manque = Counter(attendu) - Counter(obtenu)
    assert not manque, "mots perdus à la composition : %s" % list(manque.items())[:10]

    corps_pdf = os.path.join(RACINE, 'corps_%s.pdf' % cle)
    subprocess.run(['/opt/pw-browsers/chromium-1194/chrome-linux/chrome', '--headless', '--disable-gpu', '--no-sandbox',
                    '--no-pdf-header-footer', '--run-all-compositor-stages-before-draw',
                    '--virtual-time-budget=20000',
                    '--print-to-pdf=' + corps_pdf, 'file://' + html_path],
                   check=True, capture_output=True)

    # ── contrôle 2 : le PDF imprimé contient tout le texte du source.
    # On compare hors espaces : l'interlettrage des petites capitales fait
    # ressortir « T H O M A S » à l'extraction, ce n'est pas une perte.
    doc = pymupdf.open(corps_pdf)
    imprime = "".join(mots(" ".join(p.get_text() for p in doc)))
    absents = []
    for p in pages[1:]:
        for e in p['elements']:
            m = "".join(mots(e['texte']))
            if m and m not in imprime:
                absents.append(e['texte'][:60])
    assert not absents, "texte perdu à l'impression (%d) : %s" % (len(absents), absents[:6])

    final = pymupdf.open()
    final.insert_pdf(pymupdf.open(couverture), from_page=0, to_page=0)   # la couverture seule
    final.insert_pdf(doc)
    final.save(os.path.join(RACINE, sortie), garbage=4, deflate=True)

    maigres = [n + 1 for n, p in enumerate(final) if n and len(p.get_text().strip()) < 200]
    print("%-42s %2d pages   pages légères : %s" % (sortie, final.page_count, maigres))
    return final.page_count

if __name__ == '__main__':
    fabriquer(sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4], sys.argv[5])
