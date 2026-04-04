"""City of Austin building permit data client."""

import logging
import requests
import pandas as pd

logger = logging.getLogger(__name__)

# City of Austin Open Data — Building Permits (Socrata API)
PERMITS_API_URL = "https://data.austintexas.gov/resource/3syk-w9eu.json"


def fetch_permits(limit: int = 50000, offset: int = 0) -> pd.DataFrame:
    """Fetch building permit data from City of Austin open data.

    Args:
        limit: Max records per request.
        offset: Pagination offset.

    Returns:
        DataFrame with permit records including location data.
    """
    params = {
        "$limit": limit,
        "$offset": offset,
        "$order": "issue_date DESC",
    }

    logger.info("Fetching Austin permits (limit=%d, offset=%d)", limit, offset)
    response = requests.get(PERMITS_API_URL, params=params, timeout=60)
    response.raise_for_status()

    data = response.json()
    df = pd.DataFrame(data)
    df["source"] = "austin_permits"

    logger.info("Fetched %d permit records", len(df))
    return df
