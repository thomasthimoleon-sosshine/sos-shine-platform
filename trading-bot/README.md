# Robot de trading crypto (Binance)

Bot de trading automatique en Python, strategie de suivi de tendance
(croisement d'EMA + filtre RSI), gestion du risque integree (stop-loss ATR,
taille de position, coupe-circuit journalier).

## ⚠️ Lire avant toute chose

- **Aucun robot ne garantit un gain quotidien.** Les marches crypto sont
  volatils ; ce bot peut perdre de l'argent, y compris plusieurs jours de
  suite. Ne trade jamais un montant que tu ne peux pas te permettre de perdre.
- Avec un petit capital (ex. 200€), les frais d'exchange (0.1%/ordre sur
  Binance spot) et les minimums d'ordre pesent proportionnellement plus lourd.
  Ce bot est configure pour rester prudent (peu de positions simultanees,
  risque limite par trade) plutot que pour maximiser la frequence de trades.
- **Ne jamais passer en mode `--live` avant d'avoir valide la strategie** en
  backtest puis en paper trading (testnet) pendant au moins plusieurs
  semaines, sur plusieurs regimes de marche (hausse, baisse, range).

## Comment ca marche

1. **Backtest** (`src/backtest.py`) : rejoue la strategie sur des donnees
   historiques Binance pour estimer sa performance passee.
2. **Paper trading** (`src/trader.py`, mode par defaut) : le bot tourne en
   continu et passe de vrais ordres... sur le **testnet Binance** (argent
   fictif, conditions de marche reelles).
3. **Live trading** (`--live`) : memes ordres mais avec ton argent reel.
   Necessite une confirmation explicite au lancement.

Le point cle : le backtest, le paper trading et le live trading partagent
**exactement la meme logique de decision** (`src/engine.py`). Ca evite le
piege classique ou le bot "backteste bien" mais se comporte differemment en
reel.

### Strategie

- **Signal d'achat** : l'EMA rapide (12) croise au-dessus de l'EMA lente (26),
  et le RSI(14) n'est pas en zone de surachat (< 75).
- **Stop-loss** : place a `ATR(14) x 2` sous le prix d'entree (s'adapte a la
  volatilite du marche).
- **Take-profit** : ratio risque/recompense de 1.5 (ex. si le stop est a -2%,
  le take-profit est a +3%).
- **Sortie alternative** : croisement EMA baissier (sortie de tendance).
- Long uniquement (pas de vente a decouvert, pas de levier) : le risque est
  toujours limite au capital investi.

### Gestion du risque

- `risk_per_trade_pct` : perte max par trade si le stop est touche
  (par defaut 1.5% du capital).
- `max_daily_loss_pct` : coupe-circuit — si le bot perd ce % du capital dans
  la journee, il arrete d'ouvrir de nouvelles positions jusqu'au lendemain
  (par defaut 5%).
- `max_open_positions` : nombre de positions simultanees (par defaut 2 —
  volontairement bas vu le capital de depart).
- `max_position_pct_of_capital` : une position ne peut jamais depasser ce %
  du capital total, meme si le calcul de risque suggererait plus.

Tous ces parametres se trouvent dans `config.yaml`.

## Installation

```bash
cd trading-bot
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

cp config.example.yaml config.yaml
cp .env.example .env
```

### Cles API Binance (testnet)

1. Va sur https://testnet.binance.vision/ et connecte-toi avec ton compte
   GitHub pour generer des cles API de test (aucun rapport avec ton compte
   Binance reel, aucun risque financier).
2. Mets ces cles dans `.env` :
   ```
   BINANCE_API_KEY=...
   BINANCE_API_SECRET=...
   ```
3. Verifie que `config.yaml` a bien `exchange.testnet: true`.

## Utilisation

### 1. Backtester la strategie

```bash
python -m src.main backtest --plot equity_curve.png
```

Ajuste `backtest.start_date` / `backtest.end_date` dans `config.yaml` pour
tester differentes periodes. Regarde en particulier :
- le **rendement total** et le **drawdown max** (la pire perte depuis un pic),
- le **taux de reussite** et le **nombre de trades** (trop peu de trades =
  resultat pas statistiquement fiable, teste sur une periode plus longue).

### 2. Paper trading (recommande avant tout argent reel)

```bash
python -m src.main trade
```

Le bot tourne en continu, verifie chaque symbole a chaque cloture de bougie,
et passe de vrais ordres sur le testnet Binance. Laisse tourner plusieurs
jours/semaines et regarde les logs.

### 3. Live trading (argent reel — seulement apres validation)

1. Cree de vraies cles API sur ton compte Binance (permissions "spot
   trading" uniquement, jamais de retrait).
2. Passe `exchange.testnet: false` dans `config.yaml` et mets tes vraies
   cles dans `.env`.
3. Lance :
   ```bash
   python -m src.main trade --live
   ```
   Une confirmation explicite (`CONFIRMER`) est demandee avant de commencer.

## Tests

```bash
python -m pytest tests/ -v
```

28 tests couvrent les indicateurs, la strategie (y compris l'absence de
lookahead bias), le calcul de taille de position, le coupe-circuit et le
moteur de decision.

## Limites connues / ameliorations possibles

- L'etat du portfolio (positions ouvertes, PnL du jour) vit en memoire : si
  le process redemarre, il "oublie" les positions deja ouvertes sur
  l'exchange. Pour un usage prolonge, ajouter une persistance (fichier JSON
  ou base de donnees).
- Pas d'alerting (Telegram/email) en cas d'erreur ou de trade — les logs
  console suffisent pour tester, mais un usage prolonge merite des
  notifications.
- Une seule strategie (suivi de tendance). D'autres approches (mean
  reversion, grid trading) pourraient etre ajoutees comme strategies
  alternatives dans `src/strategy.py`.
