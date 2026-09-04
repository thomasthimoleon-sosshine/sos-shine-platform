"""Suivi du capital et des positions ouvertes. Utilise a la fois par le
backtest et par le moteur de trading (paper/live) pour garantir que la
comptabilite est identique partout.
"""
from __future__ import annotations

from dataclasses import dataclass, field


@dataclass
class Position:
    symbol: str
    entry_price: float
    size: float
    stop_loss: float
    take_profit: float
    opened_at: object


@dataclass
class Portfolio:
    cash: float
    starting_capital: float = field(init=False)
    positions: dict[str, Position] = field(default_factory=dict)
    closed_trades: list[dict] = field(default_factory=list)
    daily_pnl: float = 0.0
    current_day: object = None

    def __post_init__(self) -> None:
        self.starting_capital = self.cash

    def reset_daily_if_needed(self, day) -> None:
        if self.current_day != day:
            self.current_day = day
            self.daily_pnl = 0.0

    def equity(self, current_prices: dict[str, float]) -> float:
        value = self.cash
        for symbol, pos in self.positions.items():
            value += pos.size * current_prices.get(symbol, pos.entry_price)
        return value

    def open_position(
        self,
        symbol: str,
        entry_price: float,
        size: float,
        stop_loss: float,
        take_profit: float,
        timestamp,
        fee_pct: float,
    ) -> Position:
        cost = entry_price * size
        fee = cost * fee_pct / 100
        self.cash -= cost + fee
        pos = Position(symbol, entry_price, size, stop_loss, take_profit, timestamp)
        self.positions[symbol] = pos
        return pos

    def close_position(
        self, symbol: str, exit_price: float, timestamp, fee_pct: float, reason: str
    ) -> float:
        pos = self.positions.pop(symbol)
        proceeds = exit_price * pos.size
        exit_fee = proceeds * fee_pct / 100
        entry_fee = pos.entry_price * pos.size * fee_pct / 100
        pnl = proceeds - exit_fee - (pos.entry_price * pos.size) - entry_fee

        self.cash += proceeds - exit_fee
        self.daily_pnl += pnl

        trade = {
            "symbol": symbol,
            "entry_price": pos.entry_price,
            "exit_price": exit_price,
            "size": pos.size,
            "pnl": pnl,
            "pnl_pct": pnl / (pos.entry_price * pos.size) * 100,
            "opened_at": pos.opened_at,
            "closed_at": timestamp,
            "reason": reason,
        }
        self.closed_trades.append(trade)
        return pnl
