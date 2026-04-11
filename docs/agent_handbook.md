# Agent Handbook — Collaborative Development

This document explains how multiple AI agents can work on different parts of **Indicium** independently and effectively.

## 1. Modular Architecture

The project is strictly modular. Each directory represents a distinct responsibility:

- **Ingestion (`ingestion/`)**: Focused on external APIs. An agent can add a new source (e.g., `redfin.py`) without touching the frontend.
- **ETL (`etl/`)**: Focused on data transformation. An agent can refine the `normalize.py` logic independent of the API.
- **Database (`db/`)**: The single source of truth for schemas. Changes here must be reflected in `models.py`.
- **API (`api/`)**: The bridge between data and UI. Defined by Pydantic schemas in `schemas.py`.
- **Dashboard (`dashboard/`)**: The client-side visualization. Interacts with the backend only through `js/api.js`.

## 2. Using the `.agent/` Directory

The `.agent/` directory is the "command center" for AI agents:
- **`agent.md`**: Provides the project identity, tech stack, and coding conventions. Agents should read this first.
- **`workflows/`**: Contains executable "recipes" (setup, ingest, serve, test). Agents can use these to quickly spin up tasks.

## 3. How to Assign Work

To get agents to work on specific parts, provide them with a focused objective and refer them to the relevant package:

### Example: Working on Ingestion
> "Agent, please add a new ingestion source for Redfin to the `ingestion/` package. Follow the pattern in `fred.py` and register it in `runner.py`."

### Example: Working on the Dashboard
> "Agent, please update the Google Maps layer in `dashboard/js/map.js` to support choropleth overlays for vacancy rates. Use the endpoint `/api/geojson/boundaries`."

## 4. Coordination via Interfaces

Agents coordinate through shared interfaces:
- **Database Models**: `db/models.py` defines the "contract" for storage.
- **API Schemas**: `api/schemas.py` defines the "contract" for data exchange.
- **Mocking**: Agents can use `tests/conftest.py` to create mock data, allowing them to work on the UI before the backend is finished.

## 5. Verification
Every agent should run the `/test` workflow after making changes. If tests pass in their specific module, they can be confident their work hasn't broken other parts of the system.
