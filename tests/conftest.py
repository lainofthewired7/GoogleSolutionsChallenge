"""Shared test fixtures."""

import pytest
import pandas as pd


@pytest.fixture
def sample_fred_data():
    """Sample FRED API response data."""
    return pd.DataFrame({
        "date": ["2023-01-01", "2023-02-01", "2023-03-01"],
        "value": [2300000, 2310000, 2320000],
        "source": ["fred"] * 3,
        "series_id": ["AUSPOP"] * 3,
    })


@pytest.fixture
def sample_census_data():
    """Sample Census ACS response data."""
    return pd.DataFrame({
        "zip code tabulation area": ["78701", "78702", "78703"],
        "total_housing_units": [15000, 12000, 8000],
        "vacant_housing_units": [750, 600, 400],
        "median_household_income": [85000, 72000, 95000],
        "median_gross_rent": [1800, 1500, 2100],
        "total_population": [32000, 28000, 18000],
        "source": ["census_acs"] * 3,
        "year": [2022] * 3,
    })


@pytest.fixture
def sample_permits_data():
    """Sample Austin building permit data."""
    return pd.DataFrame({
        "issue_date": ["2024-01-15", "2024-02-20", "2024-03-10"],
        "permit_type_desc": ["New Construction", "Remodel", "New Construction"],
        "work_description": ["SFR", "Commercial Remodel", "Multi-family"],
        "latitude": [30.27, 30.28, 30.25],
        "longitude": [-97.74, -97.73, -97.75],
        "source": ["austin_permits"] * 3,
    })
