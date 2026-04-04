"""Alembic migration environment stub."""

# TODO: Configure Alembic for schema migrations
# For now, use Base.metadata.create_all(engine) for initial setup

from db.models import Base
from db.connection import get_engine


def run_migrations():
    """Create all tables from models."""
    engine = get_engine()
    Base.metadata.create_all(engine)
    print("✓ All tables created.")


if __name__ == "__main__":
    run_migrations()
