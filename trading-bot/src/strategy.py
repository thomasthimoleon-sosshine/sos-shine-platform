"""Strategie de suivi de tendance : croisement d'EMA filtre par le RSI.

Long uniquement (pas de vente a decouvert). Sortie sur stop-loss, take-profit
(geres par le portfolio/engine) ou croisement EMA baissier.
"""
from __future__ import annotations

import pandas as pd

from src.config import StrategyConfig
from src.indicators import atr, ema, rsi


def compute_indicators(df: pd.DataFrame, cfg: StrategyConfig) -> pd.DataFrame:
    df = df.copy()
    df["ema_fast"] = ema(df["close"], cfg.ema_fast)
    df["ema_slow"] = ema(df["close"], cfg.ema_slow)
    df["rsi"] = rsi(df["close"], cfg.rsi_period)
    df["atr"] = atr(df, cfg.atr_period)
    return df


def generate_signals(df: pd.DataFrame, cfg: StrategyConfig) -> pd.DataFrame:
    """Ajoute une colonne 'signal' ('buy' / 'sell' / 'hold') calculee uniquement
    a partir des donnees disponibles jusqu'a la bougie courante (pas de lookahead).
    """
    df = compute_indicators(df, cfg)

    prev_fast = df["ema_fast"].shift(1)
    prev_slow = df["ema_slow"].shift(1)

    cross_up = (prev_fast <= prev_slow) & (df["ema_fast"] > df["ema_slow"])
    cross_down = (prev_fast >= prev_slow) & (df["ema_fast"] < df["ema_slow"])

    df["signal"] = "hold"
    df.loc[cross_up & (df["rsi"] < cfg.rsi_overbought), "signal"] = "buy"
    df.loc[cross_down, "signal"] = "sell"

    # Pas assez d'historique pour un signal fiable (EMA/RSI/ATR pas encore stabilises)
    warmup = max(cfg.ema_slow, cfg.rsi_period, cfg.atr_period)
    df.iloc[: warmup + 1, df.columns.get_loc("signal")] = "hold"

    return df


def stop_loss_price(entry_price: float, atr_value: float, cfg: StrategyConfig) -> float:
    return entry_price - atr_value * cfg.atr_stop_multiplier


def take_profit_price(entry_price: float, stop_loss: float, cfg: StrategyConfig) -> float:
    risk = entry_price - stop_loss
    return entry_price + risk * cfg.risk_reward_ratio
