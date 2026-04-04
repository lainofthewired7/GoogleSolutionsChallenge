"""Unit tests for ETL normalization and quality checks."""

import pandas as pd
import pytest
from etl.normalize import normalize_fred, normalize_permits
from etl.quality import check_nulls, check_outliers, check_temporal_consistency


class TestNormalizeFred:
    def test_output_columns(self, sample_fred_data):
        result = normalize_fred(sample_fred_data, market="austin")
        expected_cols = {"date", "metric", "value", "geography", "source"}
        assert set(result.columns) == expected_cols

    def test_geography_set_correctly(self, sample_fred_data):
        result = normalize_fred(sample_fred_data, market="austin")
        assert (result["geography"] == "austin").all()


class TestNormalizePermits:
    def test_column_renaming(self, sample_permits_data):
        result = normalize_permits(sample_permits_data)
        assert "date" in result.columns
        assert "lat" in result.columns
        assert "lon" in result.columns


class TestQualityChecks:
    def test_check_nulls_detects_missing(self):
        df = pd.DataFrame({"a": [1, None, 3], "b": [4, 5, 6]})
        warnings = check_nulls(df, ["a", "b"])
        assert len(warnings) == 1
        assert "a" in warnings[0]

    def test_check_nulls_no_issues(self):
        df = pd.DataFrame({"a": [1, 2, 3]})
        warnings = check_nulls(df, ["a"])
        assert len(warnings) == 0

    def test_check_outliers(self):
        df = pd.DataFrame({"val": [10, 11, 12, 10, 100]})
        result = check_outliers(df, "val", z_threshold=2.0)
        assert "is_outlier" in result.columns
        assert result["is_outlier"].sum() >= 1

    def test_temporal_consistency_gaps(self):
        df = pd.DataFrame({"date": ["2023-01-01", "2023-02-01", "2023-06-01"]})
        warnings = check_temporal_consistency(df)
        assert len(warnings) >= 1
