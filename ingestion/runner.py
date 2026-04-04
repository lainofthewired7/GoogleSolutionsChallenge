"""Ingestion runner — orchestrates all data source fetches."""

import argparse
import logging
import sys

from ingestion import fred, census_acs, hud, zillow, permits, google_trends

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(name)s] %(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

SOURCES = {
    "fred": lambda: fred.fetch_series("AUSPOP"),
    "census": lambda: census_acs.fetch_acs_by_zip(state_fips="48"),
    "hud": lambda: hud.fetch_fair_market_rents(state_code="TX"),
    "zillow": lambda: zillow.fetch_rent_index(metro_filter="Austin"),
    "permits": lambda: permits.fetch_permits(),
    "trends": lambda: google_trends.fetch_trends(),
}


def run(market: str, sources: list[str] | None = None) -> dict:
    """Run ingestion for specified market and sources.

    Args:
        market: Target market identifier.
        sources: List of source names to ingest (default: all).

    Returns:
        Dict mapping source name to row count fetched.
    """
    targets = sources or list(SOURCES.keys())
    results = {}

    logger.info("Starting ingestion for market: %s", market)
    for name in targets:
        if name not in SOURCES:
            logger.warning("Unknown source: %s — skipping", name)
            continue
        try:
            df = SOURCES[name]()
            results[name] = len(df)
            logger.info("✓ %s: %d records", name, len(df))
            # TODO: Write to database via ETL layer
        except Exception:
            logger.exception("✗ %s: failed", name)
            results[name] = -1

    logger.info("Ingestion complete: %s", results)
    return results


def main():
    parser = argparse.ArgumentParser(description="Projectr Analytics — Data Ingestion")
    parser.add_argument("--market", default="austin", help="Target market (default: austin)")
    parser.add_argument("--source", help="Single source to ingest (default: all)")
    args = parser.parse_args()

    sources = [args.source] if args.source else None
    results = run(args.market, sources)

    if any(v == -1 for v in results.values()):
        sys.exit(1)


if __name__ == "__main__":
    main()
