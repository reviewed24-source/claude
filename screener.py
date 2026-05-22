"""
Turnaround stock screener.

Finds undervalued, currently-unprofitable, leveraged US stocks where analysts
project a return to profitability. All filters and weights are CLI-tunable.

Data source: Yahoo Finance via the yfinance library. The universe defaults to
the S&P 500 (all members are tradeable on Robinhood); pass --tickers-file to
screen a custom list.

This is an educational screening tool, not investment advice. Forward EPS is
an analyst consensus estimate and can be wrong; ratios are point-in-time and
do not capture business quality, capital structure changes, or macro risk.
Do your own research before buying anything.
"""

from __future__ import annotations

import argparse
import concurrent.futures as cf
import csv
import sys
import time
from dataclasses import dataclass, asdict
from typing import Optional

import pandas as pd
import yfinance as yf
from rich.console import Console
from rich.progress import Progress, SpinnerColumn, TextColumn, BarColumn, TimeElapsedColumn
from rich.table import Table

SP500_URL = "https://en.wikipedia.org/wiki/List_of_S%26P_500_companies"

console = Console()


@dataclass
class Stock:
    ticker: str
    name: str
    sector: str
    price: float
    market_cap: float
    trailing_eps: Optional[float]
    forward_eps: Optional[float]
    profit_margins: Optional[float]
    debt_to_equity: Optional[float]
    total_debt: Optional[float]
    total_cash: Optional[float]
    forward_pe: Optional[float]
    price_to_book: Optional[float]
    price_to_sales: Optional[float]
    target_mean_price: Optional[float]
    recommendation: str
    upside_pct: float = 0.0
    eps_swing: float = 0.0
    score: float = 0.0


def fetch_sp500_tickers() -> list[str]:
    """Pull current S&P 500 constituents from Wikipedia."""
    tables = pd.read_html(SP500_URL)
    symbols = tables[0]["Symbol"].astype(str).tolist()
    # Yahoo uses '-' where exchanges use '.' (e.g. BRK.B -> BRK-B)
    return [s.replace(".", "-").strip() for s in symbols]


def load_tickers_file(path: str) -> list[str]:
    with open(path) as f:
        return [line.strip().upper() for line in f if line.strip() and not line.startswith("#")]


def _num(value) -> Optional[float]:
    """yfinance returns None, NaN, or numeric values inconsistently — normalize."""
    try:
        if value is None:
            return None
        f = float(value)
        if f != f:  # NaN
            return None
        return f
    except (TypeError, ValueError):
        return None


def fetch_one(ticker: str, retries: int = 2) -> Optional[Stock]:
    """Fetch a single ticker's snapshot. Returns None on any failure."""
    for attempt in range(retries + 1):
        try:
            info = yf.Ticker(ticker).info
            if not info:
                return None
            price = _num(info.get("currentPrice")) or _num(info.get("regularMarketPrice"))
            if not price or price < 1.0:
                # Skip sub-$1 names — most aren't really screenable
                return None
            return Stock(
                ticker=ticker,
                name=info.get("shortName") or info.get("longName") or ticker,
                sector=info.get("sector") or "Unknown",
                price=price,
                market_cap=_num(info.get("marketCap")) or 0.0,
                trailing_eps=_num(info.get("trailingEps")),
                forward_eps=_num(info.get("forwardEps")),
                profit_margins=_num(info.get("profitMargins")),
                debt_to_equity=_num(info.get("debtToEquity")),
                total_debt=_num(info.get("totalDebt")),
                total_cash=_num(info.get("totalCash")),
                forward_pe=_num(info.get("forwardPE")),
                price_to_book=_num(info.get("priceToBook")),
                price_to_sales=_num(info.get("priceToSalesTrailing12Months")),
                target_mean_price=_num(info.get("targetMeanPrice")),
                recommendation=info.get("recommendationKey") or "none",
            )
        except Exception:
            if attempt < retries:
                time.sleep(1 + attempt)
                continue
            return None
    return None


def fetch_all(tickers: list[str], workers: int = 10) -> list[Stock]:
    results: list[Stock] = []
    with Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        BarColumn(),
        TextColumn("{task.completed}/{task.total}"),
        TimeElapsedColumn(),
        console=console,
    ) as progress:
        task = progress.add_task("Fetching", total=len(tickers))
        with cf.ThreadPoolExecutor(max_workers=workers) as pool:
            futures = {pool.submit(fetch_one, t): t for t in tickers}
            for fut in cf.as_completed(futures):
                stock = fut.result()
                if stock is not None:
                    results.append(stock)
                progress.advance(task)
    return results


def passes_filters(
    s: Stock,
    *,
    min_market_cap: float,
    min_debt_to_equity: float,
    min_upside: float,
    max_forward_pe: float,
    require_net_debt: bool,
) -> bool:
    """Apply the turnaround thesis filters."""

    if s.market_cap < min_market_cap:
        return False

    # "In debt" — meaningful leverage. yfinance reports D/E as a percentage
    # (e.g. 150 means debt is 1.5x equity).
    if s.debt_to_equity is None or s.debt_to_equity < min_debt_to_equity:
        return False

    if require_net_debt:
        if s.total_debt is None or s.total_cash is None:
            return False
        if s.total_debt <= s.total_cash:
            return False

    # "Currently unprofitable" — negative trailing EPS, or thin margins
    currently_unprofitable = (
        (s.trailing_eps is not None and s.trailing_eps <= 0)
        or (s.profit_margins is not None and s.profit_margins < 0.05)
    )
    if not currently_unprofitable:
        return False

    # "Projected to become profitable" — analysts see positive forward EPS,
    # and forward EPS is materially better than trailing.
    if s.forward_eps is None or s.forward_eps <= 0:
        return False
    if s.trailing_eps is not None and s.forward_eps <= s.trailing_eps:
        return False

    # "Undervalued" — analyst consensus target above current price
    if s.target_mean_price is None or s.target_mean_price <= 0:
        return False
    s.upside_pct = (s.target_mean_price - s.price) / s.price
    if s.upside_pct < min_upside:
        return False

    # Sanity: forward P/E must be positive and not ridiculous
    if s.forward_pe is None or s.forward_pe <= 0 or s.forward_pe > max_forward_pe:
        return False

    return True


def compute_score(s: Stock) -> float:
    """Composite score weighing analyst upside, EPS swing, and valuation."""
    upside_pts = min(s.upside_pct, 1.0) * 40  # cap upside at +100%

    if s.trailing_eps is not None and s.forward_eps is not None:
        denom = max(abs(s.trailing_eps), 0.5)
        s.eps_swing = (s.forward_eps - s.trailing_eps) / denom
    else:
        s.eps_swing = 0.0
    swing_pts = max(min(s.eps_swing, 3.0), 0) * 10  # cap swing at 3x

    fpe_pts = max(0.0, 25 - (s.forward_pe or 25)) * 1.2  # reward low forward P/E

    rec = (s.recommendation or "").lower()
    rec_pts = {"strong_buy": 10, "buy": 6, "hold": 0, "underperform": -5, "sell": -10}.get(rec, 0)

    return upside_pts + swing_pts + fpe_pts + rec_pts


def render_table(stocks: list[Stock], limit: int) -> None:
    table = Table(title=f"Top {min(limit, len(stocks))} turnaround candidates", show_lines=False)
    table.add_column("Rank", justify="right")
    table.add_column("Ticker", style="bold cyan")
    table.add_column("Name", overflow="fold", max_width=24)
    table.add_column("Sector", max_width=14)
    table.add_column("Price", justify="right")
    table.add_column("Target", justify="right")
    table.add_column("Upside", justify="right", style="green")
    table.add_column("Fwd P/E", justify="right")
    table.add_column("D/E", justify="right")
    table.add_column("TTM EPS", justify="right")
    table.add_column("Fwd EPS", justify="right")
    table.add_column("Rec", max_width=10)
    table.add_column("Score", justify="right", style="bold")

    for i, s in enumerate(stocks[:limit], 1):
        table.add_row(
            str(i),
            s.ticker,
            s.name,
            s.sector,
            f"${s.price:,.2f}",
            f"${s.target_mean_price:,.2f}" if s.target_mean_price else "-",
            f"{s.upside_pct * 100:+.1f}%",
            f"{s.forward_pe:.1f}" if s.forward_pe else "-",
            f"{s.debt_to_equity:.0f}" if s.debt_to_equity else "-",
            f"{s.trailing_eps:.2f}" if s.trailing_eps is not None else "-",
            f"{s.forward_eps:.2f}" if s.forward_eps is not None else "-",
            s.recommendation,
            f"{s.score:.1f}",
        )
    console.print(table)


def write_csv(stocks: list[Stock], path: str) -> None:
    if not stocks:
        return
    with open(path, "w", newline="") as f:
        fieldnames = list(asdict(stocks[0]).keys())
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for s in stocks:
            writer.writerow(asdict(s))


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(
        description="Screen US stocks for undervalued, leveraged turnaround candidates.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    p.add_argument("--tickers-file", help="Path to newline-separated ticker list. Defaults to S&P 500.")
    p.add_argument("--limit", type=int, default=25, help="Number of candidates to display.")
    p.add_argument("--workers", type=int, default=10, help="Parallel fetch workers.")
    p.add_argument("--min-market-cap", type=float, default=300_000_000,
                   help="Drop names below this market cap ($).")
    p.add_argument("--min-debt-to-equity", type=float, default=50.0,
                   help="Minimum debt/equity percentage (yfinance scale; 50 = 0.5x).")
    p.add_argument("--min-upside", type=float, default=0.15,
                   help="Required analyst-target upside vs. price (0.15 = 15%%).")
    p.add_argument("--max-forward-pe", type=float, default=40.0,
                   help="Drop names with forward P/E above this.")
    p.add_argument("--require-net-debt", action="store_true",
                   help="Require total debt > total cash (true net-debt position).")
    p.add_argument("--csv", help="Optional path to write the full filtered set to CSV.")
    return p.parse_args()


def main() -> int:
    args = parse_args()

    if args.tickers_file:
        tickers = load_tickers_file(args.tickers_file)
        console.print(f"[dim]Loaded {len(tickers)} tickers from {args.tickers_file}[/dim]")
    else:
        console.print("[dim]Fetching S&P 500 constituents from Wikipedia...[/dim]")
        tickers = fetch_sp500_tickers()
        console.print(f"[dim]Universe: {len(tickers)} tickers[/dim]")

    stocks = fetch_all(tickers, workers=args.workers)
    console.print(f"[dim]Pulled data for {len(stocks)}/{len(tickers)} tickers[/dim]")

    candidates = [
        s for s in stocks
        if passes_filters(
            s,
            min_market_cap=args.min_market_cap,
            min_debt_to_equity=args.min_debt_to_equity,
            min_upside=args.min_upside,
            max_forward_pe=args.max_forward_pe,
            require_net_debt=args.require_net_debt,
        )
    ]

    for s in candidates:
        s.score = compute_score(s)
    candidates.sort(key=lambda s: s.score, reverse=True)

    console.print(f"[bold]{len(candidates)} candidates passed all filters.[/bold]\n")
    if not candidates:
        console.print("[yellow]No matches. Try loosening --min-upside or --min-debt-to-equity.[/yellow]")
        return 0

    render_table(candidates, args.limit)

    if args.csv:
        write_csv(candidates, args.csv)
        console.print(f"\n[dim]Wrote {len(candidates)} rows to {args.csv}[/dim]")

    console.print(
        "\n[yellow]Educational screen only — not investment advice. "
        "Analyst forecasts can be wrong; verify the thesis yourself before acting.[/yellow]"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
