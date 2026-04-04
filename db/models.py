"""SQLAlchemy + PostGIS database models."""

from sqlalchemy import Column, Integer, String, Float, Date, DateTime, Text, func
from sqlalchemy.orm import declarative_base
from geoalchemy2 import Geometry

Base = declarative_base()


class SubmarketBoundary(Base):
    __tablename__ = "submarket_boundaries"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    geo_type = Column(String(50))  # 'zip', 'tract', 'msa', 'custom'
    geo_code = Column(String(50), index=True)
    geometry = Column(Geometry("MULTIPOLYGON", srid=4326))
    created_at = Column(DateTime, server_default=func.now())


class Rent(Base):
    __tablename__ = "rents"

    id = Column(Integer, primary_key=True, autoincrement=True)
    date = Column(Date, nullable=False, index=True)
    geography = Column(String(50), index=True)
    median_rent = Column(Float)
    rent_index = Column(Float)
    source = Column(String(50))
    created_at = Column(DateTime, server_default=func.now())


class Permit(Base):
    __tablename__ = "permits"

    id = Column(Integer, primary_key=True, autoincrement=True)
    date = Column(Date, index=True)
    permit_type = Column(String(100))
    description = Column(Text)
    address = Column(String(255))
    location = Column(Geometry("POINT", srid=4326))
    source = Column(String(50))
    created_at = Column(DateTime, server_default=func.now())


class JobGrowth(Base):
    __tablename__ = "job_growth"

    id = Column(Integer, primary_key=True, autoincrement=True)
    date = Column(Date, nullable=False, index=True)
    geography = Column(String(100), index=True)
    employment = Column(Float)
    growth_rate = Column(Float)
    source = Column(String(50))
    created_at = Column(DateTime, server_default=func.now())


class Vacancy(Base):
    __tablename__ = "vacancy"

    id = Column(Integer, primary_key=True, autoincrement=True)
    year = Column(Integer, index=True)
    geography = Column(String(50), index=True)
    total_units = Column(Integer)
    vacant_units = Column(Integer)
    vacancy_rate = Column(Float)
    source = Column(String(50))
    created_at = Column(DateTime, server_default=func.now())


class Migration(Base):
    __tablename__ = "migration"

    id = Column(Integer, primary_key=True, autoincrement=True)
    year = Column(Integer, index=True)
    geography = Column(String(100), index=True)
    net_migration = Column(Integer)
    source = Column(String(50))
    created_at = Column(DateTime, server_default=func.now())
