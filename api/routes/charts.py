"""Server-rendered Seaborn heatmap chart endpoints.

Generates PNG images with dark-themed Seaborn heatmaps from live data
(Socrata permits, FRED employment). Cached for 1 hour.
"""

import io
import logging
import os
from datetime import datetime, timedelta

import matplotlib
matplotlib.use("Agg")  # Non-interactive backend
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import requests
import seaborn as sns
from fastapi import APIRouter, Query
from fastapi.responses import StreamingResponse
from fastapi_cache.decorator import cache

from api.constants import MARKET_DATA

logger = logging.getLogger(__name__)
router = APIRouter()

# ── Dark theme colors matching the dashboard ──
BG_COLOR = "#0f1724"
TEXT_COLOR = "#c8d6e5"
GRID_COLOR = "#1e2d3d"
ACCENT = "#81ecff"


def _dark_fig(width=10, height=6):
    """Create a matplotlib figure with our dark theme."""
    fig, ax = plt.subplots(figsize=(width, height), facecolor=BG_COLOR)
    ax.set_facecolor(BG_COLOR)
    return fig, ax


def _fig_to_png(fig) -> io.BytesIO:
    """Render a matplotlib figure to a PNG BytesIO buffer."""
    buf = io.BytesIO()
    fig.savefig(
        buf, format="png", dpi=150, bbox_inches="tight",
        facecolor=fig.get_facecolor(), edgecolor="none",
        transparent=False,
    )
    plt.close(fig)
    buf.seek(0)
    return buf


# ══════════════════════════════════════════════════════════════
# /permits-heatmap — Permit counts by Month × Class
# ══════════════════════════════════════════════════════════════
@router.get("/permits-heatmap")
async def permits_heatmap(market: str = Query(default="austin")):
    """Generate a Seaborn heatmap of permit counts by month and permit class."""
    try:
        url = "https://data.austintexas.gov/resource/3syk-w9eu.json"
        params = {
            "$limit": 2000,
            "$order": "issue_date DESC",
            "$where": "issue_date IS NOT NULL",
        }
        r = requests.get(url, params=params, timeout=30)
        r.raise_for_status()
        records = r.json()

        # Build a DataFrame
        rows = []
        for rec in records:
            try:
                dt = datetime.fromisoformat(rec["issue_date"].split(".")[0])
                permit_class = rec.get("permit_class_mapped", "Other") or "Other"
                rows.append({"month": dt.strftime("%Y-%m"), "month_label": dt.strftime("%b %Y"), "class": permit_class})
            except Exception:
                continue

        if not rows:
            return _empty_chart("No permit data available")

        df = pd.DataFrame(rows)

        # Pivot: Month × Class
        pivot = df.pivot_table(index="class", columns="month", aggfunc="size", fill_value=0)
        # Sort columns chronologically
        pivot = pivot[sorted(pivot.columns)]
        # Rename columns to short month labels
        month_labels = []
        for col in pivot.columns:
            try:
                dt = datetime.strptime(col, "%Y-%m")
                month_labels.append(dt.strftime("%b '%y"))
            except Exception:
                month_labels.append(col)
        pivot.columns = month_labels

        # Keep only top classes by total
        class_totals = pivot.sum(axis=1).sort_values(ascending=False)
        top_classes = class_totals.head(8).index
        pivot = pivot.loc[top_classes]

        # Generate heatmap
        fig, ax = _dark_fig(width=12, height=5)
        sns.heatmap(
            pivot,
            ax=ax,
            cmap="mako",
            annot=True,
            fmt="d",
            linewidths=0.5,
            linecolor=GRID_COLOR,
            cbar_kws={"shrink": 0.8, "label": "Permit Count"},
            annot_kws={"size": 8, "color": TEXT_COLOR},
        )
        ax.set_title("Building Permits by Type × Month", color=ACCENT, fontsize=14, fontweight="bold", pad=16)
        ax.set_xlabel("", color=TEXT_COLOR)
        ax.set_ylabel("", color=TEXT_COLOR)
        ax.tick_params(colors=TEXT_COLOR, labelsize=9)

        # Style the colorbar
        cbar = ax.collections[0].colorbar
        cbar.ax.tick_params(colors=TEXT_COLOR, labelsize=8)
        cbar.set_label("Permit Count", color=TEXT_COLOR, fontsize=9)

        buf = _fig_to_png(fig)
        return StreamingResponse(buf, media_type="image/png")

    except Exception:
        logger.exception("Error generating permits heatmap")
        return _empty_chart("Error generating heatmap")


# ══════════════════════════════════════════════════════════════
# /jobs-heatmap — Employment by Year × Sector
# ══════════════════════════════════════════════════════════════
@router.get("/jobs-heatmap")
async def jobs_heatmap(
    market: str = Query(default="austin"),
    years: int = Query(default=5, ge=1, le=20),
):
    """Generate a Seaborn heatmap of employment levels by year and sector."""
    import httpx

    FRED_API_KEY = os.getenv("FRED_API_KEY", "")
    if not FRED_API_KEY:
        return _empty_chart("FRED_API_KEY not configured")

    key = market.lower().strip().replace(" ", "-")
    market_config = MARKET_DATA.get(key, MARKET_DATA["austin"])
    prefix = market_config["fred_prefix"]

    sectors = {
        "Information": "INFO",
        "Manufacturing": "MFGN",
        "Prof. Services": "PBSV",
        "Education/Health": "EDUHN",
        "Government": "GOVTN",
    }

    start = (datetime.now() - timedelta(days=years * 365)).strftime("%Y-%m-%d")
    FRED_BASE = "https://api.stlouisfed.org/fred/series/observations"

    try:
        all_data = {}
        async with httpx.AsyncClient() as client:
            for label, suffix in sectors.items():
                series_id = f"{prefix}{suffix}"
                params = {
                    "series_id": series_id,
                    "api_key": FRED_API_KEY,
                    "file_type": "json",
                    "sort_order": "asc",
                    "observation_start": start,
                }
                resp = await client.get(FRED_BASE, params=params, timeout=15.0)
                if resp.status_code != 200:
                    continue

                observations = resp.json().get("observations", [])
                for obs in observations:
                    if obs.get("value") == ".":
                        continue
                    try:
                        year = obs["date"][:4]
                        val = float(obs["value"])
                        if year not in all_data:
                            all_data[year] = {}
                        if label not in all_data[year]:
                            all_data[year][label] = []
                        all_data[year][label].append(val)
                    except (ValueError, KeyError):
                        continue

        if not all_data:
            return _empty_chart("No FRED data available")

        # Average each year-sector cell
        matrix = {}
        for year, sectors_data in all_data.items():
            matrix[year] = {}
            for sector, values in sectors_data.items():
                matrix[year][sector] = round(sum(values) / len(values), 1)

        df = pd.DataFrame(matrix).T.sort_index()
        # Reorder columns
        col_order = [c for c in ["Information", "Manufacturing", "Prof. Services", "Education/Health", "Government"] if c in df.columns]
        df = df[col_order]

        fig, ax = _dark_fig(width=10, height=5)
        sns.heatmap(
            df,
            ax=ax,
            cmap="mako",
            annot=True,
            fmt=".0f",
            linewidths=0.5,
            linecolor=GRID_COLOR,
            cbar_kws={"shrink": 0.8, "label": "Employment (K)"},
            annot_kws={"size": 9, "color": TEXT_COLOR},
        )
        ax.set_title(
            f"Sector Employment — {market_config['name']}",
            color=ACCENT, fontsize=14, fontweight="bold", pad=16,
        )
        ax.set_xlabel("", color=TEXT_COLOR)
        ax.set_ylabel("", color=TEXT_COLOR)
        ax.tick_params(colors=TEXT_COLOR, labelsize=10)

        cbar = ax.collections[0].colorbar
        cbar.ax.tick_params(colors=TEXT_COLOR, labelsize=8)
        cbar.set_label("Employment (K)", color=TEXT_COLOR, fontsize=9)

        buf = _fig_to_png(fig)
        return StreamingResponse(buf, media_type="image/png")

    except Exception:
        logger.exception("Error generating jobs heatmap")
        return _empty_chart("Error generating heatmap")


def _empty_chart(message: str):
    """Return a placeholder chart with an error message."""
    fig, ax = _dark_fig(width=8, height=4)
    ax.text(0.5, 0.5, message, transform=ax.transAxes, ha="center", va="center",
            fontsize=14, color=TEXT_COLOR)
    ax.set_xticks([])
    ax.set_yticks([])
    for spine in ax.spines.values():
        spine.set_visible(False)
    buf = _fig_to_png(fig)
    return StreamingResponse(buf, media_type="image/png")
