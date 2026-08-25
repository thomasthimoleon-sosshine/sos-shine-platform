# Composition des cahiers pratiques SOS Shine

Chaîne de fabrication qui reprend un cahier PDF existant et le **recompose
entièrement** — sans jamais réécrire une ligne de son texte.

```
PDF source ──▶ extract.py ──▶ JSON sémantique ──▶ compose.py ──▶ HTML
                                                                  │
                                              cahier.css ─────────┤
                                                                  ▼
                                              Chromium --print-to-pdf
                                                                  │
                                    couverture + corps ───────────┴──▶ PDF final
```

## Lancer

```bash
python3 faire.py <source.pdf> <couverture.pdf> "<Titre courant>" <sortie.pdf> <clé>
```

`<couverture.pdf>` : le fichier dont la **première page** sert de couverture
(`build.py` régénère les couvertures 2 à 5 sur le modèle de la première).

## Ce que fait l'extraction

Chaque fragment de texte du PDF porte une signature — taille, graisse, italique,
couleur — qui identifie sans ambiguïté son rôle éditorial. On s'appuie dessus
plutôt que sur la position, plus fragile. **Toute signature inconnue arrête la
fabrication** : rien ne doit se perdre en silence.

Deux générations de cahiers coexistent, avec deux grilles typographiques
distinctes ; `extract.py` reconnaît la première à l'en-tête courant de sa
deuxième page et bascule de table.

## Ce que fait la composition

- Les pages du PDF source ne sont pas des unités éditoriales : le document est
  relu comme un flux continu, sinon un bloc à cheval sur deux pages est amputé.
- Le texte source est justifié : une ligne qui n'atteint pas la marge de droite
  termine son paragraphe. C'est exact, contrairement aux écarts verticaux.
- Les mots coupés en fin de ligne sont recollés, sauf les mots réellement
  composés — reconnus à ce qu'ils apparaissent ailleurs sans césure.
- Les grilles de suivi sont relues dans leur géométrie et recomposées en
  tableaux (deux ou trois colonnes, ou matrice habitudes × jours).
- Les numérotations en chiffres romains passent en chiffres arabes, comme sur
  la plateforme — mais seulement là où le signe est bien un nombre : un « C »
  isolé, c'est « C'est », pas cent (`romains.py`).
- Micro-typographie française : apostrophes courbes, espaces insécables devant
  la ponctuation double et autour des guillemets.
- Règles de page : un titre de chapitre emmène le début de son texte, un
  intertitre part avec ses lignes d'écriture, une phrase-clé ne reste jamais
  seule en haut d'une page.

## Contrôle de perte

`faire.py` refuse de produire un fichier si un seul mot manque, deux fois :
après la composition (JSON → HTML) puis après l'impression (HTML → PDF).

## Vérifier une sortie

```bash
python3 remplissage.py <sortie.pdf>   # taux de remplissage page par page
python3 planches.py <sortie.pdf> pref # planches-contact de 10 pages
```
