"""Data quality checks for normalized data."""

import logging
import pandas as pd

logger = logging.getLogger(__name__)


def check_nulls(df: pd.DataFrame, critical_columns: list[str]) -> list[str]:
    """Check for null values in critical columns.

    Returns:
        List of warning messages for columns with nulls.
    """
    warnings = []
    for col in critical_columns:
        if col in df.columns:
            null_count = df[col].isnull().sum()
            if null_count > 0:
                pct = null_count / len(df) * 100
                msg = f"{col}: {null_count} nulls ({pct:.1f}%)"
                warnings.append(msg)
                logger.warning("Quality check — %s", msg)
    return warnings


def check_outliers(df: pd.DataFrame, column: str, z_threshold: float = 3.0) -> pd.DataFrame:
    """Flag outliers using z-score method.

    Returns:
        DataFrame with an 'is_outlier' boolean column added.
    """
    mean = df[column].mean()
    std = df[column].std()
    df["z_score"] = (df[column] - mean) / std if std > 0 else 0
    df["is_outlier"] = df["z_score"].abs() > z_threshold
    outlier_count = df["is_outlier"].sum()
    logger.info("Outlier check on %s: %d outliers (threshold=%.1f)", column, outlier_count, z_threshold)
    return df


def check_temporal_consistency(df: pd.DataFrame, date_col: str = "date") -> list[str]:
    """Check for temporal gaps in time-series data.

    Returns:
        List of warning messages for detected gaps.
    """
    warnings = []
    if date_col not in df.columns:
        return warnings

    dates = pd.to_datetime(df[date_col]).sort_values()
    if len(dates) < 2:
        return warnings

    gaps = dates.diff().dropna()
    median_gap = gaps.median()
    large_gaps = gaps[gaps > median_gap * 3]

    for idx, gap in large_gaps.items():
        msg = f"Large gap of {gap.days} days at {dates[idx]}"
        warnings.append(msg)
        logger.warning("Temporal check — %s", msg)

    return warnings
