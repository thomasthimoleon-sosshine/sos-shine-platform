"""Backtest multi-symboles sur donnees historiques Binance.

Rejoue chronologiquement les bougies de tous les symboles en utilisant EXACTEMENT
la meme logique de decision (src/engine.py) que le trading paper/live, pour que
les resultats du backtest soient representatifs.
"""
from __future__ import annotations

from datetime import datetime, timezone

import numpy as np
import pandas as pd

from src.config import Config
from src.engine import process_bar
from src.exchange import ExchangeClient
from src.portfolio import Portfolio
from src.risk import RiskManager
from src.strategy import generate_signals


def _prepare_symbol_data(exchange: ExchangeClient, symbol: str, cfg: Config) -> pd.DataFrame:
    since_ms = int(
        datetime.strptime(cfg.backtest.start_date, "%Y-%m-%d")
        .replace(tzinfo=timezone.utc)
        .timestamp()
        * 1000
    )
    until_ms = int(
        datetime.strptime(cfg.backtest.end_date, "%Y-%m-%d")
        .replace(tzinfo=timezone.utc)
        .timestamp()
        * 1000
    )
    df = exchange.fetch_full_history(symbol, cfg.trading.timeframe, since_ms, until_ms)
    if df.empty:
        return df
    df = generate_signals(df, cfg.strategy)
    df["symbol"] = symbol
    df["day"] = df["timestamp"].dt.date
    return df


def run_backtest(cfg: Config, exchange: ExchangeClient | None = None) -> dict:
    exchange = exchange or ExchangeClient(cfg.exchange)

    frames = []
    for symbol in cfg.trading.symbols:
        df = _prepare_symbol_data(exchange, symbol, cfg)
        if not df.empty:
            frames.append(df)

    if not frames:
        raise RuntimeError("Aucune donnee historique recuperee pour les symboles configures.")

    combined = pd.concat(frames, ignore_index=True).sort_values("timestamp").reset_index(drop=True)

    portfolio = Portfolio(cash=cfg.trading.capital_eur)
    risk_manager = RiskManager(cfg.risk)

    def open_cb(symbol, entry_price, size, stop_loss, take_profit, timestamp):
        portfolio.open_position(
            symbol, entry_price, size, stop_loss, take_profit, timestamp, cfg.backtest.fee_pct
        )

    def close_cb(symbol, exit_price, timestamp, reason):
        portfolio.close_position(symbol, exit_price, timestamp, cfg.backtest.fee_pct, reason)

    last_price: dict[str, float] = {}
    equity_curve: list[tuple] = []

    for _, row in combined.iterrows():
        last_price[row["symbol"]] = row["close"]
        process_bar(portfolio, risk_manager, row["symbol"], row, cfg.strategy, open_cb, close_cb)
        equity_curve.append((row["timestamp"], portfolio.equity(last_price)))

    return _build_report(portfolio, equity_curve, cfg.trading.capital_eur)


def _build_report(portfolio: Portfolio, equity_curve: list[tuple], starting_capital: float) -> dict:
    equity_df = pd.DataFrame(equity_curve, columns=["timestamp", "equity"]).drop_duplicates(
        "timestamp"
    )
    trades = portfolio.closed_trades

    final_equity = equity_df["equity"].iloc[-1] if not equity_df.empty else starting_capital
    total_return_pct = (final_equity - starting_capital) / starting_capital * 100

    running_max = equity_df["equity"].cummax()
    drawdown = (equity_df["equity"] - running_max) / running_max * 100
    max_drawdown_pct = drawdown.min() if not drawdown.empty else 0.0

    wins = [t for t in trades if t["pnl"] > 0]
    win_rate = (len(wins) / len(trades) * 100) if trades else 0.0

    daily_returns = equity_df.set_index("timestamp")["equity"].resample("1D").last().pct_change().dropna()
    sharpe = (
        (daily_returns.mean() / daily_returns.std() * np.sqrt(365))
        if len(daily_returns) > 1 and daily_returns.std() > 0
        else 0.0
    )

    return {
        "starting_capital": starting_capital,
        "final_equity": final_equity,
        "total_return_pct": total_return_pct,
        "max_drawdown_pct": max_drawdown_pct,
        "num_trades": len(trades),
        "win_rate_pct": win_rate,
        "sharpe_ratio": sharpe,
        "trades": trades,
        "equity_curve": equity_df,
    }


def print_report(report: dict) -> None:
    print("\n=== Resultats du backtest ===")
    print(f"Capital de depart     : {report['starting_capital']:.2f}")
    print(f"Capital final         : {report['final_equity']:.2f}")
    print(f"Rendement total       : {report['total_return_pct']:.2f}%")
    print(f"Drawdown max          : {report['max_drawdown_pct']:.2f}%")
    print(f"Nombre de trades      : {report['num_trades']}")
    print(f"Taux de reussite      : {report['win_rate_pct']:.1f}%")
    print(f"Sharpe (approx.)      : {report['sharpe_ratio']:.2f}")


def plot_equity_curve(report: dict, output_path: str) -> None:
    import matplotlib.pyplot as plt

    df = report["equity_curve"]
    plt.figure(figsize=(10, 5))
    plt.plot(df["timestamp"], df["equity"])
    plt.title("Courbe de capital - backtest")
    plt.xlabel("Date")
    plt.ylabel("Capital")
    plt.grid(True, alpha=0.3)
    plt.tight_layout()
    plt.savefig(output_path)
    plt.close()
