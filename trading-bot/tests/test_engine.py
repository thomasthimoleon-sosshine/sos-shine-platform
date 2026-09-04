from src.config import RiskConfig, StrategyConfig
from src.engine import process_bar
from src.portfolio import Portfolio
from src.risk import RiskManager

STRAT_CFG = StrategyConfig(
    ema_fast=5, ema_slow=10, rsi_period=14, rsi_overbought=75,
    atr_period=14, atr_stop_multiplier=2.0, risk_reward_ratio=1.5,
)
RISK_CFG = RiskConfig(
    risk_per_trade_pct=1.5, max_daily_loss_pct=5.0,
    max_open_positions=2, max_position_pct_of_capital=60,
)


def _row(**overrides):
    base = dict(
        timestamp="t1", day="2024-01-01", close=100.0, high=100.5, low=99.5,
        atr=2.0, signal="hold",
    )
    base.update(overrides)
    return base


def test_process_bar_opens_position_on_buy_signal():
    portfolio = Portfolio(cash=200.0)
    rm = RiskManager(RISK_CFG)
    opened = []
    process_bar(
        portfolio, rm, "BTC/USDT", _row(signal="buy"), STRAT_CFG,
        open_cb=lambda *a: opened.append(a), close_cb=lambda *a: None,
    )
    assert len(opened) == 1


def test_process_bar_ignores_buy_when_no_position_slot_available():
    portfolio = Portfolio(cash=200.0)
    rm = RiskManager(RISK_CFG)
    portfolio.open_position("ETH/USDT", 100, 0.1, 95, 110, "t0", fee_pct=0.1)
    portfolio.open_position("SOL/USDT", 100, 0.1, 95, 110, "t0", fee_pct=0.1)

    opened = []
    process_bar(
        portfolio, rm, "BTC/USDT", _row(signal="buy"), STRAT_CFG,
        open_cb=lambda *a: opened.append(a), close_cb=lambda *a: None,
    )
    assert opened == []


def test_process_bar_closes_on_stop_loss_hit():
    portfolio = Portfolio(cash=200.0)
    rm = RiskManager(RISK_CFG)
    portfolio.open_position("BTC/USDT", entry_price=100, size=1.0, stop_loss=98, take_profit=110,
                             timestamp="t0", fee_pct=0.1)

    closed = []
    action = process_bar(
        portfolio, rm, "BTC/USDT", _row(low=97.0, high=99.0, close=98.0), STRAT_CFG,
        open_cb=lambda *a: None, close_cb=lambda *a: closed.append(a),
    )
    assert action == "closed_stop"
    assert closed[0][1] == 98  # prix de sortie = stop_loss, pas le close


def test_process_bar_closes_on_take_profit_hit():
    portfolio = Portfolio(cash=200.0)
    rm = RiskManager(RISK_CFG)
    portfolio.open_position("BTC/USDT", entry_price=100, size=1.0, stop_loss=98, take_profit=110,
                             timestamp="t0", fee_pct=0.1)

    closed = []
    action = process_bar(
        portfolio, rm, "BTC/USDT", _row(low=105.0, high=112.0, close=111.0), STRAT_CFG,
        open_cb=lambda *a: None, close_cb=lambda *a: closed.append(a),
    )
    assert action == "closed_take_profit"
    assert closed[0][1] == 110


def test_process_bar_closes_on_sell_signal():
    portfolio = Portfolio(cash=200.0)
    rm = RiskManager(RISK_CFG)
    portfolio.open_position("BTC/USDT", entry_price=100, size=1.0, stop_loss=90, take_profit=200,
                             timestamp="t0", fee_pct=0.1)

    closed = []
    action = process_bar(
        portfolio, rm, "BTC/USDT", _row(signal="sell", close=103.0), STRAT_CFG,
        open_cb=lambda *a: None, close_cb=lambda *a: closed.append(a),
    )
    assert action == "closed_signal"
    assert closed[0][1] == 103.0


def test_process_bar_does_nothing_when_flat_and_no_buy_signal():
    portfolio = Portfolio(cash=200.0)
    rm = RiskManager(RISK_CFG)
    action = process_bar(
        portfolio, rm, "BTC/USDT", _row(signal="hold"), STRAT_CFG,
        open_cb=lambda *a: None, close_cb=lambda *a: None,
    )
    assert action is None
    assert portfolio.positions == {}
