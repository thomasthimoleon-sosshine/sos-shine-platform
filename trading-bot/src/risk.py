"""Regles de gestion du risque : taille de position et coupe-circuit journalier.

C'est ce module qui empeche le bot de "tout miser" sur un trade ou de
continuer a trader apres une mauvaise journee.
"""
from __future__ import annotations

from src.config import RiskConfig
from src.portfolio import Portfolio


class RiskManager:
    def __init__(self, cfg: RiskConfig):
        self.cfg = cfg

    def daily_loss_limit_hit(self, portfolio: Portfolio) -> bool:
        max_loss = portfolio.starting_capital * (self.cfg.max_daily_loss_pct / 100)
        return portfolio.daily_pnl <= -abs(max_loss)

    def can_open_new_position(self, portfolio: Portfolio, symbol: str) -> bool:
        if symbol in portfolio.positions:
            return False
        if len(portfolio.positions) >= self.cfg.max_open_positions:
            return False
        if self.daily_loss_limit_hit(portfolio):
            return False
        return True

    def position_size(
        self, portfolio: Portfolio, entry_price: float, stop_loss_price: float
    ) -> float:
        """Taille calculee pour que, si le stop-loss est touche, la perte
        corresponde exactement a risk_per_trade_pct du capital de depart.
        """
        stop_distance = abs(entry_price - stop_loss_price)
        if stop_distance <= 0 or entry_price <= 0:
            return 0.0

        risk_amount = portfolio.starting_capital * (self.cfg.risk_per_trade_pct / 100)
        size = risk_amount / stop_distance

        max_position_value = portfolio.starting_capital * (
            self.cfg.max_position_pct_of_capital / 100
        )
        size = min(size, max_position_value / entry_price)

        # Ne jamais depenser plus de cash disponible que ce qu'on a reellement
        affordable_size = portfolio.cash / entry_price
        size = min(size, affordable_size)

        return max(size, 0.0)
