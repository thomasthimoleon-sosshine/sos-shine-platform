import numpy as np
import pandas as pd

from src.config import StrategyConfig
from src.strategy import generate_signals, stop_loss_price, take_profit_price

CFG = StrategyConfig(
    ema_fast=5,
    ema_slow=10,
    rsi_period=14,
    rsi_overbought=75,
    atr_period=14,
    atr_stop_multiplier=2.0,
    risk_reward_ratio=1.5,
)


def _make_df(closes: list[float]) -> pd.DataFrame:
    closes = np.array(closes)
    return pd.DataFrame(
        {
            "timestamp": pd.date_range("2024-01-01", periods=len(closes), freq="1h", tz="UTC"),
            "open": closes,
            "high": closes * 1.001,
            "low": closes * 0.999,
            "close": closes,
            "volume": np.ones(len(closes)),
        }
    )


def test_warmup_period_has_no_signal():
    df = _make_df(list(100 + np.cumsum(np.random.default_rng(1).normal(0, 0.5, 60))))
    result = generate_signals(df, CFG)
    warmup = max(CFG.ema_slow, CFG.rsi_period, CFG.atr_period)
    assert (result["signal"].iloc[: warmup + 1] == "hold").all()


def test_buy_signal_appears_on_bullish_crossover():
    # Baisse puis forte hausse : l'EMA rapide doit finir par croiser l'EMA lente vers le haut.
    down = np.linspace(120, 100, 30)
    up = np.linspace(100, 160, 30)
    df = _make_df(list(down) + list(up))
    result = generate_signals(df, CFG)
    assert (result["signal"] == "buy").any()


def test_no_lookahead_bias_in_signal():
    """Le signal a l'index i ne doit pas changer si on tronque le dataframe apres i."""
    rng = np.random.default_rng(7)
    closes = list(100 + np.cumsum(rng.normal(0, 1, 80)))
    df_full = _make_df(closes)
    full_signals = generate_signals(df_full, CFG)

    check_index = 50
    df_truncated = df_full.iloc[: check_index + 1].copy()
    truncated_signals = generate_signals(df_truncated, CFG)

    assert (
        full_signals["signal"].iloc[check_index]
        == truncated_signals["signal"].iloc[check_index]
    )


def test_stop_loss_is_below_entry_for_long():
    stop = stop_loss_price(entry_price=100, atr_value=2, cfg=CFG)
    assert stop < 100
    assert stop == 100 - 2 * CFG.atr_stop_multiplier


def test_take_profit_respects_risk_reward_ratio():
    entry = 100.0
    stop = stop_loss_price(entry, atr_value=2, cfg=CFG)
    target = take_profit_price(entry, stop, CFG)
    risk = entry - stop
    reward = target - entry
    assert abs(reward / risk - CFG.risk_reward_ratio) < 1e-9
