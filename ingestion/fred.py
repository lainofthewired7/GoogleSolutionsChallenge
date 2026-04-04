"""FRED (Federal Reserve Economic Data) API client."""

import logging
import requests
import pandas as pd
from ingestion.config import FRED_API_KEY, FRED_BASE_URL, REQUEST_DELAY_SECONDS, MAX_RETRIES

logger = logging.getLogger(__name__)


def fetch_series(series_id: str, start_date: str | None = None) -> pd.DataFrame:
    """Fetch a time-series from FRED.

    Args:
        series_id: FRED series identifier (e.g., 'AUSPOP', 'AUSNA').
        start_date: Optional start date in 'YYYY-MM-DD' format.

    Returns:
        DataFrame with columns ['date', 'value'].
    """
    params = {
        "series_id": series_id,
        "api_key": FRED_API_KEY,
        "file_type": "json",
    }
    if start_date:
        params["observation_start"] = start_date

    url = f"{FRED_BASE_URL}/series/observations"
    logger.info("Fetching FRED series: %s", series_id)

    response = requests.get(url, params=params, timeout=30)
    response.raise_for_status()

    observations = response.json().get("observations", [])
    df = pd.DataFrame(observations)[["date", "value"]]
    df["value"] = pd.to_numeric(df["value"], errors="coerce")
    df["source"] = "fred"
    df["series_id"] = series_id

    logger.info("Fetched %d observations for %s", len(df), series_id)
    return df
