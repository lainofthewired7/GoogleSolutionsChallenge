"""Database connection management."""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from ingestion.config import DATABASE_URL

engine = create_engine(DATABASE_URL, echo=False)
SessionLocal = sessionmaker(bind=engine)


def get_engine():
    """Return the SQLAlchemy engine."""
    return engine


def get_session():
    """Return a new database session."""
    return SessionLocal()
