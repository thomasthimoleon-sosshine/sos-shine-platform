# -*- coding: utf-8 -*-
"""JSON sémantique -> HTML composé, imprimé ensuite par Chromium.
Aucun texte n'est réécrit : on ne fait que l'habiller.

Deux principes gouvernent le découpage :
  · le cahier source est justifié — une ligne qui n'atteint pas la marge de
    droite termine son paragraphe. C'est exact, contrairement aux écarts verticaux.
  · les pages du PDF source ne sont pas des unités éditoriales : on lit le
    document comme un flux continu, sinon un bloc à cheval sur deux pages se
    retrouve amputé.
"""
import json, sys, html, re

# Le cahier source est justifié et tous ses blocs sont encartés symétriquement :
# une ligne pleine se termine donc à (largeur de page − sa propre marge de gauche).
# C'est vrai du texte courant comme des encadrés, quel que soit leur retrait.
LARGEUR = 595.3             # A4
CENTRE = LARGEUR / 2

def _plein(it):
    """La ligne touche-t-elle la marge de droite de son bloc ?"""
    return it['x'] + it.get('x1', 0) >= LARGEUR - 2.0

NBSP = '\u00a0'

def typographie(t):
    """Micro-typographie française. Le cahier source compose à la machine :
    apostrophes droites, espaces ordinaires devant la ponctuation double.
    On rétablit l'usage sans toucher un seul mot."""
    t = re.sub(r"(?<=[^\W\d_])'(?=[^\W\d_])", '\u2019', t)   # apostrophe courbe
    t = re.sub(r'«\s*', '«' + NBSP, t)
    t = re.sub(r'\s*»', NBSP + '»', t)
    t = re.sub(r'\s+([:;!?])', NBSP + r'\1', t)
    t = re.sub(r'\s*·\s*', NBSP + '·' + NBSP, t)
    return t

def esc(t): return html.escape(typographie(t), quote=False)

def _centre(items):
    return all(abs((it['x'] + it.get('x1', it['x'])) / 2 - CENTRE) < 18 and it['x'] > 100
               for it in items)

def blocs(items):
    """Découpe une suite de lignes de même rôle en paragraphes."""
    if not items:
        return []
    if len(items) == 1:
        return [items]
    out, cour = [], [items[0]]
    if _centre(items):
        # Bloc centré : rien à tirer de la justification, on retombe sur l'écart
        # vertical, relatif à l'interligne du bloc lui-même.
        sauts = sorted(items[i]['y'] - items[i-1]['y']
                       for i in range(1, len(items)) if items[i]['pg'] == items[i-1]['pg'])
        courant = sauts[len(sauts)//2] if sauts else 14.5
        seuil = max(courant * 1.45, courant + 4)
        for i in range(1, len(items)):
            coupe = (items[i]['pg'] != items[i-1]['pg']
                     or items[i]['y'] - items[i-1]['y'] > seuil)
            if coupe:
                out.append(cour); cour = []
            cour.append(items[i])
    else:
        # Interligne du bloc : le plus petit écart entre deux lignes voisines.
        ecarts = [items[i]['y'] - items[i-1]['y']
                  for i in range(1, len(items)) if items[i]['pg'] == items[i-1]['pg']]
        lead = min(ecarts) if ecarts else 14.5
        for i in range(1, len(items)):
            av = items[i-1]
            manque = (LARGEUR - av['x']) - av['x1']         # ce qui manque à la marge
            saute = items[i]['y'] - av['y'] if items[i]['pg'] == av['pg'] else lead
            # Une ligne pleine se poursuit. Une ligne presque pleine se poursuit
            # aussi si la suivante est à l'interligne : les listes du cahier ne
            # sont pas justifiées, leur dernier mot n'atteint pas tout à fait la marge.
            # Une ligne pleine se poursuit. Une ligne à l'interligne se poursuit
            # aussi tant qu'elle reste en suspens : les blocs encadrés du cahier
            # ne sont pas justifiés, leur dernier mot n'atteint pas la marge.
            mesure = LARGEUR - 2 * av['x']
            rempli = (av['x1'] - av['x']) / mesure if mesure > 0 else 0
            suite = manque <= 2.0 or (saute <= lead + 1.5
                                      and (manque < 22
                                           or (rempli > 0.55
                                               and av['texte'].rstrip()[-1:] not in '.?!»:;')))
            if not suite:
                out.append(cour); cour = []
            cour.append(items[i])
    out.append(cour)
    return out

def joindre(lignes):
    """Recolle les lignes d'un paragraphe. Le cahier source coupe les mots en fin
    de ligne : on referme la coupure, sauf pour les mots réellement composés,
    reconnus à ce qu'ils apparaissent ailleurs dans le cahier sans césure."""
    out = ''
    for t in lignes:
        if not out:
            out = t; continue
        if out.endswith('-') and t[:1].islower() and len(out) > 1 and out[-2].isalpha():
            racine = re.split(r'[\s(«"]', out)[-1]
            compose_ = racine + re.split(r'[\s.,;:!?)»]', t)[0]
            out = out + t if compose_.lower() in COMPOSES[0] else out[:-1] + t
        else:
            out = out + ' ' + t
    return out

COMPOSES = [set()]

def paragraphes(items):
    return [joindre([x['texte'] for x in g]) for g in blocs(items)]

GAUCHE_CORPS = [70.9]      # marge de gauche du texte courant, mesurée à l'ouverture

def rendu(items, cls, balise='p'):
    """Rend un groupe de lignes. Une suite d'items indentés et tenant chacun sur
    une ligne n'est pas de la prose : c'est une liste, on la compose comme telle.
    Le retrait se juge par rapport à la marge du texte courant, pas à celle du
    groupe : sinon une liste isolée, entièrement indentée, passerait inaperçue."""
    groupes = blocs(items)
    if not groupes:
        return []
    gauche = min(GAUCHE_CORPS[0], min(it['x'] for it in items))
    sortie, i = [], 0
    while i < len(groupes):
        j = i
        while (j < len(groupes) and len(groupes[j]) == 1
               and groupes[j][0]['x'] == groupes[i][0]['x']):
            j += 1
        if j - i >= 2 and groupes[i][0]['x'] > gauche + 8:
            sortie.append('<ul class="liste">'
                          + "".join('<li>%s</li>' % esc(g[0]['texte']) for g in groupes[i:j])
                          + '</ul>')
            i = j
            continue
        # Non indentée, mais une suite d'items d'une ligne : une énumération
        # tout de même. On ne la décore pas, on l'empêche seulement de se rompre.
        if j - i >= 3:
            attr = ' class="%s"' % cls if cls else ''
            sortie.append('<div class="tenir">'
                          + "".join('<%s%s>%s</%s>' % (balise, attr, esc(g[0]['texte']), balise)
                                    for g in groupes[i:j])
                          + '</div>')
            i = j
            continue
        texte = joindre([x['texte'] for x in groupes[i]])
        attr = ' class="%s"' % cls if cls else ''
        sortie.append('<%s%s>%s</%s>' % (balise, attr, esc(texte), balise))
        i += 1
    return sortie

CORPS = {'texte', 'question', 'aide', 'temoignage', 'chapeau', 'liste'}

def recoller(els):
    """Le cahier source compose certaines listes en deux graisses : l'intitulé en
    gras, la suite en romain. Quand une telle ligne déborde, sa fin change de rôle
    et se détache. On la recolle : même colonne, même interligne, ligne précédente
    quasi pleine et laissée en suspens (aucune ponctuation forte)."""
    from collections import Counter
    ecarts = Counter(round(els[i]['y'] - els[i-1]['y'], 1) for i in range(1, len(els))
                     if els[i]['pg'] == els[i-1]['pg'] and 0 < els[i]['y'] - els[i-1]['y'] < 25)
    if not ecarts:
        return
    lead = ecarts.most_common(1)[0][0]
    for i in range(1, len(els)):
        a, b = els[i-1], els[i]
        if a['role'] == b['role'] or a['role'] not in CORPS or b['role'] not in CORPS:
            continue
        if b['pg'] != a['pg'] or b['x'] != a['x']:
            continue
        # Deux tranches d'une même ligne de base : un intitulé en gras suivi de
        # son texte en romain. C'est une seule phrase, elle se lit d'un trait.
        if b['y'] - a['y'] < 0.5:
            b['role'] = a['role']
            continue
        if not 0 < b['y'] - a['y'] <= lead + 1.5:
            continue
        if (LARGEUR - a['x']) - a['x1'] > 22:
            continue
        if a['texte'].rstrip()[-1:] in '.?!:»':          # phrase close : rien ne suit
            continue
        b['role'] = a['role']

def grille(bloc):
    """Recompose une grille de suivi. Les actes sont rangés en colonnes ; chacun
    reçoit sa case. Une ligne qui ne porte pas de numéro est la suite de l'acte
    précédent de sa colonne, coupé par la largeur de la colonne."""
    items = [e for e in bloc if e['role'] == 'liste']
    entetes = [e['texte'] for e in sorted((e for e in bloc if e['role'] == 'entete_grille'),
                                          key=lambda e: e['x'])]
    if len(items) < 6:
        return None
    colonnes = {}
    for e in items:
        colonnes.setdefault(e['x'], []).append(e)
    xs = sorted(colonnes)
    for x in xs:
        colonnes[x].sort(key=lambda e: e['y'])
        # Une colonne numérotée : tout ce qui n'a pas de numéro est la suite
        # de l'acte précédent, coupé par la largeur de la colonne. La proportion
        # de lignes de suite ne dit rien — une colonne étroite en produit beaucoup.
        numerote = sum(1 for e in colonnes[x] if re.match(r'^[0-9IVXLC]+\.', e['texte']))
        if numerote < 2:
            continue
        fusion = []
        for e in colonnes[x]:
            if fusion and not re.match(r'^[0-9IVXLC]+\.', e['texte']):
                fusion[-1] = dict(fusion[-1], texte=fusion[-1]['texte'] + ' ' + e['texte'])
            else:
                fusion.append(e)
        colonnes[x] = fusion

    # Une seule colonne d'actes, mais une case par jour : c'est une matrice.
    if len(xs) == 1 and len(entetes) >= 5:
        col = colonnes[xs[0]]
        th = "".join('<th>%s</th>' % esc(t) for t in entetes)
        rangs = "".join('<tr><td class="acte">%s</td>%s</tr>'
                        % (esc(e['texte']), '<td class="case"></td>' * len(entetes))
                        for e in col)
        return ('<table class="matrice"><tr><th class="acte"></th>%s</tr>%s</table>'
                % (th, rangs))

    if len(xs) < 2:
        return None

    # Les rangs se lisent à la hauteur : les colonnes n'ont pas toujours le même
    # nombre d'actes, mais un rang aligne toujours ses entrées sur la même ligne.
    tous = sorted((e for c in colonnes.values() for e in c), key=lambda e: e['y'])
    rangs_items, cour = [], [tous[0]]
    for e in tous[1:]:
        if e['y'] - cour[0]['y'] > 8:
            rangs_items.append(cour); cour = []
        cour.append(e)
    rangs_items.append(cour)
    if any(len(r) > len(xs) for r in rangs_items):
        return None

    rangs = []
    for r in rangs_items:
        par_x = {e['x']: e for e in r}
        cellules = []
        for x in xs:
            e = par_x.get(x)
            # Pas d'acte, pas de case : une colonne plus courte s'arrête net.
            cellules.append('<td>%s</td><td class="%s"></td>'
                            % (esc(e['texte']) if e else '', 'case' if e else 'vide'))
        rangs.append('<tr>%s</tr>' % "".join(cellules))
    # Une grille très haute doit tenir sous son titre : on la resserre.
    dense = ' dense' if len(rangs) >= 16 else ''
    return '<table class="grille%s">%s</table>' % (dense, "".join(rangs))

def compose(pages, titre_cahier):
    els = []
    for p in pages:
        for e in p['elements']:
            e['pg'] = p['page']
            els.append(e)

    from collections import Counter
    marges = Counter(e['x'] for e in els if e['role'] != 'ligne')
    GAUCHE_CORPS[0] = marges.most_common(1)[0][0]
    COMPOSES[0] = {m.lower() for e in els
                   for m in re.findall(r"[^\W\d_]+-[^\W\d_]+", e['texte'])}
    recoller(els)

    h = []
    h.append('<div class="titre-courant">%s</div>' % esc(titre_cahier))
    premier_titre = True
    apres_titre = False
    i = 0
    n = len(els)

    def suivant(role, depuis):
        return depuis < n and els[depuis]['role'] == role

    while i < n:
        e = els[i]; r = e['role']

        # ── Grille de suivi. Le cahier la compose en colonnes ; le flux linéaire
        # la détruirait. On relit sa géométrie et on la recompose en tableau.
        if r == 'liste':
            j = i
            while j < n and els[j]['role'] in ('liste', 'ligne', 'entete_grille'):
                j += 1
            # Les en-têtes de colonnes précèdent la première ligne du tableau.
            deb = i
            while deb and els[deb-1]['role'] == 'entete_grille':
                deb -= 1
            tab = grille(els[deb:j])
            if tab and deb < i:
                while h and h[-1].startswith('<p class="entete-grille"'):
                    h.pop()
            if tab:
                h.append(tab); i = j; continue

        if r == 'entete_grille':
            h.append('<p class="entete-grille">%s</p>' % esc(e['texte'])); i += 1; continue

        if r == 'ligne':
            c = 0
            while i < n and els[i]['role'] == 'ligne':
                c += 1; i += 1
            h.append('<div class="lignes">' + '<div class="ligne"></div>' * c + '</div>')
            continue

        # ── Ouverture de phase : surtitre + grand titre + sous-titre
        if r == 'titre_phase':
            sur = els[i-1]['texte'] if i and els[i-1]['role'] == 'surtitre' else ''
            sous = els[i+1]['texte'] if suivant('phase_sous_titre', i+1) else ''
            if h and h[-1].startswith('<p class="surtitre"'): h.pop()
            h.append('<section class="phase"><p class="surtitre">%s</p><h1>%s</h1>'
                     '<p class="sous">%s</p><div class="trait"></div></section>'
                     % (esc(sur), esc(e['texte']), esc(sous)))
            i += 2 if sous else 1
            continue

        if r == 'titre':
            # Un titre de chapitre qui déborde tient sur deux lignes : c'est un
            # seul titre. Le composer en deux ouvertures ouvrirait deux chapitres.
            lignes_titre = [e]; i += 1
            while (i < n and els[i]['role'] == 'titre'
                   and els[i]['pg'] == lignes_titre[-1]['pg']
                   and els[i]['y'] - lignes_titre[-1]['y'] < 45):
                lignes_titre.append(els[i]); i += 1
            sur = ''
            if h and h[-1].startswith('<p class="surtitre"'):
                sur = h.pop()
            t = joindre([x['texte'] for x in lignes_titre])
            maj = ' class="capitales"' if t == t.upper() and len(t) > 3 else ''
            h.append('<header class="ouverture%s">%s<h1%s>%s</h1><div class="ornement"></div></header>'
                     % (' premier' if premier_titre else '', sur, maj, esc(t)))
            premier_titre = False; apres_titre = True; continue

        # ── Étiquette + son texte = un encadré de savoir, où qu'il se trouve
        if r == 'etiquette' or (r == 'surtitre' and suivant('aide', i+1)):
            et = e['texte']; i += 1
            corps = []
            while i < n and els[i]['role'] == 'aide':
                corps.append(els[i]); i += 1
            if corps:
                h.append('<div class="savoir"><p class="etiquette">%s</p>%s</div>'
                         % (esc(et), "".join(rendu(corps, ''))))
            else:
                h.append('<p class="surtitre">%s</p>' % esc(et))
            continue

        if r == 'surtitre':
            h.append('<p class="surtitre">%s</p>' % esc(e['texte'])); i += 1; continue

        if r in ('inter_titre', 'sous_titre'):
            grp = []
            while i < n and els[i]['role'] == r:
                grp.append(els[i]); i += 1
            balise = 'h3' if r == 'inter_titre' else 'h2'
            # Un titre n'est pas justifié : c'est sa longueur qui dit s'il se
            # poursuit à la ligne suivante. Un titre qui occupe la mesure entière
            # est un titre qui déborde ; un titre court est un titre entier.
            titres, cour = [], [grp[0]]
            for it in grp[1:]:
                if cour[-1]['x1'] < (LARGEUR - cour[-1]['x']) * 0.88:
                    titres.append(cour); cour = []
                cour.append(it)
            titres.append(cour)
            for g in titres:
                t = joindre([x['texte'] for x in g])
                # Une phrase entière ne se met pas en capitales espacées :
                # illisible au-delà d'une poignée de mots. Elle passe en romain.
                attr = ' class="ample"' if balise == 'h3' and len(t) > 42 else ''
                h.append('<%s%s>%s</%s>' % (balise, attr, esc(t), balise))
            continue

        # ── Une journée
        if r == 'jour_numero':
            bloc = ['<div class="jour"><p class="numero">%s</p>' % esc(e['texte'])]
            i += 1
            if suivant('jour_titre', i):
                bloc.append('<p class="nom">%s</p>' % esc(els[i]['texte'])); i += 1
            if suivant('aide', i):
                bloc.append('<p class="accroche">%s</p>' % esc(els[i]['texte'])); i += 1
            geste = []
            while i < n and els[i]['role'] == 'question':
                geste.append(els[i]); i += 1
            bloc += rendu(geste, 'geste')
            if suivant('signature', i):
                i += 1
                temo = []
                while i < n and els[i]['role'] == 'temoignage':
                    temo.append(els[i]); i += 1
                if temo:
                    bloc.append('<div class="temoignage"><p class="voix">Thomas</p>'
                                + "".join(rendu(temo, '')) + '</div>')
            if suivant('etiquette', i):
                et = els[i]['texte']; i += 1
                savoir = []
                while i < n and els[i]['role'] == 'aide':
                    savoir.append(els[i]); i += 1
                bloc.append('<div class="savoir"><p class="etiquette">%s</p>%s</div>'
                            % (esc(et), "".join(rendu(savoir, ''))))
            if suivant('renvoi', i):
                bloc.append('<p class="renvoi">%s</p>' % esc(els[i]['texte'])); i += 1
            if suivant('case_a_cocher', i):
                bloc.append('<div class="coche"><span class="case"></span><span>%s</span></div>'
                            % esc(els[i]['texte'])); i += 1
            bloc.append('</div>')
            h.append("".join(bloc)); continue

        # ── Question + son aide + ses lignes d'écriture
        if r == 'question':
            q = []
            while i < n and els[i]['role'] == 'question':
                q.append(els[i]); i += 1
            aide = []
            while i < n and els[i]['role'] == 'aide':
                aide.append(els[i]); i += 1
            h.append('<div class="bloc-question">'
                     + "".join(rendu(q, 'question')) + "".join(rendu(aide, 'aide'))
                     + '</div>')
            continue

        # Le paraphe manuscrit de Thomas, tel qu'il signe ses pages.
        if r == 'signature_main':
            h.append('<p class="paraphe">%s</p>' % esc(e['texte'])); i += 1; continue

        if r == 'mantra':
            m = []
            while i < n and els[i]['role'] == 'mantra':
                m.append(els[i]); i += 1
            h += rendu(m, 'mantra')
            continue

        # Thomas prend la parole : même traitement partout dans le cahier
        if r == 'signature' or (r == 'temoignage' and (i == 0 or els[i-1]['role'] != 'signature')):
            if r == 'signature': i += 1
            temo = []
            while i < n and els[i]['role'] == 'temoignage':
                temo.append(els[i]); i += 1
            if temo:
                h.append('<div class="temoignage"><p class="voix">Thomas</p>'
                         + "".join(rendu(temo, '')) + '</div>')
            continue

        if r == 'chapeau':
            grp = []
            while i < n and els[i]['role'] == 'chapeau':
                grp.append(els[i]); i += 1
            for para in paragraphes(grp):
                # Une phrase courte et isolée n'est pas une introduction :
                # c'est la phrase que le lecteur doit retenir.
                cls = 'intro' if (apres_titre or len(para) > 150) else 'phrase-cle'
                h.append('<p class="%s">%s</p>' % (cls, esc(para)))
                apres_titre = False
            continue

        # Une case à cocher reste une case à cocher, y compris hors des cartes.
        if r == 'case_a_cocher':
            while i < n and els[i]['role'] == r:
                h.append('<div class="coche"><span class="case"></span><span>%s</span></div>'
                         % esc(els[i]['texte'])); i += 1
            continue

        if r in ('aide', 'texte', 'liste', 'renvoi', 'phase_sous_titre', 'signature'):
            grp = []
            while i < n and els[i]['role'] == r:
                grp.append(els[i]); i += 1
            cls = {'aide':'aide','liste':'liste','renvoi':'renvoi',
                   'phase_sous_titre':'phrase-cle'}.get(r, '')
            h += rendu(grp, cls)
            continue
        i += 1

    return solidariser(h)

LIGNE = '<div class="ligne"></div>'

def solidariser(h):
    """Deux règles de mise en page, appliquées après coup sur le flux de blocs.

    · Un intertitre et sa consigne ne se séparent pas des lignes d'écriture
      qu'ils annoncent : l'ensemble forme un exercice, il voyage d'un bloc.
    · Une phrase-clé ne reste jamais seule en haut d'une page : elle se
      solidarise avec ce qui la précède.
    """
    out = []
    for bloc in h:
        # ── l'ouverture de chapitre entraîne avec elle le début de son texte :
        # un titre seul sur une page, c'est une page perdue.
        if (out and out[-1].startswith('<header class="ouverture')
                and not bloc.startswith(('<header', '<section'))):
            tete = out.pop()
            premier = ' premier' if 'ouverture premier' in tete else ''
            out.append('<div class="ouvre%s">%s%s</div>' % (premier, tete, bloc))
            continue

        # ── une question part avec les lignes qu'on écrit dessous
        if (bloc.startswith('<div class="lignes">') and out
                and out[-1].startswith('<div class="bloc-question">')):
            out.append('<div class="tenir">%s%s</div>' % (out.pop(), bloc))
            continue

        # ── un intertitre ne finit pas une page : il part avec son texte
        if (out and out[-1].startswith('<h3')
                and not bloc.startswith(('<header', '<section', '<div class="ouvre'))):
            out.append('<div class="tenir">%s%s</div>' % (out.pop(), bloc))
            continue

        # ── l'exercice : intertitre + consigne + lignes
        if bloc.startswith('<div class="lignes">'):
            tete = []
            while out and (out[-1].startswith('<h3>') or out[-1].startswith('<p class="aide"')):
                tete.insert(0, out.pop())
                if out and out[-1].startswith('<h3>'):
                    tete.insert(0, out.pop()); break
            out.append('<div class="tenir">%s%s</div>' % ("".join(tete), bloc))
            continue

        # ── la phrase-clé
        if (bloc.startswith('<p class="phrase-cle"') and out
                and not out[-1].startswith(('<header', '<section', '<div class="titre-courant"'))):
            out.append('<div class="tenir">%s%s</div>' % (out.pop(), bloc))
            continue

        out.append(bloc)
    return "\n".join(out)

if __name__ == '__main__':
    pages = json.load(open(sys.argv[1]))
    titre = sys.argv[3]
    corps = compose(pages[1:], titre)      # la couverture est traitée à part
    doc = """<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>%s</title><link rel="stylesheet" href="%s">
</head>
<body>%s</body></html>""" % (esc(titre), sys.argv[4], corps)
    open(sys.argv[2], 'w').write(doc)
    print("HTML composé : %d caractères" % len(doc))
