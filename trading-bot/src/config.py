"""Chargement de la configuration (config.yaml + variables d'environnement)."""
from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

import yaml
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).resolve().parent.parent


@dataclass
class ExchangeConfig:
    name: str
    testnet: bool
    api_key: str
    api_secret: str


@dataclass
class TradingConfig:
    symbols: list[str]
    timeframe: str
    capital_eur: float


@dataclass
class StrategyConfig:
    ema_fast: int
    ema_slow: int
    rsi_period: int
    rsi_overbought: float
    atr_period: int
    atr_stop_multiplier: float
    risk_reward_ratio: float


@dataclass
class RiskConfig:
    risk_per_trade_pct: float
    max_daily_loss_pct: float
    max_open_positions: int
    max_position_pct_of_capital: float


@dataclass
class BacktestConfig:
    start_date: str
    end_date: str
    fee_pct: float


@dataclass
class Config:
    exchange: ExchangeConfig
    trading: TradingConfig
    strategy: StrategyConfig
    risk: RiskConfig
    backtest: BacktestConfig


def load_config(path: str | Path | None = None) -> Config:
    load_dotenv(ROOT_DIR / ".env")

    config_path = Path(path) if path else ROOT_DIR / "config.yaml"
    if not config_path.exists():
        raise FileNotFoundError(
            f"Fichier de config introuvable : {config_path}. "
            "Copie config.example.yaml vers config.yaml puis ajuste-le."
        )

    with open(config_path, "r", encoding="utf-8") as f:
        raw = yaml.safe_load(f)

    return Config(
        exchange=ExchangeConfig(
            name=raw["exchange"]["name"],
            testnet=bool(raw["exchange"]["testnet"]),
            api_key=os.environ.get("BINANCE_API_KEY", ""),
            api_secret=os.environ.get("BINANCE_API_SECRET", ""),
        ),
        trading=TradingConfig(
            symbols=list(raw["trading"]["symbols"]),
            timeframe=raw["trading"]["timeframe"],
            capital_eur=float(raw["trading"]["capital_eur"]),
        ),
        strategy=StrategyConfig(**raw["strategy"]),
        risk=RiskConfig(**raw["risk"]),
        backtest=BacktestConfig(**raw["backtest"]),
    )
