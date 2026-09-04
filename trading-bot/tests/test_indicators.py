import numpy as np
import pandas as pd

from src.indicators import atr, ema, rsi


def test_ema_converges_towards_constant_series():
    series = pd.Series([100.0] * 50)
    result = ema(series, period=10)
    assert abs(result.iloc[-1] - 100.0) < 1e-6


def test_ema_reacts_to_trend():
    series = pd.Series(np.linspace(100, 200, 50))
    result = ema(series, period=10)
    assert result.iloc[-1] > result.iloc[0]
    assert result.iloc[-1] < series.iloc[-1]  # l'EMA suit avec retard une tendance haussiere


def test_rsi_is_100_on_pure_uptrend():
    series = pd.Series(np.linspace(100, 200, 40))
    result = rsi(series, period=14)
    assert result.iloc[-1] > 90


def test_rsi_is_low_on_pure_downtrend():
    series = pd.Series(np.linspace(200, 100, 40))
    result = rsi(series, period=14)
    assert result.iloc[-1] < 10


def test_rsi_bounded_between_0_and_100():
    rng = np.random.default_rng(42)
    series = pd.Series(100 + np.cumsum(rng.normal(0, 1, 200)))
    result = rsi(series, period=14).dropna()
    assert (result >= 0).all() and (result <= 100).all()


def test_atr_is_zero_for_flat_prices():
    df = pd.DataFrame(
        {
            "high": [100.0] * 30,
            "low": [100.0] * 30,
            "close": [100.0] * 30,
        }
    )
    result = atr(df, period=14)
    assert abs(result.iloc[-1]) < 1e-9


def test_atr_positive_when_volatile():
    df = pd.DataFrame(
        {
            "high": [101, 103, 99, 105, 98, 104, 100, 106, 97, 103] * 3,
            "low": [99, 100, 96, 101, 95, 100, 97, 102, 94, 100] * 3,
            "close": [100, 101, 97, 103, 96, 102, 98, 104, 95, 101] * 3,
        }
    )
    result = atr(df, period=14)
    assert result.iloc[-1] > 0
