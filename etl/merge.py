"""Cross-source data merging utilities."""

import logging
import pandas as pd

logger = logging.getLogger(__name__)


def merge_rent_vacancy(rent_df: pd.DataFrame, vacancy_df: pd.DataFrame) -> pd.DataFrame:
    """Merge Zillow rent index with Census vacancy data by zip code.

    Args:
        rent_df: Zillow rent data with 'RegionName' as zip code.
        vacancy_df: Census ACS data with 'geography' as zip code.

    Returns:
        Merged DataFrame with rent and vacancy metrics per zip.
    """
    logger.info("Merging rent (%d rows) with vacancy (%d rows)", len(rent_df), len(vacancy_df))

    merged = pd.merge(
        rent_df, vacancy_df,
        left_on="RegionName", right_on="geography",
        how="inner", suffixes=("_rent", "_vacancy"),
    )
    logger.info("Merge result: %d rows", len(merged))
    return merged
