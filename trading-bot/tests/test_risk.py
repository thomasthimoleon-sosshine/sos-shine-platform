from src.config import RiskConfig
from src.portfolio import Portfolio
from src.risk import RiskManager

CFG = RiskConfig(
    risk_per_trade_pct=1.5,
    max_daily_loss_pct=5.0,
    max_open_positions=2,
    max_position_pct_of_capital=60,
)


def test_position_size_matches_risk_per_trade():
    rm = RiskManager(CFG)
    portfolio = Portfolio(cash=200.0)

    entry_price = 100.0
    stop_loss = 95.0  # distance de 5
    size = rm.position_size(portfolio, entry_price, stop_loss)

    expected_risk_amount = 200.0 * 0.015
    expected_size = expected_risk_amount / 5.0
    assert abs(size - expected_size) < 1e-9


def test_position_size_capped_by_max_position_pct():
    rm = RiskManager(CFG)
    portfolio = Portfolio(cash=200.0)

    # Stop tres proche => la formule de risque donnerait une position enorme,
    # mais le cap max_position_pct_of_capital doit la limiter.
    size = rm.position_size(portfolio, entry_price=100.0, stop_loss_price=99.9)
    max_value = 200.0 * (CFG.max_position_pct_of_capital / 100)
    assert size * 100.0 <= max_value + 1e-6


def test_position_size_never_exceeds_available_cash():
    rm = RiskManager(CFG)
    portfolio = Portfolio(cash=200.0)
    portfolio.cash = 10.0  # presque tout deja investi
    size = rm.position_size(portfolio, entry_price=100.0, stop_loss_price=95.0)
    assert size * 100.0 <= 10.0 + 1e-6


def test_cannot_open_position_when_max_open_positions_reached():
    rm = RiskManager(CFG)
    portfolio = Portfolio(cash=200.0)
    portfolio.open_position("BTC/USDT", 100, 0.1, 95, 110, "t1", fee_pct=0.1)
    portfolio.open_position("ETH/USDT", 100, 0.1, 95, 110, "t2", fee_pct=0.1)

    assert rm.can_open_new_position(portfolio, "SOL/USDT") is False


def test_daily_loss_limit_blocks_new_trades():
    rm = RiskManager(CFG)
    portfolio = Portfolio(cash=200.0)
    portfolio.daily_pnl = -20.0  # 10% de perte, > max_daily_loss_pct de 5%

    assert rm.daily_loss_limit_hit(portfolio) is True
    assert rm.can_open_new_position(portfolio, "BTC/USDT") is False


def test_cannot_reopen_symbol_already_held():
    rm = RiskManager(CFG)
    portfolio = Portfolio(cash=200.0)
    portfolio.open_position("BTC/USDT", 100, 0.1, 95, 110, "t1", fee_pct=0.1)
    assert rm.can_open_new_position(portfolio, "BTC/USDT") is False
