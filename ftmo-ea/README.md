# Robot FTMO (Expert Advisor MetaTrader 5)

Robot de suivi de tendance pour un challenge FTMO, en MQL5. Meme philosophie
que le bot crypto (`trading-bot/`) mais adapte au forex/CFD via MetaTrader :
EMA(12/26) + filtre RSI, long **et** short, stop-loss/take-profit poses
directement chez le broker, coupe-circuits internes plus stricts que les
regles FTMO.

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

## Ce qui n'est pas gere (limites connues)

- Pas de filtre sur les annonces macro-economiques a fort impact (NFP, taux
  directeurs...) — la volatilite extreme autour de ces evenements peut
  toucher le stop-loss plus violemment que prevu. A surveiller manuellement,
  ou ajouter un filtre calendrier economique plus tard.
- Une seule paire (EURUSD) — volontairement simple. Ajouter d'autres paires
  demande de gerer la correlation entre elles pour ne pas multiplier le
  risque reel au-dela de ce que les parametres suggerent individuellement.
- Pas de notification (Telegram/email) en cas d'arret d'urgence — verifie le
  journal `Experts` dans MT5 regulierement, ou ajoute une alerte plus tard.
