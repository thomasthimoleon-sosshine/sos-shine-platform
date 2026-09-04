# Robots FTMO (Expert Advisors MetaTrader 5)

Trois robots independants pour un challenge FTMO, en MQL5 :

1. **`EA_FTMO_TrendFollow.mq5`** — suivi de tendance EMA/RSI sur EURUSD H1.
   Simple, peu de parametres, facile a valider.
2. **`EA_FTMO_ICT_NAS100.mq5`** — inspire de la methode ICT/SMC multi-
   temporalites decrite par l'utilisateur, adapte a NAS100. Plus complexe,
   plusieurs choix d'interpretation ont ete necessaires (detailles plus bas).
3. **`EA_FTMO_TTS_US30.mq5`** — reproduit la technique reelle du pere de
   l'utilisateur (deja utilisee sur un compte FTMO 100k) sur US30 : confluence
   SAR + RSI + indicateur TradingView "Trend Trader Strategy" dans une
   fenetre de 15 minutes, SL sur le retournement du SAR, sortie en 2 paliers.

Les deux partagent la meme philosophie de securite : stop-loss/take-profit
poses directement chez le broker, coupe-circuits internes plus stricts que
les regles FTMO, arret d'urgence persistant.

## ⚠️ Lire avant toute chose

- **Aucun robot ne garantit de reussir un challenge FTMO.** La majorite des
  traders qui tentent un challenge (avec ou sans robot) echouent. Un
  challenge est payant et non rembourse en cas d'echec (sauf conditions
  specifiques de FTMO a verifier sur leur site).
- Ce code n'a **pas ete compile ni teste** dans MetaTrader depuis l'endroit
  ou il a ete ecrit (pas d'acces a MetaEditor ni aux serveurs de brokers
  depuis cet environnement). **Toi seul peux le valider** : compilation,
  Strategy Tester, puis compte demo, avant tout compte reel ou challenge
  payant.
- Les regles FTMO (perte journaliere, drawdown, objectifs) peuvent changer.
  Verifie toujours les regles exactes de ton challenge sur ftmo.com avant de
  lancer le robot.

## Etapes obligatoires avant d'utiliser de l'argent reel

1. **Compiler** : ouvre `EA_FTMO_TrendFollow.mq5` dans MetaEditor (fourni
   avec MetaTrader 5) et compile (F7). Corrige toute erreur eventuelle —
   je n'ai pas pu verifier la compilation moi-meme.
2. **Backtester** dans le Strategy Tester de MT5 (Ctrl+R) :
   - Symbole EURUSD, periode H1, mode "Every tick based on real ticks".
   - Teste sur plusieurs periodes (haussiere, baissiere, range) sur au moins
     1-2 ans d'historique.
   - Regarde le drawdown max, le profit factor, le nombre de trades — si
     trop peu de trades sur la periode, le resultat n'est pas fiable
     statistiquement.
3. **Compte demo FTMO** (gratuit, "FTMO Free Trial" ou demo MT5 standard) :
   laisse tourner le robot au moins 2-3 semaines en conditions reelles avant
   d'envisager un challenge payant.
4. **Challenge payant** : seulement une fois les deux etapes precedentes
   concluantes.

## Installation

1. Ouvre MetaTrader 5 → `Fichier` → `Ouvrir le dossier de donnees`.
2. Copie `EA_FTMO_TrendFollow.mq5` dans `MQL5/Experts/`.
3. Redemarre MT5 ou clique droit sur `Experts` dans le Navigateur →
   `Actualiser`.
4. Ouvre un graphique **EURUSD, periode H1**, glisse l'EA dessus.
5. Dans l'onglet `Common` de la fenetre de parametres : coche
   `Autoriser l'algo trading`.
6. Verifie dans la barre d'outils que l'algo trading est active (bouton
   vert "AutoTrading" en haut).

## Parametres importants

| Parametre | Defaut | Role |
|---|---|---|
| `InpRiskPerTradePct` | 0.5% | Perte max par trade (si le stop est touche) en % du solde |
| `InpDailyLossLimitPct` | 2.0% | Coupe-circuit journalier interne (FTMO tolere 5% — on s'arrete bien avant) |
| `InpMaxDrawdownPct` | 6.0% | Coupe-circuit total interne (FTMO tolere 10% — on s'arrete bien avant) |
| `InpAtrStopMultiplier` | 2.0 | Distance du stop-loss = ATR(14) x ce multiplicateur |
| `InpRiskRewardRatio` | 1.5 | Take-profit = 1.5x la distance du stop-loss |
| `InpCloseBeforeWeekend` | true | Ferme toutes les positions le vendredi avant le week-end (evite le risque de gap) |
| `InpAllowShort` | true | Autorise les ventes a decouvert (desactive si tu veux rester long seulement) |
| `InpResetHaltState` | false | A repasser a `true` puis relancer l'EA pour reactiver le trading apres un arret d'urgence (drawdown max atteint) — comprends d'abord pourquoi ca s'est arrete avant de reactiver |
| `InpMaxTradesPerDay` | 3 | Combien de nouveaux trades max par jour. Mets 1 pour "un trade par jour", ou une valeur haute (voire 0 = illimite) pour trader plus frequemment |
| `InpMaxTotalTrades` | 10 | L'EA arrete d'ouvrir de nouveaux trades une fois ce total atteint (toutes journees confondues) — protection contre le surtrading. 0 = illimite |
| `InpResetTradeCounter` | false | A repasser a `true` puis relancer pour remettre le compteur total de trades a zero |

## Le coupe-circuit ("Halt")

Si le drawdown total interne (`InpMaxDrawdownPct`) est atteint, le robot :
1. Ferme immediatement toutes les positions ouvertes.
2. S'arrete completement et **le reste meme si tu redemarres MT5** (etat
   sauvegarde dans les variables globales du terminal).
3. Ne redemarre que si tu repasses manuellement `InpResetHaltState` a `true`.

C'est volontaire : un arret d'urgence ne doit jamais repartir tout seul sans
que tu aies compris ce qui s'est passe.

Si seulement la limite journaliere (`InpDailyLossLimitPct`) est atteinte, le
robot ferme les positions et arrete d'en ouvrir de nouvelles **pour le reste
de la journee seulement** — il repart normalement le lendemain (alignement
sur l'ouverture de la bougie journaliere du broker, comme FTMO).

## Ce qui n'est pas gere (limites connues) — EA_FTMO_TrendFollow

- Pas de filtre sur les annonces macro-economiques a fort impact (NFP, taux
  directeurs...) — la volatilite extreme autour de ces evenements peut
  toucher le stop-loss plus violemment que prevu. A surveiller manuellement,
  ou ajouter un filtre calendrier economique plus tard.
- Une seule paire (EURUSD) — volontairement simple. Ajouter d'autres paires
  demande de gerer la correlation entre elles pour ne pas multiplier le
  risque reel au-dela de ce que les parametres suggerent individuellement.
- Pas de notification (Telegram/email) en cas d'arret d'urgence — verifie le
  journal `Experts` dans MT5 regulierement, ou ajoute une alerte plus tard.

---

# EA_FTMO_ICT_NAS100 : robot inspire de l'ICT/SMC

## Ce n'est PAS "la" methode ICT officielle

La description fournie par l'utilisateur (biais HTF via Fair Value Gap,
structure MTF en 15/5 minutes avec key levels, entree en 1 minute sur prise
de liquidite + inverse FVG) est deja precise, mais **elle ne definissait pas
tout** : ni le stop-loss, ni le take-profit, ni la temporalite HTF exacte, ni
la definition chiffree d'un "point" de structure. Ces trous ont ete combles
par des choix d'ingenieur, pas par une regle ICT etablie. Resultat : ce
robot est une **traduction mecanique et personnelle** de la methode decrite,
pas une implementation certifiee de l'ICT/SMC.

## Choix d'interpretation faits (a valider/ajuster toi-meme)

| Element manquant dans la description originale | Choix fait | Pourquoi |
|---|---|---|
| Temporalite HTF exacte | H4 | Association HTF/MTF/LTF la plus standard en ICT (H4 → M15/M5 → M1) |
| Definition d'un "point" de structure | Fractal a 2 bougies de chaque cote (`InpSwingLookback`) | Definition chiffree la plus simple et objective d'un swing high/low |
| Stop-loss | Extremite du point de liquidite balaye, + une marge de securite (0.3x ATR M1) | Correspond a la logique ICT "stop au-dela du raid de liquidite" |
| Take-profit | 2x la distance du stop (ratio risque/recompense fixe) | Plus simple et fiable a coder qu'une detection automatique du "prochain pool de liquidite opposee", qui demanderait encore plus de jugement subjectif |
| "Mitigation" d'un Fair Value Gap | Le FVG est ignore si le prix a, depuis, entierement retraverse sa zone | Definition ICT standard de la mitigation, simplifiee (pas de gestion des mitigations partielles) |
| Filtre horaire | Desactivable, par defaut 14h-17h heure serveur (a ajuster toi-meme, voir plus bas) | NAS100 n'est pas liquide 24h/24 ; viser la NY AM killzone (~9h30-11h heure de New York) reduit le bruit |
| Fermeture avant cloture quotidienne | 21h heure serveur par defaut | Evite de garder une position sur un indice pendant que le marche est ferme (risque de gap a la reouverture) |

**Tu dois recalibrer `InpSessionStartHour`/`InpSessionEndHour`** : l'heure
"serveur" de ton broker n'est pas l'heure de New York. Regarde l'heure
affichee en bas a droite de MT5, compare-la a l'heure de New York au meme
instant, et ajuste les deux parametres en consequence pour viser la fenetre
9h30-11h heure de New York.

## Pourquoi NAS100 est plus risque qu'EURUSD

- Marche pas continu 24h/24 : des gaps peuvent survenir a l'ouverture/apres
  une fermeture, sautant potentiellement par-dessus un stop-loss.
- Spread generalement plus large chez la plupart des brokers → cout par
  trade plus eleve.
- Plus volatil : les mouvements peuvent etre plus violents et rapides,
  surtout sur des entrees en 1 minute.

## Installation

Meme procedure que pour `EA_FTMO_TrendFollow` (voir plus haut), avec deux
differences :
- Attache l'EA a un graphique du symbole NAS100 de **ton broker** (le nom
  exact varie : `NAS100`, `US100`, `USTEC`, `NAS100.cash`... regarde dans le
  Market Watch de MT5). Le code ne code pas le nom en dur, il utilise le
  symbole du graphique sur lequel il est attache.
- Verifie que ton broker fournit bien les 3 temporalites necessaires (M1,
  M5, M15, H4) avec suffisamment d'historique charge pour le backtest.

## Parametres importants

| Parametre | Defaut | Role |
|---|---|---|
| `InpHTF` / `InpStructureTF` / `InpConfirmTF` / `InpEntryTF` | H4 / M15 / M5 / M1 | Les 4 temporalites du systeme |
| `InpSwingLookback` | 2 | Nombre de bougies de chaque cote pour valider un point de structure |
| `InpFVGLookbackBars` | 40 | Profondeur de recherche du dernier FVG HTF non mitige |
| `InpMaxSweepSearchBars` | 5 | Delai max (en bougies M1) pour attendre l'inverse FVG apres une prise de liquidite |
| `InpKeyLevelTolerancePts` | 50 | Tolerance (en points) pour considerer qu'un balayage a bien eu lieu au niveau du key level |
| `InpRiskPerTradePct` | 0.4% | Risque par trade, un peu plus prudent que l'EA EURUSD vu la volatilite de NAS100 |
| `InpRiskRewardRatio` | 2.0 | Cible = 2x le risque pris |
| `InpMaxTradesPerDay` | 3 | Combien de nouveaux trades max par jour. Mets 1 pour "un trade par jour", ou une valeur haute pour trader plus frequemment |
| `InpMaxTotalTrades` | 10 | L'EA arrete d'ouvrir de nouveaux trades une fois ce total atteint — protection contre le surtrading. 0 = illimite |

## Limites connues supplementaires

- Aucune gestion des annonces macro US (CPI, decisions Fed, earnings des
  grosses techs qui composent le NAS100) — a surveiller manuellement.
- La detection de structure sur 1 minute peut generer du bruit et des faux
  signaux plus frequemment que sur des temporalites plus hautes — a observer
  attentivement pendant le backtest et le paper trading.
- Comme pour l'autre EA : jamais teste sur de vraies donnees depuis
  l'endroit ou il a ete ecrit. La validation (compilation, Strategy Tester,
  demo prolongee) est **entierement a faire par toi** avant tout argent reel.

---

# EA_FTMO_TTS_US30 : la technique du pere, reproduite sur US30

## Ce qui vient directement du pere (aucune interpretation de ma part)

- Confluence de 3 signaux — SAR, RSI, et l'indicateur TradingView "Trend
  Trader Strategy" (TTS) — qui doivent tous se declencher dans une fenetre
  de 15 minutes maximum.
- Temporalite : **M5**.
- RSI : condition sur le niveau **50** (croisement au-dessus = signal
  haussier, en-dessous = baissier).
- Stop-loss = point de retournement du SAR au moment de l'entree.
- Regle d'amplitude (distance en points entre le prix d'entree et ce point
  de retournement) :
  - Si l'amplitude est **inferieure a 40 points** → le stop-loss est plafonne
    (plancher) a 40 points quand meme.
  - Si l'amplitude est **superieure a 100 points** → le stop-loss est
    divise par deux.
  - Entre les deux → le stop-loss suit l'amplitude telle quelle.
- Sortie en 2 paliers : **TP1 a 1x le risque** → cloture de la moitie de la
  position + stop remonte au point d'entree (breakeven) ; **TP2 a 2x le
  risque** → cloture du reste.
- EMA 8/21 : filtre de renfort optionnel, pas obligatoire pour entrer
  (desactive par defaut, `InpUseEmaFilter`).
- Le code source exact de l'indicateur TTS (script TradingView "Trend
  Trader Strategy" par HPotter, base sur l'article d'Andrew Abraham,
  TASC septembre 1998) a ete fourni par l'utilisateur et traduit en MQL5
  calcul par calcul : une ligne de tendance a cliquets qui se recale sur le
  plus haut/bas des 21 dernieres bougies moins/plus 3x une moyenne mobile
  ponderee du True Range, uniquement quand le prix casse franchement d'un
  cote (sinon elle reste figee).

## Ce que j'ai du decider moi-meme (le pere n'a pas precise)

| Element manquant | Choix fait |
|---|---|
| Reglages du SAR (step / maximum) | Valeurs par defaut standard MetaTrader : 0.02 / 0.2 |
| Periode du RSI | 14 (standard — seul le niveau 50 etait precise) |
| Risque par trade (% du solde) | 0.5% par defaut — le pere n'a donne que des niveaux en points/RR, pas un % de capital |
| Fermeture avant cloture quotidienne | Activee par defaut (21h heure serveur) — US30 n'est pas un marche 24h/24, meme logique que pour NAS100 |
| Definition de "points" pour l'amplitude (40/100) | Distance de prix brute (1 point = 1.0 en prix), PAS convertie via `_Point` du broker. **A verifier toi-meme** : si le broker de ton pere cote US30 avec une convention differente, les seuils 40/100 devront peut-etre etre ajustes en consequence |

## Installation

Meme procedure que les deux autres EA, avec :
- Attache-le a un graphique du symbole **US30** de ton broker (le nom exact
  varie : `US30`, `US30.cash`, `DJ30`... regarde le Market Watch).
- Utilise la temporalite **M5** sur le graphique.

## Parametres importants

| Parametre | Defaut | Role |
|---|---|---|
| `InpConfluenceWindowMin` | 15 | Fenetre max (minutes) entre les 3 signaux |
| `InpSarStep` / `InpSarMax` | 0.02 / 0.2 | Reglages du Parabolic SAR |
| `InpRsiPeriod` | 14 | Periode du RSI |
| `InpTtsLength` / `InpTtsMultiplier` | 21 / 3.0 | Parametres d'origine du script TradingView TTS |
| `InpUseEmaFilter` | false | Active le filtre de renfort EMA 8/21 (optionnel selon le pere) |
| `InpAmplitudeFloorPts` / `InpAmplitudeCapPts` | 40 / 100 | Seuils de la regle d'amplitude du pere |
| `InpRiskPerTradePct` | 0.5% | Risque par trade (non precise par le pere, choix par defaut) |
| `InpMaxTradesPerDay` / `InpMaxTotalTrades` | 3 / 10 | Memes garde-fous anti-surtrading que les autres EA |

## Limite technique a connaitre

Si l'EA redemarre (crash, coupure) pendant qu'une position est ouverte et
que TP1 a deja ete pris, il essaie de le deviner (si le stop est deja au
prix d'entree, il suppose que TP1 est passe) — c'est une heuristique, pas
une garantie a 100%. Comme toujours : jamais compile ni teste sur de
vraies donnees depuis l'endroit ou il a ete ecrit.
