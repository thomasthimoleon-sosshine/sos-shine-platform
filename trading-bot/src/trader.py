"""Moteur de trading en continu : paper trading (testnet) ou live (argent reel).

Utilise la meme logique de decision que le backtest (src/engine.py). La seule
difference : ici, ouvrir/fermer une position passe par de vrais ordres sur
l'exchange (testnet ou reel selon la config) avant de mettre a jour le
portfolio avec le prix reellement execute.
"""
from __future__ import annotations

import logging
import time
from datetime import datetime, timezone

from src.config import Config
from src.engine import process_bar
from src.exchange import ExchangeClient
from src.portfolio import Portfolio
from src.risk import RiskManager
from src.strategy import generate_signals

logger = logging.getLogger("trading-bot")


class TradingEngine:
    def __init__(self, cfg: Config, exchange: ExchangeClient | None = None):
        self.cfg = cfg
        self.exchange = exchange or ExchangeClient(cfg.exchange)
        self.portfolio = Portfolio(cash=cfg.trading.capital_eur)
        self.risk_manager = RiskManager(cfg.risk)

    def _open_cb(self, symbol, entry_price, size, stop_loss, take_profit, timestamp):
        order = self.exchange.create_market_buy(symbol, size)
        filled_price = float(order.get("average") or order.get("price") or entry_price)
        filled_amount = float(order.get("filled") or size)
        self.portfolio.open_position(
            symbol, filled_price, filled_amount, stop_loss, take_profit, timestamp, 0.1
        )
        logger.info(
            "ACHAT %s | prix=%.4f taille=%.6f stop=%.4f target=%.4f",
            symbol, filled_price, filled_amount, stop_loss, take_profit,
        )

    def _close_cb(self, symbol, exit_price, timestamp, reason):
        position = self.portfolio.positions[symbol]
        order = self.exchange.create_market_sell(symbol, position.size)
        filled_price = float(order.get("average") or order.get("price") or exit_price)
        pnl = self.portfolio.close_position(symbol, filled_price, timestamp, 0.1, reason)
        logger.info(
            "VENTE %s | prix=%.4f raison=%s pnl=%.2f", symbol, filled_price, reason, pnl
        )

    def run_once(self) -> None:
        """Une iteration : verifie chaque symbole sur la derniere bougie CLOTUREE."""
        for symbol in self.cfg.trading.symbols:
            warmup = max(
                self.cfg.strategy.ema_slow,
                self.cfg.strategy.rsi_period,
                self.cfg.strategy.atr_period,
            )
            df = self.exchange.fetch_ohlcv_df(
                symbol, self.cfg.trading.timeframe, limit=warmup + 50
            )
            if len(df) < warmup + 2:
                logger.warning("Pas assez de donnees pour %s, on attend.", symbol)
                continue

            df = generate_signals(df, self.cfg.strategy)
            # -1 = bougie en cours (incomplete), -2 = derniere bougie cloturee
            row = df.iloc[-2].copy()
            row["day"] = row["timestamp"].date()

            action = process_bar(
                self.portfolio,
                self.risk_manager,
                symbol,
                row,
                self.cfg.strategy,
                self._open_cb,
                self._close_cb,
            )
            if action:
                logger.info("Action sur %s : %s", symbol, action)

    def run_forever(self) -> None:
        import ccxt

        seconds = ccxt.Exchange.parse_timeframe(self.cfg.trading.timeframe)
        logger.info(
            "Demarrage du bot (%s, testnet=%s). Frequence : toutes les %ds.",
            self.cfg.trading.timeframe, self.cfg.exchange.testnet, seconds,
        )
        while True:
            try:
                self.run_once()
            except Exception:
                logger.exception("Erreur pendant le cycle de trading, on continue.")

            now = datetime.now(timezone.utc).timestamp()
            sleep_for = seconds - (now % seconds) + 5  # petite marge apres la cloture de bougie
            logger.info("Prochain cycle dans %.0fs.", sleep_for)
            time.sleep(sleep_for)
