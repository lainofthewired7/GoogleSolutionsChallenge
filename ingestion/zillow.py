"""Zillow / Redfin data client (CSV-based)."""

import logging
import pandas as pd

logger = logging.getLogger(__name__)

# Zillow publishes CSV data at these URLs
ZILLOW_ZORI_URL = "https://files.zillowstatic.com/research/public_csvs/zori/Zip_zori_sm_month.csv"
ZILLOW_ZHVI_URL = "https://files.zillowstatic.com/research/public_csvs/zhvi/Zip_zhvi_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv"


def fetch_rent_index(metro_filter: str = "Austin") -> pd.DataFrame:
    """Fetch Zillow Observed Rent Index (ZORI) and filter by metro.

    Args:
        metro_filter: Metro name substring to filter on.

    Returns:
        DataFrame with monthly rent index by zip code.
    """
    logger.info("Fetching Zillow ZORI data...")
    df = pd.read_csv(ZILLOW_ZORI_URL)
    df = df[df["Metro"].str.contains(metro_filter, case=False, na=False)]
    df["source"] = "zillow"
    logger.info("Filtered to %d zip codes for %s", len(df), metro_filter)
    return df


def fetch_home_values(metro_filter: str = "Austin") -> pd.DataFrame:
    """Fetch Zillow Home Value Index (ZHVI) and filter by metro.

    Args:
        metro_filter: Metro name substring to filter on.

    Returns:
        DataFrame with monthly home value index by zip code.
    """
    logger.info("Fetching Zillow ZHVI data...")
    df = pd.read_csv(ZILLOW_ZHVI_URL)
    df = df[df["Metro"].str.contains(metro_filter, case=False, na=False)]
    df["source"] = "zillow"
    logger.info("Filtered to %d zip codes for %s", len(df), metro_filter)
    return df
