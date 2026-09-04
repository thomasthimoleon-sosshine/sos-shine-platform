"""Wrapper autour de ccxt pour parler a Binance (spot testnet ou reel)."""
from __future__ import annotations

import pandas as pd

from src.config import ExchangeConfig


class ExchangeClient:
    def __init__(self, cfg: ExchangeConfig):
        import ccxt  # import local : evite la dependance a la compilation pour les tests unitaires

        exchange_class = getattr(ccxt, cfg.name)
        self.exchange = exchange_class(
            {
                "apiKey": cfg.api_key,
                "secret": cfg.api_secret,
                "enableRateLimit": True,
            }
        )
        if cfg.testnet:
            self.exchange.set_sandbox_mode(True)
        self.testnet = cfg.testnet

    def fetch_ohlcv_df(
        self, symbol: str, timeframe: str, since_ms: int | None = None, limit: int = 500
    ) -> pd.DataFrame:
        raw = self.exchange.fetch_ohlcv(symbol, timeframe=timeframe, since=since_ms, limit=limit)
        df = pd.DataFrame(raw, columns=["timestamp", "open", "high", "low", "close", "volume"])
        df["timestamp"] = pd.to_datetime(df["timestamp"], unit="ms", utc=True)
        return df

    def fetch_full_history(
        self, symbol: str, timeframe: str, since_ms: int, until_ms: int
    ) -> pd.DataFrame:
        """Recupere tout l'historique entre deux dates, page par page (limite API)."""
        all_rows: list[pd.DataFrame] = []
        cursor = since_ms
        while cursor < until_ms:
            chunk = self.fetch_ohlcv_df(symbol, timeframe, since_ms=cursor, limit=1000)
            if chunk.empty:
                break
            all_rows.append(chunk)
            last_ts = int(chunk["timestamp"].iloc[-1].timestamp() * 1000)
            if last_ts <= cursor:
                break
            cursor = last_ts + 1

        if not all_rows:
            return pd.DataFrame(columns=["timestamp", "open", "high", "low", "close", "volume"])

        df = pd.concat(all_rows, ignore_index=True).drop_duplicates(subset="timestamp")
        until = pd.to_datetime(until_ms, unit="ms", utc=True)
        return df[df["timestamp"] <= until].reset_index(drop=True)

    def fetch_balance_quote(self, quote_asset: str = "USDT") -> float:
        balance = self.exchange.fetch_balance()
        return float(balance.get(quote_asset, {}).get("free", 0.0))

    def create_market_buy(self, symbol: str, amount: float):
        return self.exchange.create_order(symbol, "market", "buy", amount)

    def create_market_sell(self, symbol: str, amount: float):
        return self.exchange.create_order(symbol, "market", "sell", amount)
