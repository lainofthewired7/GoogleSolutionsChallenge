---
description: Run the data ingestion pipeline to fetch and store market data
---

# Data Ingestion

## Steps

1. Ensure the database is running
```bash
docker-compose up -d db
```

2. Activate the virtual environment
```bash
source venv/bin/activate
```

// turbo
3. Run ingestion for the default market (Austin)
```bash
python -m ingestion.runner --market austin
```

4. To ingest a specific source only:
```bash
python -m ingestion.runner --market austin --source fred
python -m ingestion.runner --market austin --source census
python -m ingestion.runner --market austin --source hud
python -m ingestion.runner --market austin --source zillow
python -m ingestion.runner --market austin --source permits
python -m ingestion.runner --market austin --source trends
```

5. Verify ingestion results
```bash
python -c "from db.connection import get_engine; import pandas as pd; print(pd.read_sql('SELECT tablename FROM pg_tables WHERE schemaname=\'public\'', get_engine()))"
```
