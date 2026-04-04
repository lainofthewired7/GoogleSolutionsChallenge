"""HUD (Housing and Urban Development) API client."""

import logging
import requests
import pandas as pd
from ingestion.config import HUD_API_KEY, HUD_BASE_URL

logger = logging.getLogger(__name__)


def fetch_fair_market_rents(state_code: str = "TX", year: int = 2024) -> pd.DataFrame:
    """Fetch Fair Market Rent data from HUD.

    Args:
        state_code: Two-letter state abbreviation.
        year: FMR fiscal year.

    Returns:
        DataFrame with FMR data by county/zip.
    """
    url = f"{HUD_BASE_URL}/fmr/statedata/{state_code}"
    headers = {"Authorization": f"Bearer {HUD_API_KEY}"}
    params = {"year": year}

    logger.info("Fetching HUD FMR for %s, year %d", state_code, year)
    response = requests.get(url, headers=headers, params=params, timeout=30)
    response.raise_for_status()

    data = response.json().get("data", {}).get("basicdata", [])
    df = pd.DataFrame(data)
    df["source"] = "hud"
    df["year"] = year

    logger.info("Fetched FMR data: %d records", len(df))
    return df
