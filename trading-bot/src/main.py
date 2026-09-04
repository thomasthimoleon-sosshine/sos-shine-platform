"""Point d'entree CLI du bot.

Usage :
    python -m src.main backtest
    python -m src.main trade            # paper trading (testnet) si exchange.testnet=true
    python -m src.main trade --live     # ARGENT REEL - necessite une confirmation explicite
"""
from __future__ import annotations

import argparse
import logging
import sys

from src.backtest import plot_equity_curve, print_report, run_backtest
from src.config import load_config
from src.trader import TradingEngine

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s | %(levelname)s | %(message)s"
)


def cmd_backtest(args: argparse.Namespace) -> None:
    cfg = load_config(args.config)
    report = run_backtest(cfg)
    print_report(report)
    if args.plot:
        plot_equity_curve(report, args.plot)
        print(f"\nCourbe de capital sauvegardee : {args.plot}")


def cmd_trade(args: argparse.Namespace) -> None:
    cfg = load_config(args.config)

    if args.live:
        if cfg.exchange.testnet:
            print(
                "config.yaml a exchange.testnet=true : impossible de lancer --live. "
                "Passe testnet a false une fois que tu as valide le bot en paper trading."
            )
            sys.exit(1)

        print("!!! MODE LIVE : ce bot va trader avec de l'ARGENT REEL sur ton compte Binance. !!!")
        print(f"Capital configure : {cfg.trading.capital_eur} EUR")
        confirmation = input("Tape exactement CONFIRMER pour continuer : ")
        if confirmation != "CONFIRMER":
            print("Annule.")
            sys.exit(0)
    else:
        if not cfg.exchange.testnet:
            print(
                "config.yaml a exchange.testnet=false mais tu n'as pas passe --live. "
                "Passe testnet a true pour le paper trading, ou relance avec --live."
            )
            sys.exit(1)
        print("Mode PAPER TRADING (Binance testnet, argent fictif).")

    engine = TradingEngine(cfg)
    engine.run_forever()


def main() -> None:
    parser = argparse.ArgumentParser(description="Robot de trading crypto")
    parser.add_argument("--config", default=None, help="Chemin vers config.yaml")
    subparsers = parser.add_subparsers(dest="command", required=True)

    p_backtest = subparsers.add_parser("backtest", help="Backtester la strategie sur donnees historiques")
    p_backtest.add_argument("--plot", default=None, help="Chemin de sortie pour la courbe de capital (PNG)")
    p_backtest.set_defaults(func=cmd_backtest)

    p_trade = subparsers.add_parser("trade", help="Lancer le bot en continu (paper ou live)")
    p_trade.add_argument("--live", action="store_true", help="Trader avec de l'argent reel (dangereux)")
    p_trade.set_defaults(func=cmd_trade)

    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
