"""Data normalization — transforms raw API data into the canonical schema."""

import logging
import pandas as pd

logger = logging.getLogger(__name__)


def normalize_fred(raw_df: pd.DataFrame, market: str) -> pd.DataFrame:
    """Normalize FRED time-series data into the canonical format.

    Args:
        raw_df: Raw DataFrame from FRED ingestion.
        market: Market identifier.

    Returns:
        Normalized DataFrame with columns [date, metric, value, geography, source].
    """
    df = raw_df.copy()
    df = df.rename(columns={"date": "date", "value": "value"})
    df["metric"] = df["series_id"]
    df["geography"] = market
    df["source"] = "fred"
    return df[["date", "metric", "value", "geography", "source"]]


def normalize_census(raw_df: pd.DataFrame) -> pd.DataFrame:
    """Normalize Census ACS data into per-zip metric rows.

    Args:
        raw_df: Raw DataFrame from Census ACS ingestion.

    Returns:
        Normalized DataFrame melted into long format.
    """
    metric_cols = [
        "total_housing_units", "vacant_housing_units",
        "median_household_income", "median_gross_rent", "total_population"
    ]
    id_cols = ["zip code tabulation area", "year", "source"]

    df = raw_df.melt(
        id_vars=[c for c in id_cols if c in raw_df.columns],
        value_vars=[c for c in metric_cols if c in raw_df.columns],
        var_name="metric",
        value_name="value",
    )
    df = df.rename(columns={"zip code tabulation area": "geography"})
    return df


def normalize_permits(raw_df: pd.DataFrame) -> pd.DataFrame:
    """Normalize building permit data with point geometry.

    Args:
        raw_df: Raw DataFrame from permits ingestion.

    Returns:
        Normalized DataFrame with standardized columns.
    """
    df = raw_df.copy()
    # Standardize key columns — actual column names depend on source
    col_mapping = {
        "issue_date": "date",
        "permit_type_desc": "permit_type",
        "work_description": "description",
        "latitude": "lat",
        "longitude": "lon",
    }
    df = df.rename(columns={k: v for k, v in col_mapping.items() if k in df.columns})
    df["source"] = "austin_permits"
    return df
