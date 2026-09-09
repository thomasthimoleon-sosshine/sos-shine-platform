# -*- coding: utf-8 -*-
"""Les cahiers numérotent en chiffres romains ; la plateforme, elle, parle en
chiffres arabes — et le lecteur aussi. On convertit, mais seulement là où le
signe est bien un nombre : un « C » isolé, c'est « C'est », pas cent."""
import re

VALEURS = {'I': 1, 'V': 5, 'X': 10, 'L': 50, 'C': 100}
UNITES = [(100, 'C'), (90, 'XC'), (50, 'L'), (40, 'XL'), (10, 'X'),
          (9, 'IX'), (5, 'V'), (4, 'IV'), (1, 'I')]

def arabe(r):
    total = 0
    for i, ch in enumerate(r):
        v = VALEURS[ch]
        total += -v if i + 1 < len(r) and VALEURS[r[i+1]] > v else v
    return total

def romain(n):
    out = ''
    for v, s in UNITES:
        while n >= v:
            out += s; n -= v
    return out

def nombre(jeton):
    """Le jeton est-il un vrai chiffre romain ? On le décode puis on le réécrit :
    s'il ne se retrouve pas à l'identique, ce n'était pas un nombre (ICV, CV…)."""
    n = arabe(jeton)
    return str(n) if 0 < n < 400 and romain(n) == jeton else None

MOT = r'(?:jours?|étapes?|phases?|semaines?)'
INTERVALLE = re.compile(r'\b(' + MOT + r')(\s+)([IVXLC]{1,7})(\s+à\s+)([IVXLC]{1,7})\b', re.I)
SIMPLE     = re.compile(r'\b(' + MOT + r')(\s+)([IVXLC]{1,7})\b', re.I)
MARQUEUR   = re.compile(r'^([IVXLC]{1,7})(\.\s)')

def convertir(texte):
    def _intervalle(m):
        a, b = nombre(m.group(3)), nombre(m.group(5))
        if not a or not b:
            return m.group(0)
        return m.group(1) + m.group(2) + a + m.group(4) + b
    def _simple(m):
        n = nombre(m.group(3))
        return m.group(0) if not n else m.group(1) + m.group(2) + n
    def _marqueur(m):
        n = nombre(m.group(1))
        return m.group(0) if not n else n + m.group(2)
    texte = INTERVALLE.sub(_intervalle, texte)
    texte = SIMPLE.sub(_simple, texte)
    texte = MARQUEUR.sub(_marqueur, texte)
    return texte

FIN_MOT = re.compile(r'\b' + MOT + r'\s*$', re.I)
DEBUT_NOMBRE = re.compile(r'^([IVXLC]{1,7})\b')

def convertir_pages(pages):
    """Applique la conversion à tous les fragments, puis rattrape les nombres
    coupés par un retour à la ligne : « ton Étape » en fin de ligne, « III » au
    début de la suivante. Les deux sont convertis ensemble ou pas du tout —
    sinon le contrôle de perte comparerait deux textes différents."""
    changements = []
    fragments = [e for p in pages for e in p['elements']]
    for e in fragments:
        neuf = convertir(e['texte'])
        if neuf != e['texte']:
            changements.append((e['texte'], neuf))
            e['texte'] = neuf
    for a, b in zip(fragments, fragments[1:]):
        if not FIN_MOT.search(a['texte']):
            continue
        m = DEBUT_NOMBRE.match(b['texte'])
        if not m:
            continue
        n = nombre(m.group(1))
        if n:
            neuf = n + b['texte'][m.end():]
            changements.append((b['texte'], neuf))
            b['texte'] = neuf
    return changements
