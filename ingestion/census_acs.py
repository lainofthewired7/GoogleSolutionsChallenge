"""Census ACS (American Community Survey) API client."""

import logging
import requests
import pandas as pd
from ingestion.config import CENSUS_API_KEY, CENSUS_BASE_URL

logger = logging.getLogger(__name__)

# Key ACS variables for real estate analysis
ACS_VARIABLES = {
    "B25002_001E": "total_housing_units",
    "B25002_003E": "vacant_housing_units",
    "B19013_001E": "median_household_income",
    "B25064_001E": "median_gross_rent",
    "B01003_001E": "total_population",
}


def fetch_acs_by_zip(state_fips: str = "48", year: int = 2022) -> pd.DataFrame:
    """Fetch ACS 5-year estimates by zip code for a state.

    Args:
        state_fips: State FIPS code (e.g., '48' for Texas).
        year: ACS data year.

    Returns:
        DataFrame with housing, income, and demographic data by zip code.
    """
    variables = ",".join(ACS_VARIABLES.keys())
    url = f"{CENSUS_BASE_URL}/{year}/acs/acs5"
    params = {
        "get": f"NAME,{variables}",
        "for": "zip code tabulation area:*",
        "in": f"state:{state_fips}",
        "key": CENSUS_API_KEY,
    }

    logger.info("Fetching ACS data for state %s, year %d", state_fips, year)
    response = requests.get(url, params=params, timeout=60)
    response.raise_for_status()

    data = response.json()
    df = pd.DataFrame(data[1:], columns=data[0])
    df = df.rename(columns=ACS_VARIABLES)

    for col in ACS_VARIABLES.values():
        df[col] = pd.to_numeric(df[col], errors="coerce")

    df["source"] = "census_acs"
    df["year"] = year

    logger.info("Fetched ACS data for %d zip codes", len(df))
    return df
