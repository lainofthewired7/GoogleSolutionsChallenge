"""Unit tests for data ingestion modules."""

from unittest.mock import patch, MagicMock
import pandas as pd
import pytest


class TestFredIngestion:
    """Tests for the FRED API client."""

    @patch("ingestion.fred.requests.get")
    def test_fetch_series_returns_dataframe(self, mock_get):
        mock_response = MagicMock()
        mock_response.json.return_value = {
            "observations": [
                {"date": "2023-01-01", "value": "2300000"},
                {"date": "2023-02-01", "value": "2310000"},
            ]
        }
        mock_response.raise_for_status = MagicMock()
        mock_get.return_value = mock_response

        from ingestion.fred import fetch_series
        df = fetch_series("AUSPOP")

        assert isinstance(df, pd.DataFrame)
        assert len(df) == 2
        assert "date" in df.columns
        assert "value" in df.columns
        assert df["source"].iloc[0] == "fred"

    @patch("ingestion.fred.requests.get")
    def test_fetch_series_handles_non_numeric(self, mock_get):
        mock_response = MagicMock()
        mock_response.json.return_value = {
            "observations": [
                {"date": "2023-01-01", "value": "."},
            ]
        }
        mock_response.raise_for_status = MagicMock()
        mock_get.return_value = mock_response

        from ingestion.fred import fetch_series
        df = fetch_series("AUSPOP")

        assert pd.isna(df["value"].iloc[0])


class TestPermitsIngestion:
    """Tests for the building permits client."""

    @patch("ingestion.permits.requests.get")
    def test_fetch_permits_returns_dataframe(self, mock_get):
        mock_response = MagicMock()
        mock_response.json.return_value = [
            {"issue_date": "2024-01-15", "permit_type_desc": "New Construction"},
        ]
        mock_response.raise_for_status = MagicMock()
        mock_get.return_value = mock_response

        from ingestion.permits import fetch_permits
        df = fetch_permits(limit=10)

        assert isinstance(df, pd.DataFrame)
        assert len(df) == 1
        assert df["source"].iloc[0] == "austin_permits"
