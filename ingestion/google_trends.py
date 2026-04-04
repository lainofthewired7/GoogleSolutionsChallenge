"""Google Trends data client via pytrends."""

import logging
import pandas as pd
from pytrends.request import TrendReq

logger = logging.getLogger(__name__)


def fetch_trends(keywords: list[str] | None = None, geo: str = "US-TX") -> pd.DataFrame:
    """Fetch Google Trends interest over time for real estate keywords.

    Args:
        keywords: Search terms (default: real estate related).
        geo: Geographic region code.

    Returns:
        DataFrame with weekly search interest.
    """
    if keywords is None:
        keywords = ["apartments Austin", "rent Austin TX", "homes for sale Austin"]

    logger.info("Fetching Google Trends for: %s (geo=%s)", keywords, geo)
    pytrends = TrendReq(hl="en-US", tz=360)
    pytrends.build_payload(keywords[:5], cat=0, timeframe="today 12-m", geo=geo)

    df = pytrends.interest_over_time()
    if not df.empty:
        df = df.drop(columns=["isPartial"], errors="ignore")
        df = df.reset_index()
        df["source"] = "google_trends"

    logger.info("Fetched %d trend data points", len(df))
    return df
