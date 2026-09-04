"""Logique de decision partagee entre le backtest et le trading paper/live.

Utiliser exactement le meme code de decision partout est essentiel : c'est ce
qui garantit qu'un backtest valide reflete vraiment ce que le bot fera en
conditions reelles.

Les callbacks `open_cb` / `close_cb` permettent de brancher soit une simple
comptabilite simulee (backtest), soit de vrais ordres d'echange (paper/live)
avant de mettre a jour le portfolio.
"""
from __future__ import annotations

from typing import Callable, Optional

from src.config import StrategyConfig
from src.portfolio import Portfolio
from src.risk import RiskManager
from src.strategy import stop_loss_price, take_profit_price

OpenCallback = Callable[[str, float, float, float, float, object], None]
CloseCallback = Callable[[str, float, object, str], None]


def process_bar(
    portfolio: Portfolio,
    risk_manager: RiskManager,
    symbol: str,
    row,
    strategy_cfg: StrategyConfig,
    open_cb: OpenCallback,
    close_cb: CloseCallback,
) -> Optional[str]:
    """Traite une bougie close pour un symbole donne. Retourne l'action prise
    ('opened' / 'closed_stop' / 'closed_take_profit' / 'closed_signal' / None).
    """
    portfolio.reset_daily_if_needed(row["day"])

    position = portfolio.positions.get(symbol)

    if position is not None:
        # Le stop-loss est prioritaire sur le take-profit si les deux sont
        # touches dans la meme bougie (hypothese prudente).
        if row["low"] <= position.stop_loss:
            close_cb(symbol, position.stop_loss, row["timestamp"], "stop_loss")
            return "closed_stop"
        if row["high"] >= position.take_profit:
            close_cb(symbol, position.take_profit, row["timestamp"], "take_profit")
            return "closed_take_profit"
        if row["signal"] == "sell":
            close_cb(symbol, row["close"], row["timestamp"], "signal_exit")
            return "closed_signal"
        return None

    if row["signal"] == "buy" and risk_manager.can_open_new_position(portfolio, symbol):
        entry_price = row["close"]
        stop_loss = stop_loss_price(entry_price, row["atr"], strategy_cfg)
        take_profit = take_profit_price(entry_price, stop_loss, strategy_cfg)
        size = risk_manager.position_size(portfolio, entry_price, stop_loss)

        if size > 0:
            open_cb(symbol, entry_price, size, stop_loss, take_profit, row["timestamp"])
            return "opened"

    return None
