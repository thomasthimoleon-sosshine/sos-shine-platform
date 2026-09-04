from src.portfolio import Portfolio


def test_open_position_deducts_cash_and_fee():
    p = Portfolio(cash=200.0)
    p.open_position("BTC/USDT", entry_price=100.0, size=1.0, stop_loss=95, take_profit=110,
                     timestamp="t1", fee_pct=0.1)
    expected_cash = 200.0 - 100.0 - (100.0 * 0.001)
    assert abs(p.cash - expected_cash) < 1e-9
    assert "BTC/USDT" in p.positions


def test_close_position_computes_pnl_with_fees_both_sides():
    p = Portfolio(cash=200.0)
    p.open_position("BTC/USDT", entry_price=100.0, size=1.0, stop_loss=95, take_profit=110,
                     timestamp="t1", fee_pct=0.1)
    pnl = p.close_position("BTC/USDT", exit_price=110.0, timestamp="t2", fee_pct=0.1, reason="take_profit")

    entry_fee = 100.0 * 0.001
    exit_fee = 110.0 * 0.001
    expected_pnl = 110.0 - exit_fee - 100.0 - entry_fee
    assert abs(pnl - expected_pnl) < 1e-9
    assert "BTC/USDT" not in p.positions
    assert len(p.closed_trades) == 1


def test_equity_includes_open_positions_at_current_price():
    p = Portfolio(cash=200.0)
    p.open_position("BTC/USDT", entry_price=100.0, size=1.0, stop_loss=95, take_profit=110,
                     timestamp="t1", fee_pct=0.1)
    equity = p.equity({"BTC/USDT": 120.0})
    assert equity == p.cash + 120.0


def test_daily_pnl_resets_on_new_day():
    p = Portfolio(cash=200.0)
    p.reset_daily_if_needed("2024-01-01")
    p.daily_pnl = -10.0
    p.reset_daily_if_needed("2024-01-01")
    assert p.daily_pnl == -10.0  # meme jour : pas de reset
    p.reset_daily_if_needed("2024-01-02")
    assert p.daily_pnl == 0.0  # nouveau jour : reset
