"""Integration tests — full pipeline validation."""

import pytest


class TestFullPipeline:
    """Integration tests requiring a running database."""

    @pytest.mark.skip(reason="Requires running PostGIS database")
    def test_ingestion_to_query(self):
        """Test: ingest data → store in DB → query via API."""
        # TODO: Implement when DB layer is fully connected
        pass

    @pytest.mark.skip(reason="Requires running PostGIS database")
    def test_geojson_boundaries_load(self):
        """Test: load boundary GeoJSON → store in PostGIS → serve via API."""
        # TODO: Implement when GeoJSON pipeline is connected
        pass
